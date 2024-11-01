// REGULAR COMMANDS
import * as bin from './index';
import config from '../../../config.json';
import themes from '../../../themes.json';
import AsciiTextAnimations from '../../components/animate/AsciiTextAnimations';
import { useFontSettings } from '../../components/animate/fontSettings';
import { useThreeDStore } from '../../stores/threeDStore';

// Core 3D/UI Toggle Functions
export const toggleElement = async (element: string): Promise<string> => {
  const store = useThreeDStore.getState();
  store.toggleElement(element);
  return `${element} toggled ${store[element] ? 'OFF' : 'ON'}.`;
};

export const _3d = () => toggleElement('showShapes');
export const computer = () => toggleElement('showComputerDesk');
export const imgvid = () => toggleElement('showPlane');
export const skull = () => {
  const { toggleElement } = useThreeDStore.getState();
  toggleElement('showTalkingSkull');
  toggleElement('showToneComponent');
  toggleElement('showPlane');
  return 'Skull toggled (skull,imgvid).';
};

export const ascii = (): string => {
  const event = new CustomEvent('toggleAsciiText');
  window.dispatchEvent(event);
  return 'Toggling ASCII text configuration...';
};

// ACTIVE COMMANDS
// Banner and Help
export const banner = (args?: string[]): string => {
  return `
      ┓┓•          •          
   ┏┏┓┃┃┓┏┓┏┏┓┏┳┓┏┓┓┏┓┏ ┏┏┓┏┳┓
   ┗┗┛┗┗┗┛┗┛┗┛┛┗┗┛┗┗┗┻┗•┗┗┛┛┗┗
\n\n\n
┌─────────────────┬────────────────────────────────┐
│ c o m m a n d : │    d e s c r i p t i o n :     │
├─────────────────┼────────────────────────────────┤
│   'help'        │ list all available commands.   │
│   'about'       │ read about me and this site.   │
│   'repo'        │ visit this site's GitHub repo. │
│   'credits'     │ list credited authors/devs.    │
└─────────────────┴────────────────────────────────┘
`;
};

export const help = async (args: string[]): Promise<string> => {
  const commands = Object.keys(bin).sort().join(', ');
  var c = '';
  for (let i = 1; i <= Object.keys(bin).sort().length; i++) {
    if (i % 7 === 0) {
      c += Object.keys(bin).sort()[i - 1] + '\n';
    } else {
      c += Object.keys(bin).sort()[i - 1] + ' ';
    }
  }
  return `
┌───────────────────────────────┬────────────────────────────────┐
│        c o m m a n d :        │     d e s c r i p t i o n :    │
├───────────────────────────────┼────────────────────────────────┤
│          s i t e :            │                                │
│   'help'                      │ list all available commands.   │
│   'about'                     │ read about me and this site.   │
│   'repo'                      │ visit this site's GitHub repo. │
│   'credits'                   │ list credited authors/devs.    │
│         s o c i a l :         │                                │
│   'instagram'                 │ visit my Instagram.            │
│   'soundcloud'                │ visit my SoundCloud.           │
│   'github'                    │ visit my GitHub.               │
│          s t u f f :          │                                │
│   'define ____'               │ define a word.                 │
│   'quote'                     │ get an inspirational quote.    │
│   'xreddit ____'              │ search Reddit.                 │
│         s e a r c h :         │                                │
│   'xgoogle ____'              │ search Google.                 │
│   'xbing ____'                │ search Bing.                   │
│   'xreddit ____'              │ search Reddit.                 │
└───────────────────────────────┴────────────────────────────────┘

               ┌───────────┬───────────────────────┐
               │  [tab]:   │ autocomplete command  │
               ├───────────┼───────────────────────┤
               │ [ctrl+l]: │ clear window          │
               └───────────┴───────────────────────┘
`;
};

// Active Site Commands
export const repo = async (args: string[]): Promise<string> => {
  window.open(`${config.site_urls.repo}`);
  return 'Opening site Github repository...';
};

