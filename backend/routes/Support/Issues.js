import express from 'express';
import multer from 'multer';
import path from 'path';
import { Issue } from '../../models/Support/Issues.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();


// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/Issues'); // Store files in the 'uploads/Issues' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
    },
});

const upload = multer({ storage });

router.get('/',(req,res) => { 
    res.status(200).json({ message: 'ok to create issue' });
 })

// Route to handle creating a new issue
router.post('/new',upload.single('attachment'), async (req, res) => {
    console.log("it is hil")
    try {
        const { issue, description, contractLink } = req.body;

        // Create a new issue document
        const newIssue = new Issue({
            userId: req.body.userId, // Assuming you have user authentication in place
            issue,
            description,
            status: 'Pending', // Set default status
            attachment: req.file ? `/uploads/Issues/${req.file.filename}` : null, // Store the file link
            contractLink,
        });

        // Save the new issue to the database
        await newIssue.save();

        res.status(201).json({ message: 'Issue created successfully', newIssue });
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({ message: 'Failed to create issue' });
    }
});

export default  router;
