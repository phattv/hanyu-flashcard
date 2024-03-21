import React, { useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import './Flashcard.css'; // Import your custom CSS file for additional styling

const Flashcard = ({ word, showAnswer, handleShowAnswer }) => {
  const [chineseInput, setChineseInput] = useState('');
  const [pinyinInput, setPinyinInput] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(false);

  const checkAnswer = () => {
    if (
      chineseInput.trim().toLowerCase() === word['汉语'].toLowerCase() &&
      pinyinInput.trim().toLowerCase() === word['pinyin'].toLowerCase()
    ) {
      setCorrectAnswer(true);
    } else {
      setCorrectAnswer(false);
    }
    handleShowAnswer();
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        checkAnswer();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [chineseInput, pinyinInput, handleShowAnswer]);

  return (
    <Card className="flashcard">
      <Card.Body>
        <Card.Text className="text">汉语 (Hán tự): {showAnswer ? word['汉语'] : '******'}</Card.Text>
        <Card.Text className="text">Pinyin (phiên âm): {showAnswer ? word['pinyin'] : '******'}</Card.Text>
        <Card.Text className="text">Chữ HÁN: {word['chữ hán']}</Card.Text>
        <Card.Text className="text">Nghĩa: {word['nghĩa']}</Card.Text>
        <Card.Text className="text">Ví dụ: {showAnswer ? word['ví dụ'] : '******'}</Card.Text>
        {!showAnswer && (
          <>
            <hr className="divider" />
            <Form.Group>
              <Form.Label>汉语 (Hán tự):</Form.Label>
              <Form.Control
                className="input"
                type="text"
                value={chineseInput}
                autoFocus
                onChange={(e) => setChineseInput(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Pinyin (phiên âm):</Form.Label>
              <Form.Control
                className="input"
                type="text"
                value={pinyinInput}
                onChange={(e) => setPinyinInput(e.target.value)}
              />
            </Form.Group>
            <Button className="button" onClick={checkAnswer}>Kiểm tra</Button>
          </>
        )}
        {showAnswer && (
          <Card.Text className="feedback">
            {correctAnswer ? '✅ Đúng! 💯' : `❌ Sai! 🅾️ - ${word['汉语']} - ${word['pinyin']}`}
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
};

export default Flashcard;
