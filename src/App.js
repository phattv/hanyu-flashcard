import { Button, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import axios from "axios";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import Flashcard from "./components/Flashcard";

const SOURCE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzOh48B6TCcx3ExlqzXs9Dcf7Z4792Q8IhJzE_uAd3hCx_-VF-o9DWwdJVcOaNqeE4hHlvSO9l4MOt/pub?gid=0&single=true&output=csv";

function App() {
  const [words, setWords] = useState([]);
  const [randomIndex, setRandomIndex] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    axios
      .get(SOURCE)
      .then((response) => {
        const csvData = response.data;
        Papa.parse(csvData, {
          header: true,
          complete: (result) => {
            const parsedData = result.data;
            setWords(parsedData);
            setTotalWords(parsedData.length);
          },
          error: (error) => {
            console.error("Error parsing CSV: ", error);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
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
    setAnsweredCount(answeredCount + 1);
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
      <Button mt="xs" mb="xs" fullWidth onClick={randomizeWord}>
        ➡️
      </Button>
      <Text>
        Đã trả lời: {answeredCount} / {totalWords} &nbsp;
        <a
          target="_blank"
          href="https://docs.google.com/spreadsheets/d/1QxzTnhYiBzeFxrF93FIrAyRAu9OeuiSDylt5gB4b2Ik/edit?usp=sharing"
        >
          chỉnh sửa
        </a>
      </Text>
    </div>
  );
}

export default App;
