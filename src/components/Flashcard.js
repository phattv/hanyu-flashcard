import HanziWriter from "hanzi-writer";
import React, { useEffect, useRef, useState } from "react";

const hanziConfig = {
  width: 100,
  height: 100,
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
  svg.setAttribute("width", "100");
  svg.setAttribute("height", "100");

  // Lines to be drawn on the SVG
  const lines = [
    { x1: "0", y1: "0", x2: "100", y2: "100" },
    { x1: "100", y1: "0", x2: "0", y2: "100" },
    { x1: "50", y1: "0", x2: "50", y2: "100" },
    { x1: "0", y1: "50", x2: "100", y2: "50" },
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

const Flashdiv = ({ word, showAnswer, handleShowAnswer }) => {
  const [hanziInput, setHanziInput] = useState("");
  const [pinyinInput, setPinyinInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  const hanziWriterRef = useRef();

  useEffect(() => {
    if (hanziWriterRef.current && word["汉字"]) {
      hanziWriterRef.current.innerHTML = "";
      const currentWord = word["汉字"];
      for (let i = 0; i < currentWord.length; i++) {
        const charContainer = document.createElement("div");
        charContainer.style.display = "inline-block";
        charContainer.style.position = "relative";
        charContainer.style.width = `${hanziConfig.width}px`;
        charContainer.style.height = `${hanziConfig.height}px`;
        charContainer.style.margin = "5px";
        charContainer.style.border = "1px solid #DDD";

        const svgBackground = createSvgBackground();
        charContainer.appendChild(svgBackground);

        const charDiv = document.createElement("div");
        charDiv.style.position = "absolute";
        charDiv.style.top = "0";
        charDiv.style.left = "0";
        charDiv.style.width = "100%";
        charDiv.style.height = "100%";

        charContainer.appendChild(charDiv);
        hanziWriterRef.current.appendChild(charContainer);

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
    } else {
      setIsCorrect(false);
    }

    handleShowAnswer();
  };

  return (
    <div>
      <div>
        <p>汉字 (Hán tự): {showAnswer ? word["汉字"] : "******"}</p>
        <p>Pinyin (phiên âm): {showAnswer ? word["pinyin"] : "******"}</p>
        <p>Chữ HÁN: {word["chữ hán"]}</p>
        <p>Nghĩa: {word["nghĩa"]}</p>
        <p>Ví dụ: {showAnswer ? word["ví dụ"] : "******"}</p>
        <div ref={hanziWriterRef} />

        {!showAnswer && (
          <>
            <hr />
            <div>
              <label>汉字 (Hán tự):</label>
              <input
                type="text"
                value={hanziInput}
                autoFocus
                onChange={(e) => setHanziInput(e.target.value)}
              />
            </div>
            <div>
              <label>Pinyin (phiên âm):</label>
              <input
                type="text"
                value={pinyinInput}
                onChange={(e) => setPinyinInput(e.target.value)}
              />
            </div>
            <button onClick={checkAnswer} autoFocus>
              ✅ or ❌
            </button>
          </>
        )}

        {showAnswer && (
          <p>
            {isCorrect
              ? "✅ Đúng! 💯"
              : `❌ Sai! - ${word["汉字"]} - ${word["pinyin"]}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default Flashdiv;