export const credits = async (args: string[]): Promise<string> => {
  return `
┌───────────────────────────────┬────────────────────────────┐
│       r e s o u r c e :       │       c r e d i t s :      │
├───────────────────────────────┼────────────────────────────┤
│      c o r e   t e c h :      │                            │
│           <u><a href="https://github.com/Cveinnt/LiveTerm">LiveTerm</a></u>            │           <u><a href="https://github.com/cveinnt">Cveinnt</a></u>          │
│           <u><a href="https://nextjs.org/">Next.js</a></u>             │         <u><a href="https://github.com/vercel/next.js/">Vercel Team</a></u>        │
│            <u><a href="https://react.dev/">React</a></u>              │       <u><a href="https://github.com/facebook/react">React Core Team</a></u>      │
│          <u><a href="https://github.com/microsoft/TypeScript">TypeScript</a></u>           │       <u><a href="https://github.com/microsoft">Microsoft Team</a></u>       │
│           <u><a href="https://github.com/Tonejs/Tone.js">Tone.js</a></u>             │        <u><a href="https://github.com/Tonejs/">Tone.js Team</a></u>        │
│       <u><a href="https://github.com/jberg/butterchurn">ButterChurn Viz 2</a></u>       │      <u><a href="https://github.com/jberg/">ButterChurn Team</a></u>      │
│                               │                            │
│          a s c i i :          │                            │
│    <u><a href="https://github.com/AndrewSink/STL-to-ASCII-Generator">STL-to-ASCII Generator</a></u>     │        <u><a href="https://github.com/AndrewSink/">Andrew Sink</a></u>         │
│       <u><a href="https://github.com/samuelweckstrom/react-ascii-text">React ASCII Text</a></u>        │      <u><a href="https://github.com/samuelweckstrom/">Samuel Weckström</a></u>      │
│      <u><a href="https://github.com/emilwidlund/ASCII/blob/main/src/index.ts">React ASCII Shader</a></u>       │        <u><a href="https://github.com/emilwidlund">Emil Widlund</a></u>        │
│      <u><a href="https://github.com/mrdoob/three.js/blob/master/examples/webgl_effects_ascii.html">ASCIIEffect Shader</a></u>       │       <u><a href="https://threejs.org/about/">Three.js Team</a></u>        │
│         <u><a href="http://www.figlet.org/">FIGlet Fonts</a></u>          │    <u><a href="https://github.com/cmatsuoka/figlet">FIGlet Contributors</a></u>     │
│                               │                            │
│       3 d   t o o l s :       │                            │
│           <u><a href="https://threejs.org/">Three.js</a></u>            │       <u><a href="https://github.com/mrdoob/three.js/">Three.js Team</a></u>        │
│       <u><a href="https://r3f.docs.pmnd.rs/getting-started/introduction">react-three-fiber</a></u>       │      <u><a href="https://github.com/pmndrs/react-three-fiber">Poimandres Team</a></u>       │
│             <u><a href="https://drei.docs.pmnd.rs/getting-started/introduction">Drei</a></u>              │      <u><a href="https://github.com/pmndrs/drei">Poimandres Team</a></u>       │
│        <u><a href="https://react-postprocessing.docs.pmnd.rs/">Postprocessing</a></u>         │      <u><a href="https://github.com/pmndrs/react-postprocessing">Poimandres Team</a></u>       │
│           <u><a href="https://zustand.docs.pmnd.rs/getting-started/introduction">Zustand</a></u>             │      <u><a href="https://github.com/pmndrs/zustand">Poimandres Team</a></u>       │
│         <u><a href="https://www.react-spring.dev/">react-spring</a></u>          │      <u><a href="https://github.com/pmndrs/react-spring">Poimandres Team</a></u>       │
│                               │                            │
│      3 d   a s s e t s :      │                            │
│          <u><a href="https://sketchfab.com/3d-models/human-skull-b0251e48e906418ebae34b7f811ca065">Skull Model</a></u>          │       <u><a href="https://sketchfab.com/sergeydog">Sergey Egelsky</a></u>       │
│         <u><a href="https://sketchfab.com/3d-models/ibm-tandy-1000-36e62f658e184874a957b50732e85148">Computer Model</a></u>        │          <u><a href="https://www.freepoly.org/">Freepoly</a></u>          │
│         <u><a href="https://sketchfab.com/3d-models/old-ass-computer-speakers-29899915c2b94ca88dae08e11aa9d844">Speakers Model</a></u>        │          <u><a href="https://sketchfab.com/skeeyee">skeeyee</a></u>           │
│           <u><a href="https://sketchfab.com/3d-models/old-desk-04-freepolyorg-f035ad0da16b4a6d82c287687caeea94">Desk Model</a></u>          │          <u><a href="https://www.freepoly.org/">Freepoly</a></u>          │
│          <u><a href="https://sketchfab.com/3d-models/chair-5e357627f6794370a167e3331e2424b8">Chair Model</a></u>          │          <u><a href="https://sketchfab.com/MoraAzul">MoraAzul</a></u>          │
│         <u><a href="https://sketchfab.com/3d-models/cushion-abeafbc37d6446058e1be53e67e0baef">Cushion Model</a></u>         │         <u><a href="https://sketchfab.com/joelgodin">Joel Godin</a></u>         │
│                               │                            │
│      d e v   t o o l s :      │                            │
│            <u><a href="https://eslint.org/">ESLint</a></u>             │        <u><a href="https://github.com/eslint/eslint">ESLint Team</a></u>         │
│           <u><a href="https://prettier.io/">Prettier</a></u>            │       <u><a href="https://github.com/prettier/prettier">Prettier Team</a></u>        │
│         <u><a href="https://tailwindcss.com/">Tailwind CSS</a></u>          │       <u><a href="https://github.com/tailwindlabs/tailwindcss">Tailwind Labs</a></u>        │
│            <u><a href="https://postcss.org/">PostCSS</a></u>            │        <u><a href="https://github.com/postcss/postcss">PostCSS Team</a></u>        │
│             <u><a href="https://github.com/typicode/husky">Husky</a></u>             │          <u><a href="https://github.com/typicode">typicode</a></u>          │
│                               │                            │
│    a i   f e a t u r e s :    │                            │
│         <u><a href="https://sdk.vercel.ai/docs/introduction">Vercel AI SDK</a></u>         │        <u><a href="https://github.com/vercel/ai">Vercel Team</a></u>         │
│          <u><a href="https://elevenlabs.io/">ElevenLabs</a></u>           │      <u><a href="https://github.com/elevenlabs">ElevenLabs Team</a></u>       │
│       <u><a href="https://ai.meta.com/blog/meta-llama-3-1/">Meta Llama 3.1-70B</a></u>      │            <u><a href="https://github.com/meta-llama/llama3">Meta</a></u>            │
│           <u><a href="https://console.groq.com/docs/libraries">Groq SDK</a></u>            │            <u><a href="https://console.groq.com/docs/overview">Groq</a></u>            │
└───────────────────────────────┴────────────────────────────┘`;
};

