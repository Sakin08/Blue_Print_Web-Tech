import express from 'express';
import {
  createPost, getPosts, getPost, updatePost, deletePost,
} from '../controllers/buySellController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createPost);
router.get('/', getPosts);
router.get('/:id', getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

export default router;