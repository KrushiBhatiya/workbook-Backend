const Question = require('../models/Question');

// @desc    Get questions
// @route   GET /api/questions
// @access  Private
const getQuestions = async (req, res) => {
    try {
        let query = {};

        if (req.query.topicId) {
            query.topicId = req.query.topicId;
        }
        if (req.query.languageId) {
            query.languageId = req.query.languageId;
        }

        const questions = await Question.find(query)
            .populate('topicId', 'name')
            .populate('languageId', 'name')
            .sort({ createdAt: 1 }); // Ensure stable order within topics

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Private (Faculty)
const createQuestion = async (req, res) => {
    const { question, languageId, topicId } = req.body;

    if (!question || !languageId || !topicId) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const questionData = await Question.create({
            question,
            languageId,
            topicId,
            facultyId: req.user.id
        });
        res.status(200).json(questionData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Faculty)
const updateQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (question.facultyId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).populate('languageId', 'name').populate('topicId', 'name');

        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Faculty)
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (question.facultyId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await question.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
};
