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

const Flashdiv = ({ word, showAnswer, handleShowAnswer }) => {
  const [hanziInput, setHanziInput] = useState("");
  const [pinyinInput, setPinyinInput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  const hanziWriterRef = useRef();

  useEffect(() => {
    if (hanziWriterRef.current && word["汉字"]) {
      hanziWriterRef.current.innerHTML = ""; // Clear previous drawings
      const currentWord = word["汉字"];
      for (let i = 0; i < currentWord.length; i++) {
        const charDiv = document.createElement("div");
        charDiv.style.display = "inline-block";
        charDiv.style.border = "1px solid black";
        charDiv.style.margin = "5px";
        hanziWriterRef.current.appendChild(charDiv);
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
