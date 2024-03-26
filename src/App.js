import axios from 'axios';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import Flashcard from './components/Flashcard';

const SOURCE =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTzOh48B6TCcx3ExlqzXs9Dcf7Z4792Q8IhJzE_uAd3hCx_-VF-o9DWwdJVcOaNqeE4hHlvSO9l4MOt/pub?gid=0&single=true&output=csv';

function App() {
  const [words, setWords] = useState([]);
  const [randomIndex, setRandomIndex] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    axios
      .get(SOURCE)
      .then((response) => {
        const csvData = response.data;
        Papa.parse(csvData, {
          header: true,
          complete: (result) => {
            setWords(result.data);
          },
          error: (error) => {
            console.error('Error parsing CSV: ', error);
          }
        });
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  const randomizeWord = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * words.length);
    } while (newIndex === randomIndex);

    setRandomIndex(newIndex);
    setShowAnswer(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  return (
    <div>
      {words.length > 0 && randomIndex !== null && (
        <Flashcard
          word={words[randomIndex]}
          showAnswer={showAnswer}
          handleShowAnswer={handleShowAnswer}
        />
      )}
      <button onClick={randomizeWord}>➡️</button>
      <hr />
      <a target="_blank" href="https://docs.google.com/spreadsheets/d/1QxzTnhYiBzeFxrF93FIrAyRAu9OeuiSDylt5gB4b2Ik/edit?usp=sharing">chỉnh sửa</a>
    </div>
  );
}

export default App;