// Active Social Commands
export const email = async (args: string[]): Promise<string> => {
  window.open(`mailto:${config.email}`);
  return `Opening mailto:${config.email}...`;
};

export const github = async (args: string[]): Promise<string> => {
  window.open(`https://github.com/${config.social.github}/`);
  return 'Opening GitHub profile...';
};

export const instagram = async (args: string[]): Promise<string> => {
  window.open(`https://instagram.com/${config.social.instagram}/`);
  return 'Opening Instagram profile...';
};

export const soundcloud = async (args: string[]): Promise<string> => {
  window.open(`https://soundcloud.com/${config.social.soundcloud}/`);
  return 'Opening SoundCloud profile...';
};

// Active Search Commands
export const xgoogle = async (args: string[]): Promise<string> => {
  window.open(`https://google.com/search?q=${args.join(' ')}`);
  return `Searching Google for ${args.join(' ')}...`;
};

export const xbing = async (args: string[]): Promise<string> => {
  window.open(`https://bing.com/search?q=${args.join(' ')}`);
  return `Bing huh? Something for everyone I guess. Searching Bing for ${args.join(
    ' ',
  )}...`;
};

export const xreddit = async (args: string[]): Promise<string> => {
  window.open(`https://www.reddit.com/search/?q=${args.join(' ')}`);
  return `Searching Reddit for ${args.join(' ')}...`;
};

