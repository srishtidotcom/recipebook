const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:recipeId', getComments);
router.post('/:recipeId', authMiddleware, addComment);
router.delete('/:commentId', authMiddleware, deleteComment);

module.exports = router;
