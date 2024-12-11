import React, { useContext, useEffect, useState } from 'react';
import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import './index.css';
import QuestionBody from './questionBody';
import { getQuestionById } from '../../../services/questionService';
import VoteComponent from '../voteComponent';
import { Question, Comment, Answer } from '../../../types';
import CommentSection from '../commentSection';
import addComment from '../../../services/commentService';
import UserContext from '../../../contexts/UserContext';

/**
 * Interface representing the props for the AnswerPage component.
 *
 * - qid - The unique identifier for the question.
 * - handleNewQuestion - Callback function to handle a new question.
 * - handleNewAnswer - Callback function to handle a new answer.
 */
interface AnswerPageProps {
  qid: string;
  handleNewQuestion: () => void;
  handleNewAnswer: () => void;
}

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 *
 * @param qid The unique identifier of the question to be displayed.
 * @param handleNewQuestion Callback function to handle asking a new question.
 * @param handleNewAnswer Callback function to handle posting a new answer.
 */
const AnswerPage = ({ qid, handleNewQuestion, handleNewAnswer }: AnswerPageProps) => {
  // TODO: Task 1 - Refactor the AnswerPage component to use the useUserContext hook
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('User context is null.');
  }
  const { socket } = context;
  const [question, setQuestion] = useState<Question | null>(null);

  const handleNewComment = async (
    comment: Comment,
    targetType: 'question' | 'answer',
    targetId: string | undefined,
  ) => {
    // TODO: Task 2 - Implement the handleNewComment function
    // This function should add a new comment to the question or answer.
    // It should call the addComment function from the commentService file.
    if (!targetId) {
      console.error('Target ID is undefined');
      return;
    }
    try {
      const newComment = await addComment(targetId, targetType, comment);
      // Update local state
      if (targetType === 'question' && question) {
        console.log('incoming question', question);
        setQuestion({
          ...question,
          comments: [...(question.comments || []), newComment],
        });
        console.log('set question', question);
      } else if (targetType === 'answer' && question) {
        setQuestion({
          ...question,
          answers: question.answers.map(ans =>
            ans._id === targetId
              ? { ...ans, comments: [...(ans.comments || []), newComment] }
              : ans,
          ),
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      // You might want to show an error message to the user here
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getQuestionById(qid);
        setQuestion(res || null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching question:', error);
      }
    };

    // eslint-disable-next-line no-console
    fetchData().catch(e => console.log(e));
  }, [qid]);

  useEffect(() => {
    const handleAnswerUpdate = ({ answer }: { qid: string; answer: Answer }) => {
      setQuestion(prevQuestion =>
        prevQuestion
          ? // Creates a new Question object with the new answer appended to the end
            { ...prevQuestion, answers: [...prevQuestion.answers, answer] }
          : prevQuestion,
      );
    };

    const handleCommentUpdate = ({
      result,
      type,
    }: {
      result: Question | Answer;
      type: 'question' | 'answer';
    }) => {
      // TODO: Task 3 - Complete function to handle comment updates from the socket
      setQuestion(prevQuestion => {
        console.log('incoming prevQuestion : ', prevQuestion);
        if (!prevQuestion) return prevQuestion;

        if (type === 'question' && 'title' in result) {
          console.log('setting prevQuestion : ', result);
          return result as Question;
        }
        if (type === 'answer') {
          return {
            ...prevQuestion,
            answers: prevQuestion.answers.map(ans =>
              ans._id === (result as Answer)._id ? (result as Answer) : ans,
            ),
          };
        }
        return prevQuestion;
      });
    };

    socket.on('answerUpdate', handleAnswerUpdate);
    socket.on('viewsUpdate', setQuestion);

    // TODO: Task 3 - Setup appropriate socket listener(s) for comment updates
    socket.on('commentUpdate', handleCommentUpdate);

    return () => {
      socket.off('answerUpdate', handleAnswerUpdate);
      socket.off('viewsUpdate', setQuestion);

      // TODO: Task 3 - Setup appropriate socket listener(s) for comment updates
      socket.off('commentUpdate', handleCommentUpdate);
    };
  }, [socket]);

  if (!question) {
    return null;
  }

  // TODO: Task 2 - Use the CommentSection component and modify the AnswerPage component
  return (
    <>
      <VoteComponent question={question} />
      <AnswerHeader
        ansCount={question.answers.length}
        title={question.title}
        handleNewQuestion={handleNewQuestion}
      />
      <QuestionBody
        views={question.views}
        text={question.text}
        askby={question.askedBy}
        meta={getMetaData(new Date(question.askDateTime.toString()))}
      />
      <CommentSection
        comments={question.comments || []}
        handleAddComment={comment => handleNewComment(comment, 'question', question._id)}
      />
      {question?.answers?.map((a, idx) => (
        <AnswerView
          key={idx}
          text={a.text}
          ansBy={a.ansBy}
          meta={getMetaData(new Date(a.ansDateTime.toString()))}
          comments={a.comments || []}
          handleAddComment={comment => handleNewComment(comment, 'answer', a._id)}
        />
      ))}
      <button
        className='bluebtn ansButton'
        onClick={() => {
          handleNewAnswer();
        }}>
        Answer Question
      </button>
    </>
  );
};

export default AnswerPage;
