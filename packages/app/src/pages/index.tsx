import emordnilapWords from '@palindrome/data/emordnilap_words.json';
import palindromeWords from '@palindrome/data/palindrome_words.json';
import { NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';

palindromeWords.unshift('ekitike'); // Add 'ekitike' at the start

const HomePage: NextPage = () => {
  const [rotated, setRotated] = useState(false);
  const [wordIndex, setWordIndex] = useState(0); // Keep track of the current word index
  const [activeTab, setActiveTab] = useState<'palindromes' | 'emordnilaps'>(
    'palindromes',
  ); // Tab state

  // Set words list based on the active tab
  const words = activeTab === 'palindromes' ? palindromeWords : emordnilapWords;

  // Directly calculate the word here based on the current word index
  const word = words[wordIndex];

  const letters = word.split('');
  const centerIndex = Math.floor(letters.length / 2);

  // Each letter has a width of 4rem (16 * 1rem), and each gap is 1rem (gap-x-4)
  const letterWidth = 4; // 4rem (1rem = 16px)
  const gap = 1; // 1rem (gap-x-4 = 1rem)
  const totalWidth = letterWidth * letters.length + (letters.length - 1) * gap;

  const transformOrigin = `${totalWidth / 2}rem center`;

  // Function to handle keydown events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        // Move to the previous word (left arrow)
        setWordIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : words.length - 1,
        ); // Wrap around to the last word
      } else if (event.key === 'ArrowRight') {
        // Move to the next word (right arrow)
        setWordIndex((prevIndex) =>
          prevIndex < words.length - 1 ? prevIndex + 1 : 0,
        ); // Wrap around to the first word
      } else if (event.key === ' ') {
        // Space to rotate the word
        setRotated((prevRotated) => !prevRotated);
      }
    },
    [words.length],
  );

  // Add event listener for keydown (only on mount)
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }

  // Clean up event listener on component unmount
  const cleanUpKeyListener = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  // Call cleanup only when the component is unmounted
  useEffect(() => {
    return cleanUpKeyListener;
  }, [cleanUpKeyListener]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {/* Tab Navigation */}
      <div className="tabs mb-4">
        <div
          className={`tab tab-bordered ${activeTab === 'palindromes' ? 'tab-active' : ''}`}
          onClick={() => {
            setWordIndex(0);
            setActiveTab('palindromes');
          }}>
          Palindromes
        </div>
        <div
          className={`tab tab-bordered ${activeTab === 'emordnilaps' ? 'tab-active' : ''}`}
          onClick={() => {
            setWordIndex(0);
            setActiveTab('emordnilaps');
          }}>
          Emordnilaps
        </div>
      </div>

      {/* Displaying the current word */}
      <div
        className={`flex transform cursor-pointer gap-x-4 font-bold transition-transform duration-2000 ease-in-out ${
          rotated ? 'rotate-180' : ''
        }`}
        onClick={() => setRotated(!rotated)} // You can still click to toggle rotation
        style={{ transformOrigin }}>
        {letters.map((letter, index) => (
          <div
            key={index}
            className={`bg-primary-content flex aspect-square w-16 transform items-center justify-center rounded-full border text-center text-4xl uppercase transition-transform duration-2000 ease-in-out ${
              index === centerIndex ? 'text-primary' : 'text-secondary'
            } ${rotated ? '-rotate-180' : ''}`}>
            {letter}
          </div>
        ))}
      </div>

      {/* Key Instructions */}
      <p className="mt-4 text-lg opacity-70">
        Use Arrow Keys (← →) to navigate words, Spacebar to rotate.
      </p>
    </div>
  );
};

export default HomePage;
