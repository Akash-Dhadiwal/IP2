import { useContext, useEffect, useState } from 'react';
import { downvoteQuestion, upvoteQuestion } from '../../../services/questionService';
import './index.css';
import { Question, VoteData } from '../../../types';
import UserContext from '../../../contexts/UserContext';
import useVoteStatus from '../../../hooks/useVoteStatus';

/**
 * Interface represents the props for the VoteComponent.
 *
 * question - The question object containing voting information.
 */
interface VoteComponentProps {
  question: Question;
}

/**
 * A Vote component that allows users to upvote or downvote a question.
 *
 * @param question - The question object containing voting information.
 */
const VoteComponent = ({ question }: VoteComponentProps) => {
  // TODO: Task 1 - Refactor the VoteComponent to use the useVoteStatus hook
  // TODO: Task 1 - Refactor the the useVoteStatus hook to use the useUserContext hook - Do this after the above step
  const { count, voted, handleVote } = useVoteStatus(question);

  return (
    <div className='vote-container'>
      <button
        className={`vote-button ${voted === 1 ? 'vote-button-upvoted' : ''}`}
        onClick={() => handleVote('upvote')}>
        Upvote
      </button>
      <button
        className={`vote-button ${voted === -1 ? 'vote-button-downvoted' : ''}`}
        onClick={() => handleVote('downvote')}>
        Downvote
      </button>
      <span className='vote-count'>{count}</span>
    </div>
  );
};

export default VoteComponent;