// Active System Commands
export const echo = async (args: string[]): Promise<string> => {
  return args.join(' ');
};

export const whoami = async (args: string[]): Promise<string> => {
  return `${config.ps1_username}`;
};

export const date = async (args: string[]): Promise<string> => {
  return new Date().toString();
};

// Theme Command
export const theme = async (
  args: string[],
  setTheme: (theme: { themeName: string; variantName: string }) => void,
): Promise<string> => {
  let themeName: string | undefined;
  let variantName: 'light' | 'dark' = 'dark';

  // determine the theme name and variant from the arguments
  if (args.length === 0) {
    // if no arguments, display both light and dark variants
  } else if (args.length === 1) {
    if (args[0] === 'light' || args[0] === 'dark') {
      variantName = args[0] as 'light' | 'dark';
    } else {
      themeName = args[0];
    }
  } else {
    const variantIndex = args.findIndex(
      (arg) => arg === 'light' || arg === 'dark',
    );
    if (variantIndex !== -1) {
      variantName = args[variantIndex] as 'light' | 'dark';
      themeName = args.filter((arg) => arg !== 'light' && arg !== 'dark')[0];
    } else {
      themeName = args[0];
      variantName = args[1] as 'light' | 'dark';
    }
  }

  if (!themeName) {
    // list themes with color-coding for both light and dark variants
    const lightThemes = `\n<h3 style="margin-bottom: 10px;">light themes</h3>${Object.keys(
      themes,
    )
      .map((name) => {
        const themeColors = Object.values(themes[name].light);
        const colorCodedName = name
          .split('')
          .map((char, i) => {
            const color = themeColors[i % themeColors.length];
            return `<span style="color:${color}; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);">${char}</span>`;
          })
          .join('');
        const colorCodedVariantName = `<span style="color:lightgray;">light</span>`;
        return `${colorCodedName} ${colorCodedVariantName}<br>`;
      })
      .join('')}`;

    const darkThemes = `\n<h3 style="margin-bottom: 10px;">dark themes</h3>${Object.keys(
      themes,
    )
      .map((name) => {
        const themeColors = Object.values(themes[name].dark);
        const colorCodedName = name
          .split('')
          .map((char, i) => {
            const color = themeColors[i % themeColors.length];
            return `<span style="color:${color}; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);">${char}</span>`;
          })
          .join('');
        const colorCodedVariantName = `<span style="color:dimgray;">dark</span>`;
        return `${colorCodedName} ${colorCodedVariantName}<br>`;
      })
      .join('')}\n`;

    return `<div style="display: inline-flex; gap: 30px;">
              <div>${lightThemes}</div>
              <div>${darkThemes}</div>
            </div>
┌────────────────────────────────────────┐
│  type 'theme' and your desired theme!  │  
│  the default theme is 'grayscale dark' │
└────────────────────────────────────────┘
\n`;
  } else {
    // apply color-coding to themeName and variantName
    const themeColors = Object.values(
      themes[themeName]?.[variantName] || themes[themeName]?.dark,
    );
    const colorCodedThemeName = themeName
      .split('')
      .map((char, i) => {
        const color = themeColors[i % themeColors.length];
        return `<span style="color:${color}; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);">${char}</span>`;
      })
      .join('');
    const colorCodedVariantName = `<span style="color:${
      variantName === 'light' ? 'lightgray' : 'dimgray'
    };">${variantName}</span>`;

    setTheme({ themeName, variantName });
    return `theme changed to ${colorCodedThemeName} ${colorCodedVariantName}`;
  }
};

