const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/auth.middleware');
const {
  feedbackValidationRules,
  handleValidationErrors,
} = require('../middlewares/validators');
const {
  renderFeedbackPage,
  handleFeedbackSubmit,
} = require('../controllers/feedback.controller');

// Snapshot body SEBELUM sanitasi untuk keperluan demonstrasi Before/After
function captureRawBody(req, res, next) {
  req.rawBodyForDemo = { ...req.body };
  next();
}

router.get('/feedback', requireAuth, renderFeedbackPage);
router.post(
  '/feedback',
  requireAuth,
  captureRawBody,
  feedbackValidationRules,
  handleValidationErrors,
  handleFeedbackSubmit
);

module.exports = router;
