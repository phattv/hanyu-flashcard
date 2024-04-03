import { Button, Container, Group, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import axios from "axios";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import Flashcard from "./components/Flashcard";

const SOURCE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzOh48B6TCcx3ExlqzXs9Dcf7Z4792Q8IhJzE_uAd3hCx_-VF-o9DWwdJVcOaNqeE4hHlvSO9l4MOt/pub?gid=0&single=true&output=csv";

function App() {
  const [words, setWords] = useState(() => {
    const savedWords = localStorage.getItem("words");
    return savedWords ? JSON.parse(savedWords) : [];
  });

  const [usedIndices, setUsedIndices] = useState(() => {
    const savedUsedIndices = localStorage.getItem("usedIndices");
    return savedUsedIndices ? JSON.parse(savedUsedIndices) : [];
  });

  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedCurrentIndex = localStorage.getItem("currentIndex");
    return savedCurrentIndex !== null ? JSON.parse(savedCurrentIndex) : null;
  });

  const [isAnswerShown, setIsAnswerShown] = useState(() => {
    const savedIsAnswerShown = localStorage.getItem("isAnswerShown");
    return savedIsAnswerShown ? JSON.parse(savedIsAnswerShown) : false;
  });

  const [canNext, setCanNext] = useState(() => {
    const savedCanNext = localStorage.getItem("canNext");
    return savedCanNext ? JSON.parse(savedCanNext) : true;
  });

  const [correctCount, setCorrectCount] = useState(() => {
    const savedCorrectCount = localStorage.getItem("correctCount");
    return savedCorrectCount ? JSON.parse(savedCorrectCount) : 0;
  });

  const [incorrectCount, setIncorrectCount] = useState(() => {
    const savedIncorrectCount = localStorage.getItem("incorrectCount");
    return savedIncorrectCount ? JSON.parse(savedIncorrectCount) : 0;
  });

  const [totalWords, setTotalWords] = useState(() => {
    const savedTotalWords = localStorage.getItem("totalWords");
    return savedTotalWords ? JSON.parse(savedTotalWords) : 0;
  });

  useEffect(() => {
    localStorage.setItem("words", JSON.stringify(words));
    localStorage.setItem("usedIndices", JSON.stringify(usedIndices));
    localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
    localStorage.setItem("isAnswerShown", JSON.stringify(isAnswerShown));
    localStorage.setItem("canNext", JSON.stringify(canNext));
    localStorage.setItem("correctCount", JSON.stringify(correctCount));
    localStorage.setItem("incorrectCount", JSON.stringify(incorrectCount));
    localStorage.setItem("totalWords", JSON.stringify(totalWords));
  }, [
    words,
    usedIndices,
    currentIndex,
    isAnswerShown,
    canNext,
    correctCount,
    incorrectCount,
    totalWords,
  ]);

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