// COMMANDS UNDER DEVELOPMENT
/*
// Site URLs
export const blog = async (args: string[]): Promise<string> => {
  window.open(`${config.site_urls.blog}`);
  return 'Opening "blog.collinsomniac.com"...';
};

export const art = async (args: string[]): Promise<string> => {
  window.open(`${config.site_urls.art}`);
  return 'Opening "art.collinsomniac.com"...';
};

export const music = async (args: string[]): Promise<string> => {
  window.open(`${config.site_urls.music}`);
  return 'Opening "music.collinsomniac.com"...';
};

export const writing = async (args: string[]): Promise<string> => {
  window.open(`${config.site_urls.writing}`);
  return 'Opening "writing.collinsomniac.com"...';
};

export const files = async (args: string[]): Promise<string> => {
  window.open(`${config.site_urls.files}`);
  return 'Opening "files.collinsomniac.com"...';
};

export const type = async (args: string[]): Promise<string> => {
  window.open(`${config.site_urls.type}`);
  return 'Opening "type.collinsomniac.com"...';
};

export const chat = async (args: string[]): Promise<string> => {
  window.open(`${config.site_urls.chat}`);
  return 'Opening "chat.collinsomniac.com"...';
};

export const links = async (args: string[]): Promise<string> => {
  window.open(`${config.site_urls.links}`);
  return 'Opening "links.collinsomniac.com"...';
};

// Social Media
export const reddit = async (args: string[]): Promise<string> => {
  window.open(`https://www.reddit.com/user/${config.social.reddit}/`);
  return 'Opening Reddit profile...';
};

export const medium = async (args: string[]): Promise<string> => {
  window.open(`https://www.medium.com/@${config.social.medium}/`);
  return 'Opening Medium profile...';
};

export const huggingface = async (args: string[]): Promise<string> => {
  window.open(`https://huggingface.co/${config.social.huggingface}/`);
  return 'Opening Huggingface profile...';
};

export const kofi = async (args: string[]): Promise<string> => {
  window.open(`https://ko-fi.com/${config.social.kofi}/`);
  return 'Opening Ko-fi profile...';
};

export const patreon = async (args: string[]): Promise<string> => {
  window.open(`https://www.patreon.com/${config.social.patreon}/`);
  return 'Opening Patreon profile...';
};

// Additional Search Commands
export const xduckduckgo = async (args: string[]): Promise<string> => {
  window.open(`https://duckduckgo.com/?q=${args.join(' ')}`);
  return `Searching DuckDuckGo for ${args.join(' ')}...`;
};

export const xecosia = async (args: string[]): Promise<string> => {
  window.open(`https://www.ecosia.org/search?q=${args.join(' ')}`);
  return `Searching Ecosia for ${args.join(' ')}... 'guest' planted a tree!`;
};

// System Commands
export const ls = async (args: string[]): Promise<string> => {
  return `a\nbunch\nof\nfake\ndirectories`;
};

export const cd = async (args: string[]): Promise<string> => {
  return `bash: cd: /COLLINSOMNIAC.COM: No such file or directory`;
};

// Donation
export const donate = async (args: string[]): Promise<string> => {
  return `Thank you for your interest in my work! 
Here are ways you can support me and my projects:
- <u><a class="text-light-blue dark:text-dark-blue underline" href="${config.social.kofi}" target="_blank">kofi</a></u>
- <u><a class="text-light-blue dark:text-dark-blue underline" href="${config.social.patreon}" target="_blank">patreon</a></u>
`;
};
*/
