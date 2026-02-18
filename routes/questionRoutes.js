const express = require('express');
const router = express.Router();
const { getQuestions, createQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { protect, facultyOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getQuestions)
    .post(protect, facultyOnly, createQuestion);

router.route('/:id')
    .put(protect, facultyOnly, updateQuestion)
    .delete(protect, facultyOnly, deleteQuestion);

module.exports = router;
