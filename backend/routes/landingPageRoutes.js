const express = require('express');
const router = express.Router();
const {
  getLandingPages, getLandingPage, getLandingPageBySlug,
  checkSlug, generateSlugSuggestion,
  createLandingPage, updateLandingPage, deleteLandingPage, getStats,
} = require('../controllers/landingPageController');
const { protect } = require('../middleware/authMiddleware');

// Public route - view landing page by slug
router.get('/slug/:slug', getLandingPageBySlug);

// Protected routes
router.use(protect);
router.get('/stats', getStats);
router.get('/check-slug/:slug', checkSlug);
router.post('/generate-slug', generateSlugSuggestion);
router.get('/', getLandingPages);
router.get('/:id', getLandingPage);
router.post('/', createLandingPage);
router.put('/:id', updateLandingPage);
router.delete('/:id', deleteLandingPage);

module.exports = router;