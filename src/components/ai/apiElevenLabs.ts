export const useElevenLabsAPI = () => {
  const generateSpeech = async (text: string): Promise<Blob> => {
    try {
      // console.log('Sending request to text-to-speech API');
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      // console.error('Error generating speech:', error);
      throw error;
    }
  };

  return { generateSpeech };
};
