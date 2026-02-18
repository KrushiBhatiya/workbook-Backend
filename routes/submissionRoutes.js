const express = require('express');
const router = express.Router();
const { getSubmissions, createSubmission, getMySubmissions, getStudentSubmissions } = require('../controllers/submissionController');
const { protect, facultyOnly } = require('../middleware/authMiddleware');

router.get('/my', protect, getMySubmissions);
router.get('/student/:studentId', protect, facultyOnly, getStudentSubmissions);

router.route('/')
    .get(protect, facultyOnly, getSubmissions)
    .post(protect, createSubmission);

module.exports = router;
