const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (for initial setup) / Admin
const registerUser = async (req, res) => {
    const { username, email, password, role, name } = req.body;

    if (!name || !password || (!username && !email)) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({
        $or: [
            { username: username || 'nonexistent_placeholder' },
            { email: email || 'nonexistent_placeholder' }
        ]
    });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        username,
        email,
        password: hashedPassword,
        role
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Faculty logs in with username, Student with email
    let user;
    if (username) {
        user = await User.findOne({ username });
    } else if (email) {
        user = await User.findOne({ email });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// Internal function to seed admin
const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt);

            await User.create({
                name: 'Admin',
                username: 'admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Default Admin Account Created: admin@gmail.com / admin');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

// Internal function to seed default faculty
const seedDefaultFaculty = async () => {
    try {
        const facultyEmail = 'krushi@gmail.com';
        const facultyExists = await User.findOne({ email: facultyEmail });

        if (!facultyExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('krushi.workbook.5503', salt);

            await User.create({
                name: 'krushi',
                username: 'krushi',
                email: facultyEmail,
                password: hashedPassword,
                role: 'faculty'
            });
            console.log('Default Faculty Account Created: krushi@gmail.com / username: krushi');
        }
    } catch (error) {
        console.error('Error seeding default faculty:', error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    seedAdmin,
    seedDefaultFaculty
};
