import { Text } from "@mantine/core";
import "@mantine/core/styles.css";
import axios from "axios";
import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { generateHanziWriter, source } from "./constants";

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
    return savedCurrentIndex !== null ? JSON.parse(savedCurrentIndex) : 0;
  });

  const [isCorrect, setIsCorrect] = useState(() => {
    const savedIsCorrect = localStorage.getItem("isCorrect");
    return savedIsCorrect !== null ? JSON.parse(savedIsCorrect) : false;
  });

  const hanziWriterRef = useRef();

  useEffect(() => {
    localStorage.setItem("words", JSON.stringify(words));
    localStorage.setItem("usedIndices", JSON.stringify(usedIndices));
    localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
  }, [words, usedIndices, currentIndex]);

  useEffect(() => {
    generateHanziWriter(
      hanziWriterRef,
      words[currentIndex]["汉字"],
      onQuizCompleted,
      false
    );
  }, [words[currentIndex], currentIndex]);

  useEffect(() => {
    words?.length === 0 ? refreshData() : randomizeWord();
  }, []);

  const refreshData = () => {
    axios
      .get(source)
      .then((response) => {
        const csvData = response.data;
        Papa.parse(csvData, {
          header: true,
          complete: (result) => {
            const parsedData = result.data;
            setWords(parsedData);
            randomizeWord();
          },
          error: (error) => {
            console.error("Error parsing CSV: ", error);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  };

  const randomizeWord = () => {
    setIsCorrect(false);

    let newIndex;
    newIndex = Math.floor(Math.random() * words.length);
    setUsedIndices([...usedIndices, newIndex]);
    if (usedIndices.includes(newIndex) || !words[newIndex]["pinyin"]) {
      randomizeWord();
      return;
    }
    setCurrentIndex(newIndex);
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.voice = synth.getVoices().find((voice) => voice.lang === "zh-CN");
    synth.speak(utterance);
  };

  const onQuizCompleted = () => {
    setIsCorrect(true);

    const hanzis = words[currentIndex]["汉字"];
    generateHanziWriter(hanziWriterRef, hanzis, onQuizCompleted, true);

    speak(hanzis);

    setTimeout(() => {
      randomizeWord();
    }, 3000);
  };

  if (words?.length === 0) {
    return (
      <div>
        <Text align="center">Loading...</Text>
      </div>
    );
  }

  return (
    <div>
      <div ref={hanziWriterRef} />
      <Text>{words[currentIndex]["chữ hán"]}</Text>
      <Text>{words[currentIndex]["nghĩa"]}</Text>
      {isCorrect && (
        <>
          <Text fw={700} size="50px">
            {words[currentIndex]["汉字"]}
          </Text>
          <Text
            fw={500}
            size="40px"
            color="blue"
            onClick={() => speak(words[currentIndex]["汉字"])}
          >
            {words[currentIndex]["pinyin"]}
          </Text>
          <Text size="40px">{words[currentIndex]["ví dụ"]}</Text>
        </>
      )}
    </div>
  );
}

export default App;
