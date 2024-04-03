import { Button, Container, Group, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import axios from "axios";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import Flashcard from "./components/Flashcard";

const SOURCE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzOh48B6TCcx3ExlqzXs9Dcf7Z4792Q8IhJzE_uAd3hCx_-VF-o9DWwdJVcOaNqeE4hHlvSO9l4MOt/pub?gid=0&single=true&output=csv";

function App() {
  const [words, setWords] = useState([]);
  const [usedIndices, setUsedIndices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);

  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
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
    if (usedIndices.length === totalWords) {
      // If all words have been shown, reset the used indices array
      setUsedIndices([]);
      setCorrectCount(0);
      setIncorrectCount(0);
    }

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * totalWords);
    } while (usedIndices.includes(newIndex));

    setUsedIndices([...usedIndices, newIndex]);
    setCurrentIndex(newIndex);

    setIsAnswerShown(false);
    setCanNext(false);
  };

  const handleShowAnswer = (result) => {
    setIsAnswerShown(true);
    setCanNext(true);

    if (result) {
      setCorrectCount(correctCount + 1);
    } else {
      setIncorrectCount(incorrectCount + 1);
    }
  };

  return (
    <Container>
      {words.length > 0 && currentIndex !== null && (
        <Flashcard
          word={words[currentIndex]}
          isAnswerShown={isAnswerShown}
          handleShowAnswer={handleShowAnswer}
        />
      )}
      <Button
        mt="xs"
        mb="xs"
        fullWidth
        onClick={randomizeWord}
        disabled={!canNext}
      >
        Tiếp theo&nbsp;➡️
      </Button>
      <Group justify="space-around">
        <Text>{correctCount} 👍</Text>
        <Text>
          {correctCount + incorrectCount + 1} / {totalWords}
        </Text>
        <Text>{incorrectCount} 👎</Text>
      </Group>
      <a
        rel="noreferrer noopener"
        target="_blank"
        href="https://docs.google.com/spreadsheets/d/1QxzTnhYiBzeFxrF93FIrAyRAu9OeuiSDylt5gB4b2Ik/edit?usp=sharing"
      >
        chỉnh sửa
      </a>
    </Container>
  );
}

export default App;
