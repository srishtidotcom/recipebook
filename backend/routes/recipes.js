const express = require('express');
const router = express.Router();
const {
  getRecipes, getFeatured, getRecipeBySlug, getUserRecipes,
  createRecipe, updateRecipe, deleteRecipe
} = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `recipe-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', getRecipes);
router.get('/featured', getFeatured);
router.get('/user/:userId', getUserRecipes);
router.get('/:slug', getRecipeBySlug);
router.post('/', authMiddleware, upload.single('image'), createRecipe);
router.put('/:id', authMiddleware, upload.single('image'), updateRecipe);
router.delete('/:id', authMiddleware, deleteRecipe);

module.exports = router;
