/* eslint-disable prettier/prettier */
import {
  CanvasTexture,
  Color,
  NearestFilter,
  RepeatWrapping,
  Texture,
  Uniform,
} from 'three';
import { Effect } from 'postprocessing';
import * as THREE from 'three';
import { Vector2 } from 'three';

const fragment = `
uniform sampler2D uCharacters;                // Texture containing ASCII characters
uniform float uCharactersCount;               // Total number of characters
uniform float uCellSize;                      // Size of each ASCII cell
uniform bool uInvert;                         // Flag to invert grayscale
uniform vec3 uColor;                          // Color of ASCII characters
uniform vec3 uBackgroundColor;                // Background color
uniform float uBackgroundVisibility;          // Visibility of background
uniform float uCharactersVisibility;          // Visibility of characters
uniform bool uShowBackground;                 // Toggle background display
uniform bool uUseCanvasColor;                 // Toggle using canvas color
uniform vec3 uCanvasColor;                    // Canvas color if enabled
uniform vec2 resolution;                      // Resolution of the viewport

const vec2 SIZE = vec2(16.);                   // Size parameter for character grid

// Function to convert color to greyscale with adjustable strength
vec3 greyscale(vec3 color, float strength) {
    float g = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(g), strength);      // Blend original color with greyscale
}

// Overloaded greyscale function with default strength
vec3 greyscale(vec3 color) {
    return greyscale(color, 1.0);
}

// Main rendering function
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Grid calculation: Determine cell size based on resolution and cellSize uniform
    vec2 cell = resolution / uCellSize;
    vec2 grid = 1.0 / cell;
    vec2 pixelizedUV = grid * (0.5 + floor(uv / grid));
    
    // Sample the input texture at the pixelized UV coordinates
    vec4 pixelized = texture2D(inputBuffer, pixelizedUV);
    float greyscaled = greyscale(pixelized.rgb).r;

    // Inversion based on uInvert uniform
    greyscaled = mix(greyscaled, 1.0 - greyscaled, float(uInvert));

    // Character selection based on greyscaled value
    float characterIndex = floor((uCharactersCount - 1.0) * greyscaled);
    vec2 characterPosition = vec2(mod(characterIndex, SIZE.x), floor(characterIndex / SIZE.y));
    vec2 offset = vec2(characterPosition.x, -characterPosition.y) / SIZE;
    vec2 charUV = mod(uv * (cell / SIZE), 1.0 / SIZE) - vec2(0., 1.0 / SIZE) + offset;
    vec4 asciiCharacter = texture2D(uCharacters, charUV);

    float characterValue = asciiCharacter.r;

    // Color blending between character color and sampled scene color
    vec3 sampledColor = pixelized.rgb;
    vec3 asciiColor = mix(uColor.rgb, sampledColor, float(uUseCanvasColor)) * characterValue;
    float characterAlpha = characterValue * uCharactersVisibility;

    // Background handling
    float bgAlpha = uBackgroundVisibility * float(uShowBackground);
    vec3 bgColor = mix(uBackgroundColor.rgb, uCanvasColor.rgb, float(uUseCanvasColor));

    // Final color composition based on background toggle
    vec3 finalColor;
    float finalAlpha;

    if (uShowBackground) {
        finalColor = mix(bgColor, asciiColor, characterAlpha);
        finalAlpha = max(bgAlpha, characterAlpha);
    } else {
        finalColor = asciiColor;
        finalAlpha = characterAlpha;
    }

    outputColor = vec4(finalColor, finalAlpha); // Output the final color to the fragment
}
`;

export interface IASCIIEffectProps {
  characters?: string;
  fontSize?: number;
  cellSize?: number;
  color?: string;
  backgroundColor?: string;
  invert?: boolean;
  backgroundVisibility?: number;
  charactersVisibility?: number;
  showBackground?: boolean;
  useCanvasColor?: boolean;
  canvasColor?: string;
}

const MAX_CACHE_SIZE = 2; // Maximum number of textures to keep in cache
const TEXTURE_LIFETIME = 60000; // Texture lifetime in milliseconds (1 minute)

// Reuse a single canvas instance
const sharedCanvas = document.createElement('canvas');
const sharedContext = sharedCanvas.getContext('2d')!;

export class ASCIIEffect extends Effect {
  private textureCache: Map<
    string,
    { texture: THREE.Texture; lastUsed: number }
  > = new Map();
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private updateTimeoutId: NodeJS.Timeout | null = null;
  private resolution: Vector2;

  constructor({
    characters = ` .-:;=+*#%@`,
    fontSize = 64,
    cellSize = 5,
    color = '#ffffff',
    backgroundColor = '#000000',
    invert = false,
    backgroundVisibility = 1.0,
    charactersVisibility = 1.0,
    showBackground = true,
    useCanvasColor = false, // Default value for using canvas color
    canvasColor = '#ff0000', // Default canvas color
  }: IASCIIEffectProps = {}) {
    const uniforms = new Map<string, Uniform>([
      ['uCharacters', new Uniform(new Texture())],
      ['uCellSize', new Uniform(cellSize)],
      ['uCharactersCount', new Uniform(characters.length)],
      ['uColor', new Uniform(new Color(color))],
      ['uBackgroundColor', new Uniform(new Color(backgroundColor))],
      ['uInvert', new Uniform(invert)],
      ['uBackgroundVisibility', new Uniform(backgroundVisibility)],
      ['uCharactersVisibility', new Uniform(charactersVisibility)],
      ['uShowBackground', new Uniform(showBackground)],
      ['uUseCanvasColor', new Uniform(useCanvasColor)],
      ['uCanvasColor', new Uniform(new Color(canvasColor))],
      ['resolution', new Uniform(new Vector2(1, 1))], // Add this line
    ]);

    super('ASCIIEffect', fragment, { uniforms });

    // Use shared canvas instead of creating a new one
    this.canvas = sharedCanvas;
    this.context = sharedContext;

    const charactersTextureUniform = this.uniforms.get('uCharacters');
    if (charactersTextureUniform) {
      charactersTextureUniform.value = this.createCharactersTexture(
        characters,
        fontSize,
      );
    }

    // Add resolution uniform
    uniforms.set('resolution', new Uniform(this.resolution));

    this.resolution = new Vector2(1, 1); // Initialize with default values

    setInterval(() => this.cleanupTextures(), 5000); // Check every 5 seconds
  }

