import { useState, useEffect, useContext } from 'react';
import { Question, VoteData } from '../types';
import { downvoteQuestion, upvoteQuestion } from '../services/questionService';
import useUserContext from './useUserContext';

const useVoteStatus = (question: Question) => {
  // TODO: Task 1 - Refactor the the useVoteStatus hook to use the useUserContext hook - Do this after the above step
  const { user } = useUserContext();
  const [count, setCount] = useState<number>(0);
  const [voted, setVoted] = useState<number>(0);

  useEffect(() => {
    const getVoteValue = () => {
      if (user.username && question?.upVotes?.includes(user.username)) {
        return 1;
      }
      if (user.username && question?.downVotes?.includes(user.username)) {
        return -1;
      }
      return 0;
    };

    // Set the initial count and vote value
    setCount((question.upVotes || []).length - (question.downVotes || []).length);
    setVoted(getVoteValue());

    const handleVoteUpdate = (voteData: VoteData) => {
      // TODO: Task 3 - Complete function to handle vote updates from the socket
    };

    // TODO: Task 3 - Setup appropriate socket listener(s) for vote updates
  }, [question, user.username]);

  const handleVote = async (type: string) => {
    try {
      if (question._id) {
        if (type === 'upvote') {
          await upvoteQuestion(question._id, user.username);
        } else if (type === 'downvote') {
          await downvoteQuestion(question._id, user.username);
        }
      }
    } catch (error) {
      // Handle error
      console.error('Error voting:', error);
    }
  };

  return { count, voted, handleVote };
};

export default useVoteStatus;
