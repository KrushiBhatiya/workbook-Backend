const Topic = require('../models/Topic');

// @desc    Get topics
// @route   GET /api/topics
// @access  Private
const getTopics = async (req, res) => {
    try {
        let query = {};

        if (req.query.languageId) {
            query.languageId = req.query.languageId;
        }

        const topics = await Topic.find(query)
            .populate('languageId', 'name')
            .sort({ createdAt: 1 }); // Ensure stable order for sequential progression
        res.status(200).json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create topic
// @route   POST /api/topics
// @access  Private (Faculty)
const createTopic = async (req, res) => {
    const { name, languageId } = req.body;

    if (!name || !languageId) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const topicExists = await Topic.findOne({
            name,
            languageId,
            facultyId: req.user.id
        });

        if (topicExists) {
            return res.status(400).json({ message: 'Already exist' });
        }

        const topic = await Topic.create({
            name,
            languageId,
            facultyId: req.user.id
        });
        res.status(200).json(topic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private (Faculty)
const updateTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.facultyId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Duplicate check on update
        const newName = req.body.name || topic.name;
        const newLanguageId = req.body.languageId || topic.languageId;

        if (newName !== topic.name || newLanguageId.toString() !== topic.languageId.toString()) {
            const topicExists = await Topic.findOne({
                name: newName,
                languageId: newLanguageId,
                facultyId: req.user.id
            });
            if (topicExists) {
                return res.status(400).json({ message: 'Already exist' });
            }
        }

        const updatedTopic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).populate('languageId', 'name');

        res.status(200).json(updatedTopic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private (Faculty)
const deleteTopic = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.facultyId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await topic.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTopics,
    createTopic,
    updateTopic,
    deleteTopic
};
