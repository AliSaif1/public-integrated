import { storage } from '../config/firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import mongoose from 'mongoose';
import user from '../models/user.js';

export const saveInfluencerIn = async (req, res) => {
  const { userId, position, companySize, influencersWorkedWith, brandName, website, category } = req.body;
  const logo = req.file;
console.log("Request body is")
console.log(req.body)
   // Validate that the userId is a valid ObjectId

  //  if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ message: 'Invalid user ID.' });
  // }
  // // Check if userId is present and is a 24-character hexadecimal string
  // if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ message: 'Invalid user ID. User ID must be a valid 24-character MongoDB ObjectId.' });
  // }

  if (!logo) {
    return res.status(400).json({ message: 'No logo file uploaded.' });
  }


  try {
    // Validate that the uploaded file is an image
    if (!logo.mimetype.startsWith('image/')) {
      console.error('Invalid file type. File type:', logo.mimetype);
      return res.status(400).json({ message: 'Invalid file type. Please upload an image.' });
    }

    // Check file size (limit: 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (logo.size > maxSize) {
      console.error('File size exceeds limit. File size:', logo.size);
      return res.status(400).json({ message: 'File size exceeds the 5MB limit.' });
    }

    // Upload the logo to Firebase Storage
    const logoRef = ref(storage, `logos/${Date.now()}_${logo.originalname}`);
    await uploadBytes(logoRef, logo.buffer);
    const logoURL = await getDownloadURL(logoRef);

    // Update the user information in the database
    const updatedUser = await user.findByIdAndUpdate(
      userId,
      {
        position,            // Optional position field
        companySize,         // Company size
        influencersWorkedWith, // Number of influencers worked with
        fullName: brandName,           // Brand's name
        website,             // Website URL
        photo: logoURL,       // Uploaded logo URL
        category,            // Array of categories
        status: true   // Update status to 'complete'
      },
      { new: true } // Return the updated document
    );

    

    if (updatedUser) {



      res.cookie("pC", '1', {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        sameSite: 'strict',
        path: '/', 
      });
  
  
  
  
      res.status(200).json({ message: 'Brand created successfully' , user: updatedUser});
    } else {
      console.error('User not found:', userId);
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Save influencer info error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};