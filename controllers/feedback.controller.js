const { Feedback } = require('../models');

async function renderFeedbackPage(req, res) {
  try {
    // 🛡️ Parameterized Query / ORM query untuk mengambil daftar komentar
    const feedbacks = await Feedback.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.render('feedback', {
      username: req.session ? req.session.username : null,
      feedbacks,
      errors: [],
      old: { name: '', email: '', message: '' },
      sanitizationBeforeAfter: null,
      successMessage: null,
    });
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).send('Terjadi kesalahan pada server.');
  }
}

async function handleFeedbackSubmit(req, res) {
  const errors = req.validationErrors || [];

  try {
    const feedbacks = await Feedback.findAll({
      order: [['createdAt', 'DESC']],
    });

    // 1. Validasi Server-side: jika ada error, tolak dan tampilkan pesan error jelas
    if (errors.length > 0) {
      return res.render('feedback', {
        username: req.session ? req.session.username : null,
        feedbacks,
        errors,
        old: req.rawBodyForDemo || req.body,
        sanitizationBeforeAfter: null,
        successMessage: null,
      });
    }

    // Capture data sebelum & sesudah sanitasi untuk demonstrasi Before/After
    const beforeSanitization = req.rawBodyForDemo || {};
    const afterSanitization = req.body;

    // 2. Sanitasi & 4. Database Query (ORM Parameterized)
    await Feedback.create({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
    });

    const updatedFeedbacks = await Feedback.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.render('feedback', {
      username: req.session ? req.session.username : null,
      feedbacks: updatedFeedbacks,
      errors: [],
      old: { name: '', email: '', message: '' },
      sanitizationBeforeAfter: {
        before: beforeSanitization,
        after: afterSanitization,
      },
      successMessage: 'Komentar/Feedback Anda berhasil disimpan secara aman!',
    });
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).send('Terjadi kesalahan saat menyimpan data.');
  }
}

module.exports = {
  renderFeedbackPage,
  handleFeedbackSubmit,
};
