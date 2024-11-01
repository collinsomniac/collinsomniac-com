import { useState } from 'react';
import { History } from './interface';

export const useHistory = (initialHistory: History[] = []) => {
  const [history, setHistory] = useState<History[]>(initialHistory);
  const [command, setCommand] = useState<string>('');
  const [lastCommandIndex, setLastCommandIndex] = useState<number>(-1);

  const addHistoryEntry = (value: string) => {
    setHistory((prevHistory) => [
      ...prevHistory,
      {
        id: prevHistory.length,
        date: new Date(),
        command: command,
        output: value,
      },
    ]);
  };

  const clearHistory = () => {
    setHistory([]);
    setLastCommandIndex(-1);
  };

  return {
    history,
    command,
    lastCommandIndex,
    setHistory: addHistoryEntry,
    setCommand,
    setLastCommandIndex,
    clearHistory,
  };
};
