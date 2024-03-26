import { Button, Card, Group, Text, TextInput } from "@mantine/core";
import HanziWriter from "hanzi-writer";
import React, { useEffect, useRef, useState } from "react";
import { useSpeechSynthesis } from "react-speech-kit";

const hanziConfig = {
  width: 200,
  height: 200,
  padding: 5,
  showOutline: false,
  showCharacter: false,
  showHintAfterMisses: 1,
  strokeAnimationSpeed: 1,
  delayBetweenStrokes: 1,
  delayBetweenLoops: 1000,
};

const createSvgBackground = () => {
  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "200");
  svg.setAttribute("height", "200");

  // Lines to be drawn on the SVG
  const lines = [
    { x1: "0", y1: "0", x2: "200", y2: "200" },
    { x1: "200", y1: "0", x2: "0", y2: "200" },
    { x1: "100", y1: "0", x2: "100", y2: "200" },
    { x1: "0", y1: "100", x2: "200", y2: "100" },
  ];

  lines.forEach(({ x1, y1, x2, y2 }) => {
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#DDD");
    svg.appendChild(line);
  });

  return svg;
};

const FlashCard = ({ word, showAnswer, handleShowAnswer }) => {
  const [hanziInput, setHanziInput] = useState("");
  const [pinyinInput, setPinyinInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const { speak, voices } = useSpeechSynthesis();
  const voice = voices.find((voice) => voice.lang === "zh-CN");

  const hanziWriterRef = useRef();

  useEffect(() => {
    if (hanziWriterRef.current && word["汉字"]) {
      hanziWriterRef.current.innerHTML = "";
      const currentWord = word["汉字"];
      for (let i = 0; i < currentWord.length; i++) {
        const hanziContainer = document.createElement("div");
        hanziContainer.style.display = "inline-block";
        hanziContainer.style.position = "relative";
        hanziContainer.style.width = `${hanziConfig.width}px`;
        hanziContainer.style.height = `${hanziConfig.height}px`;
        hanziContainer.style.border = "1px solid #DDD";

        const svgBackground = createSvgBackground();
        hanziContainer.appendChild(svgBackground);

        const charDiv = document.createElement("div");
        charDiv.style.position = "absolute";
        charDiv.style.top = "0";
        charDiv.style.left = "0";
        charDiv.style.width = "100%";
        charDiv.style.height = "100%";

        hanziContainer.appendChild(charDiv);
        hanziWriterRef.current.appendChild(hanziContainer);

        HanziWriter.create(charDiv, currentWord[i], hanziConfig).quiz({
          onComplete: () => {
            setHanziInput(currentWord);
          },
        });
      }
    }
  }, [word]);

  const checkAnswer = () => {
    const currentWord = word["汉字"];

    if (
      hanziInput.trim().toLowerCase() === currentWord.toLowerCase() &&
      pinyinInput.trim().toLowerCase() === word["pinyin"].toLowerCase()
    ) {
      setIsCorrect(true);
      Math.random() < 0.5
        ? speak({ text: "很好", voice })
        : speak({ text: "好了", voice });
    } else {
      setIsCorrect(false);
      speak({ text: "加油", voice });
    }

    handleShowAnswer();
  };

  return (
    <Card>
      <Card.Section>
        <Text>汉字 (Hán tự): {showAnswer ? word["汉字"] : "******"}</Text>
        <Text>Pinyin (phiên âm): {showAnswer ? word["pinyin"] : "******"}</Text>
        <Text>Chữ HÁN: {word["chữ hán"]}</Text>
        <Text>Nghĩa: {word["nghĩa"]}</Text>
        <Text>Ví dụ: {showAnswer ? word["ví dụ"] : "******"}</Text>
        <div ref={hanziWriterRef} />
      </Card.Section>

      {!showAnswer && (
        <Card.Section>
          <TextInput
            label="汉字 (Hán tự)"
            value={hanziInput}
            onChange={(e) => setHanziInput(e.target.value)}
          />
          <TextInput
            label="Pinyin (phiên âm)"
            value={pinyinInput}
            onChange={(e) => setPinyinInput(e.target.value)}
          />
          <Group justify="space-between" mt="md">
            <Button
              fullWidth
              onClick={() =>
                speak({
                  text: word["汉字"],
                  voice,
                })
              }
            >
              🎤
            </Button>
            <Button fullWidth onClick={checkAnswer} autoFocus>
              👌
            </Button>
          </Group>
        </Card.Section>
      )}

      {showAnswer && (
        <Text>
          {isCorrect
            ? "✅ Đúng! 💯"
            : `❌ Sai! - ${word["汉字"]} - ${word["pinyin"]}`}
        </Text>
      )}
    </Card>
  );
};

export default FlashCard;
