// API COMMANDS
import { getProjects, getWordDefinition } from '../api';
import { getQuote } from '../api';
import { getReadme } from '../api';
import { getWeather } from '../api';
import { getMeme } from '../api';

export const projects = async (args: string[]): Promise<string> => {
  const projects = await getProjects();
  return projects
    .map(
      (repo) =>
        `${repo.name} - <a class="text-light-blue dark:text-dark-blue underline" href="${repo.html_url}" target="_blank">${repo.html_url}</a>`,
    )
    .join('\n');
};

export const quote = async (args: string[]): Promise<string> => {
  const data = await getQuote();
  return data.quote;
};

export const define = async (args: string[]): Promise<string> => {
  if (args.length === 0) {
    return '"define [word]" - (ex: define skull)';
  }
  const word = args[0];
  const data = await getWordDefinition(word);
  return data;
};

export const readme = async (args: string[]): Promise<string> => {
  const readme = await getReadme();
  return `Opening GitHub README...\n
  ${readme}`;
};

export const weather = async (args: string[]): Promise<string> => {
  const city = args.join('+');
  if (!city) {
    return 'Usage: weather [city]. Example: weather casablanca';
  }
  const weather = await getWeather(city);
  return weather;
};

export const meme = async (args: string[]): Promise<string> => {
  const meme = await getMeme();
  if (!meme) return 'Experiencing meme interference...';

  return `
<div class="meme-container">
  <p class="meme-title">${meme.title}</p>
  <img 
    src="${meme.url}" 
    alt="${meme.title}"
    style="max-width: 500px; max-height: 500px; margin: 10px 0;"
    onload="this.parentElement.parentElement.scrollIntoView({ behavior: 'smooth', block: 'end' })"
  />
  <p class="meme-credit">Posted by ${meme.author} in r/${meme.subreddit}</p>
</div>
`;
};
