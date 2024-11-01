import React from 'react';
import '../styles/global.css';
import Head from 'next/head';
import { useThreeDStore } from '../stores/threeDStore';

const App = ({ Component, pageProps }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { showEngine } = useThreeDStore();

  const onClickAnywhere = (event: React.MouseEvent) => {
    // Focus the input only if the ThreeDEngine is not shown or if it's a canvas click
    if (
      !showEngine ||
      (event.target as HTMLElement).tagName.toLowerCase() === 'canvas'
    ) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, viewport-fit=cover"
          key="viewport"
          maximum-scale="1"
        />
      </Head>
      <div
        className="text-light-foreground dark:text-dark-foreground min-w-max text-xs md:min-w-full md:text-base"
        onClick={onClickAnywhere}
      >
        <main className="bg-light-background dark:bg-dark-background w-full h-full">
          <Component {...pageProps} inputRef={inputRef} />
        </main>
      </div>
    </>
  );
};

export default App;
