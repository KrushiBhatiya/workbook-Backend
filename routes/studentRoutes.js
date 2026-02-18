const express = require('express');
const router = express.Router();
const { getStudents, createStudent, updateStudent, deleteStudent, getMe } = require('../controllers/studentController');
const { protect, facultyOnly } = require('../middleware/authMiddleware');

router.get('/me', protect, getMe);

router.route('/')
    .get(protect, facultyOnly, getStudents)
    .post(protect, facultyOnly, createStudent);

router.route('/:id')
    .put(protect, facultyOnly, updateStudent)
    .delete(protect, facultyOnly, deleteStudent);

module.exports = router;
