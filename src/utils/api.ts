import axios from 'axios';
import config from '../../config.json';

// OTHER
export const getProjects = async () => {
  const { data } = await axios.get(
    `https://api.github.com/users/${config.social.github}/repos`,
  );
  return data;
};

export const getReadme = async () => {
  const { data } = await axios.get(config.readmeUrl);
  return data;
};

export const getWeather = async (city: string) => {
  try {
    const { data } = await axios.get(`https://wttr.in/${city}?ATm`);
    return data;
  } catch (error) {
    return error;
  }
};

export const getQuote = async () => {
  const { data } = await axios.get('https://api.quotable.io/random');
  return {
    quote: `“${data.content}” — ${data.author}`,
  };
};

export const getWordDefinition = async (word: string) => {
  const { data } = await axios.get(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
  );
  return data[0].meanings[0].definitions[0].definition;
};

export const getMeme = async () => {
  try {
    const { data } = await axios.get('https://meme-api.com/gimme');
    return {
      title: data.title,
      url: data.url,
      author: data.author,
      subreddit: data.subreddit,
    };
  } catch (error) {
    return null;
  }
};
