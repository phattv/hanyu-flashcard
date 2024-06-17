import { Checkbox, Group, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import axios from "axios";
import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { generateHanziWriter, source } from "./constants";

function App() {
  const [words, setWords] = useState([]);
  const [usedIndexes, setUsedIndexes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isFast, setIsFast] = useState(false);
  const writerRef = useRef();

  useEffect(() => {
    words?.length === 0 ? refreshData() : randomizeWord();

    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);
  }, []);

  useEffect(() => {
    if (words) {
      generateHanziWriter(
        writerRef,
        words[currentIndex]["汉字"],
        onComplete,
        false,
        isFast
      );
    }
  }, [words[currentIndex], currentIndex, isFast]);

  const refreshData = () => {
    axios
      .get(source)
      .then((response) => {
        const csvData = response.data;
        Papa.parse(csvData, {
          header: true,
          complete: (result) => {
            const parsedData = result.data.filter((row) => !!row["pinyin"]);
            setWords(parsedData);
            setUsedIndexes([]);
            randomizeWord(parsedData);
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

  const randomizeWord = (data = words) => {
    setIsCorrect(false);

    const newIndex = Math.floor(Math.random() * data.length);
    if (
      usedIndexes.includes(newIndex) ||
      !data[newIndex] ||
      !data[newIndex]["pinyin"]
    ) {
      randomizeWord(data);
      return;
    }

    setUsedIndexes((prevIndices) => [...prevIndices, newIndex]);
    setCurrentIndex(newIndex);
  };

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.voice = synth.getVoices().find((voice) => voice.lang === "zh-CN");
    synth.speak(utterance);
  };

  const onComplete = () => {
    setIsCorrect(true);

    const hanzis = words[currentIndex]["汉字"];
    speak(hanzis);
    generateHanziWriter(writerRef, hanzis, onComplete, true, isFast);

    if (isFast) {
      setTimeout(() => {
        randomizeWord();
      }, 500);
    } else {
      setTimeout(() => {
        randomizeWord();
      }, 2000);
    }
  };

  if (
    words?.length === 0 ||
    !words[currentIndex] ||
    !words[currentIndex]["pinyin"]
  ) {
    return (
      <div>
        <Text align="center">Loading...</Text>
      </div>
    );
  }

  return (
    <div>
      <Group justify="space-between">
        <Checkbox
          label="Fast"
          onChange={(event) => setIsFast(event.currentTarget.checked)}
        />
        <Text>
          {usedIndexes.length} / {words.length}
        </Text>
      </Group>
      <div ref={writerRef} />
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
          <Text>{words[currentIndex]["ví dụ"]}</Text>
        </>
      )}
    </div>
  );
}

export default App;
