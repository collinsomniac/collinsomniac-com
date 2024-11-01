import React from 'react';
import { History as HistoryInterface } from './interface';
import { Ps1 } from '../Ps1';

interface HistoryProps {
  history: HistoryInterface[];
}

export const History: React.FC<HistoryProps> = ({ history }) => {
  return (
    <>
      {history.map((entry: HistoryInterface) => (
        <div key={`${entry.id}-${entry.date.getTime()}`}>
          <div className="flex flex-row space-x-2">
            <div className="flex-shrink">
              <Ps1 />
            </div>
            <div className="flex-grow">
              <pre dangerouslySetInnerHTML={{ __html: entry.command }} />
            </div>
          </div>
          <pre
            className="whitespace-pre-wrap mb-2"
            style={{ lineHeight: 'normal' }}
            dangerouslySetInnerHTML={{ __html: entry.output }}
          />
        </div>
      ))}
    </>
  );
};
