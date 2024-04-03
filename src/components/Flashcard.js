import { Button, Card, Group, Stack, Text, TextInput } from "@mantine/core";
import HanziWriter from "hanzi-writer";
import React, { useEffect, useRef, useState } from "react";

const hanziConfig = {
  width: 150,
  height: 150,
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
  svg.setAttribute("width", "150");
  svg.setAttribute("height", "150");

  const lines = [
    { x1: "0", y1: "0", x2: "150", y2: "150" },
    { x1: "150", y1: "0", x2: "0", y2: "150" },
    { x1: "75", y1: "0", x2: "75", y2: "150" },
    { x1: "0", y1: "75", x2: "150", y2: "75" },
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

const FlashCard = ({ word, isAnswerShown, handleShowAnswer }) => {
  const currentHanzi = word["汉字"];
  const currentPinyin = word["pinyin"];
  const [hanziInput, setHanziInput] = useState("");
  const [pinyinInput, setPinyinInput] = useState("");
  const [isHanziCorrect, setIsHanziCorrect] = useState(false);
  const [isPinyinCorrect, setIsPinyinCorrect] = useState(false);

  const synth = window.speechSynthesis;
  const voice = synth.getVoices().find((voice) => voice.lang === "zh-CN");
  const hanziWriterRef = useRef();

  const generateHanziWriter = (shouldAnimate) => {
    if (hanziWriterRef.current && currentHanzi) {
      hanziWriterRef.current.innerHTML = "";
      const currentWord = currentHanzi;

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

        const writer = HanziWriter.create(charDiv, currentWord[i], hanziConfig);

        if (shouldAnimate) {
          writer.loopCharacterAnimation();
        } else {
          writer.quiz({
            onComplete: () => {
              setHanziInput(currentWord);
            },
          });
        }
      }
    }
  };

  useEffect(() => {
    generateHanziWriter(false);
  }, [word]);

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.voice = voice;
    synth.speak(utterance);
  };

  const checkAnswer = () => {
    const hanziCorrect = hanziInput.trim() === currentHanzi;
    const pinyinCorrect = pinyinInput.trim() === currentPinyin;
    if (hanziCorrect && pinyinCorrect) {
      Math.random() < 0.5 ? speakText("很好") : speakText("好了");
    } else {
      speakText("加油");
    }

    generateHanziWriter(true);
    setIsHanziCorrect(hanziCorrect);
    setIsPinyinCorrect(pinyinCorrect);
    setHanziInput("");
    setPinyinInput("");
    handleShowAnswer(hanziCorrect && pinyinCorrect);
  };

  return (
    <Card>
      <Card.Section>
        <Group>
          <Stack flex={1} gap="xs">
            <div ref={hanziWriterRef} />
          </Stack>
          <Stack flex={1} gap="xs">
            <Text>Ví dụ: {word["ví dụ"] || "-"}</Text>
            <Text>Chữ HÁN: {word["chữ hán"] || "-"}</Text>
            <Text>Nghĩa: {word["nghĩa"]}</Text>
          </Stack>
        </Group>
      </Card.Section>

      <Card.Section>
        <form onSubmit={checkAnswer}>
          <Group mt="xs">
            <TextInput
              flex={1}
              label="汉字 (Hán tự)"
              error={isAnswerShown && !isHanziCorrect}
              disabled={isAnswerShown}
              value={isAnswerShown ? currentHanzi : hanziInput}
              onChange={(e) => setHanziInput(e.target.value)}
            />
            <TextInput
              flex={1}
              label="Pinyin (phiên âm)"
              error={isAnswerShown && !isPinyinCorrect}
              disabled={isAnswerShown}
              value={isAnswerShown ? currentPinyin : pinyinInput}
              onChange={(e) => setPinyinInput(e.target.value)}
            />
          </Group>
          <Group mt="xs">
            <Button flex={1} onClick={() => speakText(currentHanzi)}>
              Phát âm&nbsp;🔊
            </Button>
            <Button
              flex={1}
              type="submit"
              disabled={isAnswerShown}
              onClick={checkAnswer}
              autoFocus
            >
              {isAnswerShown
                ? isHanziCorrect & isPinyinCorrect
                  ? "Đúng! 👍"
                  : `Sai! 👎`
                : `Kiểm tra 👌`}
            </Button>
          </Group>
        </form>
      </Card.Section>
    </Card>
  );
};

export default FlashCard;
