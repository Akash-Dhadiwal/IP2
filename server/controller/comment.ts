import express, { Response } from 'express';
import { Server } from 'socket.io';
import { Comment, AddCommentRequest } from '../types';
import { addComment, populateDocument, saveComment } from '../models/application';

const commentController = (socket: Server) => {
  const router = express.Router();

  /**
   * Checks if the provided answer request contains the required fields.
   *
   * @param req The request object containing the answer data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  const isRequestValid = (req: AddCommentRequest): boolean =>
    !!req.body.id &&
    (req.body.type === 'question' || req.body.type === 'answer') &&
    !!req.body.comment;

  /**
   * Validates the comment object to ensure it is not empty.
   *
   * @param comment The comment to validate.
   *
   * @returns `true` if the coment is valid, otherwise `false`.
   */
  const isCommentValid = (comment: Comment): boolean =>
    // TODO: Task 2 - Implement the `isCommentValid` function
    !!comment.text && !!comment.commentBy && !!comment.commentDateTime;

  /**
   * Handles adding a new comment to the specified question or answer. The comment is first validated and then saved.
   * If the comment is invalid or saving fails, the HTTP response status is updated.
   *
   * @param req The AddCommentRequest object containing the comment data.
   * @param res The HTTP response object used to send back the result of the operation.
   * @param type The type of the comment, either 'question' or 'answer'.
   *
   * @returns A Promise that resolves to void.
   */
  const addCommentRoute = async (req: AddCommentRequest, res: Response): Promise<void> => {
    // TODO: Task 2 - Implement the `addCommentRoute` function
    // Hint: Refer to the addAnswer function in answer.ts for guidance
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }
    if (!isCommentValid(req.body.comment)) {
      res.status(400).send('Invalid comment');
      return;
    }

    const { id, type, comment } = req.body;

    try {
      const commentFromDb = await saveComment(comment);

      if ('error' in commentFromDb) {
        throw new Error(commentFromDb.error as string);
      }

      const status = await addComment(id, type, commentFromDb);

      if (status && 'error' in status) {
        throw new Error(status.error as string);
      }
      // TODO: Task 3 - Emit the object updated with the comment to all connected clients
      // Hint: View the database to see how the data is stored and compare with the data expected
      // What might you need to do with the result from addComment?
      // Populate the fields of the comment that was added and emit the new object
      const populate = await populateDocument(id, type);
      socket.emit('commentUpdate', {
        result: populate, // status should be the updated question or answer
        type,
      });
      res.json(commentFromDb);
    } catch (err) {
      res.status(500).send(`Error when adding comment: ${(err as Error).message}`);
    }
  };

  router.post('/addComment', addCommentRoute);

  return router;
};

export default commentController;
