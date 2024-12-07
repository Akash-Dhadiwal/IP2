import { useState } from 'react';
import { validateHyperlink } from '../tool';
import { Answer } from '../types';
import addAnswer from '../services/answerService';
import useUserContext from './useUserContext';

const useAnswerForm = (qid: string, handleAnswer: (qid: string) => void) => {
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const { user } = useUserContext();

  const postAnswer = async () => {
    let isValid = true;

    if (!text) {
      setTextErr('Answer text cannot be empty');
      isValid = false;
    }

    if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const answer: Answer = {
      text,
      ansBy: user.username,
      ansDateTime: new Date(),
    };

    const res = await addAnswer(qid, answer);
    if (res && res._id) {
      handleAnswer(qid);
    }
  };

  return {
    text,
    setText,
    textErr,
    postAnswer,
  };
};

export default useAnswerForm;