  private cleanupTextures() {
    const now = Date.now();
    const texturesToRemove: string[] = [];

    // Identify old textures
    this.textureCache.forEach((value, key) => {
      if (now - value.lastUsed > TEXTURE_LIFETIME) {
        texturesToRemove.push(key);
      }
    });

    // Remove old textures
    texturesToRemove.forEach((key) => {
      const texture = this.textureCache.get(key)?.texture;
      if (texture) {
        texture.dispose();
      }
      this.textureCache.delete(key);
    });

    // If still over the limit, remove least recently used
    if (this.textureCache.size > MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.textureCache.entries()).sort(
        (a, b) => b[1].lastUsed - a[1].lastUsed,
      );

      for (let i = MAX_CACHE_SIZE; i < sortedEntries.length; i++) {
        const [key, value] = sortedEntries[i];
        value.texture.dispose();
        this.textureCache.delete(key);
      }
    }
  }

  public createCharactersTexture(
    characters: string,
    fontSize: number,
  ): THREE.Texture {
    const cacheKey = `${characters}_${fontSize}`;
    const cachedItem = this.textureCache.get(cacheKey);

    if (cachedItem) {
      cachedItem.lastUsed = Date.now();
      return cachedItem.texture;
    }

    const SIZE = 1024;
    const MAX_PER_ROW = 16;
    const CELL = SIZE / MAX_PER_ROW;

    this.canvas.width = this.canvas.height = SIZE;

    this.context.clearRect(0, 0, SIZE, SIZE);
    this.context.font = `${fontSize}px arial`;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillStyle = '#fff';

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const x = i % MAX_PER_ROW;
      const y = Math.floor(i / MAX_PER_ROW);

      this.context.fillText(char, x * CELL + CELL / 2, y * CELL + CELL / 2);
    }

    // Reuse existing texture if possible
    let texture = this.textureCache.get(cacheKey)?.texture;
    if (!texture) {
      texture = new CanvasTexture(
        this.canvas,
        undefined,
        RepeatWrapping,
        RepeatWrapping,
        NearestFilter,
        NearestFilter,
      );
    }

    // Update the texture
    texture.needsUpdate = true;
    this.textureCache.set(cacheKey, { texture, lastUsed: Date.now() });

    // Cleanup if cache is full
    if (this.textureCache.size > MAX_CACHE_SIZE) {
      this.cleanupTextures();
    }

    return texture;
  }

  public updateUniforms(props: Partial<IASCIIEffectProps>) {
    // Batch uniform updates
    const updates: Record<string, any> = {};

    if (props.cellSize !== undefined) updates.uCellSize = props.cellSize;
    if (props.color !== undefined) updates.uColor = new Color(props.color);
    if (props.backgroundColor !== undefined)
      updates.uBackgroundColor = new Color(props.backgroundColor);
    if (props.invert !== undefined) updates.uInvert = props.invert;
    if (props.backgroundVisibility !== undefined)
      updates.uBackgroundVisibility = props.backgroundVisibility;
    if (props.charactersVisibility !== undefined)
      updates.uCharactersVisibility = props.charactersVisibility;
    if (props.showBackground !== undefined)
      updates.uShowBackground = props.showBackground;
    if (props.useCanvasColor !== undefined)
      updates.uUseCanvasColor = props.useCanvasColor;
    if (props.canvasColor !== undefined)
      updates.uCanvasColor = new Color(props.canvasColor);

    // Apply batched updates
    Object.entries(updates).forEach(([key, value]) => {
      const uniform = this.uniforms.get(key);
      if (uniform) uniform.value = value;
    });

    if (props.characters !== undefined || props.fontSize !== undefined) {
      this.debouncedUpdateTexture(props.characters, props.fontSize);
    }
  }

  private debouncedUpdateTexture(characters?: string, fontSize?: number) {
    if (this.updateTimeoutId) {
      clearTimeout(this.updateTimeoutId);
    }

    this.updateTimeoutId = setTimeout(() => {
      const charactersTextureUniform = this.uniforms.get('uCharacters');
      if (charactersTextureUniform) {
        charactersTextureUniform.value = this.createCharactersTexture(
          characters ||
            (charactersTextureUniform.value as THREE.Texture).userData
              .characters,
          fontSize ||
            (charactersTextureUniform.value as THREE.Texture).userData.fontSize,
        );
      }
      this.updateTimeoutId = null;
    }, 300);
  }

  public updateTexture(characters: string, fontSize: number): void {
    this.debouncedUpdateTexture(characters, fontSize);
  }

  public setSize(width: number, height: number): void {
    this.resolution.set(width, height);
    this.uniforms.get('resolution')!.value = this.resolution; // Update the uniform value
  }

  public dispose() {
    // Dispose all textures when the effect is no longer needed
    this.textureCache.forEach(({ texture }) => texture.dispose());
    this.textureCache.clear();
    super.dispose();
  }
}
