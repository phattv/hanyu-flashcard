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
  const [isRepeat, setIsRepeat] = useState(false);
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
    if (words && words[currentIndex]) {
      generateHanziWriter(
        writerRef,
        words[currentIndex]["汉字"],
        onComplete,
        false,
        isFast,
        isRepeat
      );
    }
  }, [words[currentIndex], currentIndex, isFast, isRepeat]);

  const refreshData = () => {
    axios
      .get(source)
      .then((response) => {
        const csvData = response.data;
        Papa.parse(csvData, {
          header: true,
          complete: (result) => {
            const parsedData = result.data
              .filter((row) => !!row["pinyin"])
              .filter((row) => row["skip"] == "");
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

    if (isRepeat) {
      generateHanziWriter(
        writerRef,
        words[currentIndex]["汉字"],
        onComplete,
        false,
        isFast,
        isRepeat
      );
      return;
    }

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
    generateHanziWriter(writerRef, hanzis, onComplete, true, isFast, isRepeat);

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

  const row = words[currentIndex];

  return (
    <div>
      <Group justify="space-between">
        <Group>
          <Checkbox
            label="Fast"
            onChange={(event) => setIsFast(event.currentTarget.checked)}
          />
          <Checkbox
            label="Repeat"
            onChange={(event) => setIsRepeat(event.currentTarget.checked)}
          />
        </Group>
        <Text>
          {usedIndexes.length} / {words.length}
        </Text>
      </Group>
      <div ref={writerRef} />
      <Text>{row["chữ hán"]}</Text>
      <Text>{row["nghĩa"]}</Text>
      <Text>
        {isCorrect
          ? row["ví dụ"]
          : row["ví dụ"]?.replace(new RegExp(`[${row["汉字"]}]`, "g"), "…")}
      </Text>
      {isCorrect && (
        <>
          <Text fw={700} size="50px">
            {row["汉字"]}
          </Text>
          <Text
            fw={500}
            size="40px"
            color="blue"
            onClick={() => speak(row["汉字"])}
          >
            {row["pinyin"]}
          </Text>
        </>
      )}
    </div>
  );
}

export default App;
