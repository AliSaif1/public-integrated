import Blog from '../models/Blog.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { storage } from '../config/firebase.js';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';

// Function to remove a blog post from the Blog collection by its _id
const removeLastBlogPost = async (blogID) => {
  await Blog.updateMany(
    { 'blogPosts._id': blogID },
    { $pull: { blogPosts: { _id: blogID } } }
  );
};

// Controller to create a blog
export const createBlog = async (req, res) => {
  const { title, body } = req.body;
  const authHeader = req.headers.authorization; // Authorization token
  const blogMainImg = req.file; // Uploaded image file

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  // eslint-disable-next-line no-undef
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // Token verification
  const userID = decoded.id;

  const month = new Date().toISOString().slice(0, 7); // Current month (e.g., "2024-08")
  let blogEntry = await Blog.findOne({ month });

  try {
    // Upload the image to Firebase Storage if provided
    let blogMainImgURL = '';
    if (blogMainImg) {
      if (!blogMainImg.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: 'Invalid file type. Please upload an image.' });
      }

      const maxSize = 5 * 1024 * 1024; // 5MB limit
      if (blogMainImg.size > maxSize) {
        return res.status(400).json({ message: 'File size exceeds the 5MB limit.' });
      }

      const imgRef = ref(storage, `blogImages/${Date.now()}_${blogMainImg.originalname}`);
      await uploadBytes(imgRef, blogMainImg.buffer);
      blogMainImgURL = await getDownloadURL(imgRef);
    }

    if (!blogEntry) {
      blogEntry = new Blog({ month, blogPosts: [] }); // Initialize with an empty array
    }

    // Add the new blog post with the image URL and initialize monthly interactions
    const newBlog = {
      title,
      body,
      blogMainImg: blogMainImgURL,
      monthlyInteraction: {
        [month]: {
          likes: 0, // Default values
          commentedBy: {}, // Default empty object for comments
          shares: 0,
          visits: 0
        }
      }
    };

    blogEntry.blogPosts.push(newBlog);
    const savedBlogEntry = await blogEntry.save(); // Save the blogEntry with new blog post

    // Retrieve the newly created blog post's ID
    const newBlogID = savedBlogEntry.blogPosts[savedBlogEntry.blogPosts.length - 1]._id;

    const user = await User.findById(userID);

    if (user) {
      user.blogs.push({ blogID: newBlogID });
      await user.save();

      res.status(201).json({ message: 'Blog post created successfully', blog: { ...newBlog, _id: newBlogID }, userBlogsCount: user.blogs.length });
    } else {
      await removeLastBlogPost(newBlogID); // Remove the blog if user update fails
      res.status(500).json({ message: 'Error updating user blog list' });
    }
  } catch (error) {
    // eslint-disable-next-line no-undef
    if (blogEntry && blogEntry.blogPosts.some(post => post._id.equals(newBlogID))) {
      // eslint-disable-next-line no-undef
      await removeLastBlogPost(newBlogID); // Remove the blog if an error occurs
    }
    res.status(500).json({ message: 'Error creating blog post', error: error.message });
  }
};

// Get all user's blog posts
export const getAllUserBlogs = async (req, res) => {
  const authHeader = req.headers.authorization; // Authorization token

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Token verification
    const userID = decoded.id;

    let monthsBack = parseInt(req.query.monthsBack, 10);

    // Get the current date and calculate the start date for the last specified months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Format start and end dates as YYYY-MM
    const startMonth = startDate.toISOString().slice(0, 7);
    const endMonth = endDate.toISOString().slice(0, 7);

    // Fetch the user's blog IDs from the users collection
    const user = await User.findById(userID).select('blogs');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const blogIDs = user.blogs.map(blog => blog.blogID);

    // Fetch blogs within the specified date range using the blog IDs
    const blogs = await Blog.aggregate([
      { $match: { month: { $gte: startMonth, $lte: endMonth } } }, // Match documents within the date range
      {
        $project: {
          blogs: {
            $filter: {
              input: '$blogPosts',
              as: 'blog',
              cond: { $in: ['$$blog._id', blogIDs] }
            }
          }
        }
      },
      { $unwind: '$blogs' }, // Unwind the array of blog posts
      { $sort: { 'blogs.postedAt': -1 } } // Sort by posted date in descending order
    ]);

    // Set no-caching headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
};

export const getPaginatedBlogs = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and extract user ID
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get pagination parameters
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 15;

    // Fetch blogs and populate user details
    const blogs = await Blog.find({})
      .select('blogPosts')
      .lean() // Convert documents to plain objects
      .exec();

    // Aggregate blog posts
    let allPosts = [];
    blogs.forEach(blog => {
      allPosts = allPosts.concat(blog.blogPosts);
    });

    // Sort by date (newest first)
    const sortedPosts = allPosts.sort((a, b) => b.postedAt - a.postedAt);

    // Slice for pagination
    const paginatedPosts = sortedPosts.slice(skip, skip + limit);

    // Fetch the user details and liked/saved status for each post
    const enrichedPosts = await Promise.all(
      paginatedPosts.map(async post => {
        const postObj = post; // Post is already a plain object due to `.lean()`

        // Fetch the user who posted the blog
        const user = await User.findOne({ blogs: { $elemMatch: { blogID: postObj._id } } })
          .select('fullName photo')
          .lean()
          .exec();

        // Get the current month's interaction data
        const currentMonth = new Date().toISOString().slice(0, 7); // Format as YYYY-MM
        const interactions = postObj.monthlyInteraction[currentMonth] || {
          likes: 0,
          commentedBy: {},
          shares: 0,
          visits: 0
        };

        // Calculate the number of comments
        const commentsCount = Object.keys(interactions.commentedBy).length;

        // Check if the current user has liked or saved the post
        const currentUser = await User.findById(userId).select('likedPosts savedPosts').lean().exec();
        
        // Safeguard against undefined likedPosts and savedPosts
        const likedPosts = currentUser?.likedPosts || [];
        const savedPosts = currentUser?.savedPosts || [];
        
        const liked = likedPosts.some(likedPost => likedPost.postID.toString() === postObj._id.toString());
        const saved = savedPosts.some(savedPost => savedPost.postID.toString() === postObj._id.toString());

        return {
          _id: postObj._id,
          title: postObj.title,
          body: postObj.body,
          postedAt: postObj.postedAt,
          blogMainImg: postObj.blogMainImg,
          likes: interactions.likes,
          commentsCount,  // Only pass the count of comments
          shares: interactions.shares,
          liked,  // Add liked status
          saved,  // Add saved status
          author: {
            fullName: user?.fullName || 'Unknown',
            photo: user?.photo || 'default.jpg'  // Use a default image if photo not available
          }
        };
      })
    );

    // Send the enriched paginated blogs
    res.status(200).json({
      blogs: enrichedPosts,
      hasMore: sortedPosts.length > skip + limit
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      console.error('Error fetching blogs:', error);
      return res.status(500).json({ message: 'Error fetching blogs', error: error.message });
    }
  }
};

export const toggleLikePost = async (req, res) => {
  const authHeader = req.headers.authorization; // Authorization token

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Token verification
    const userID = decoded.id;
    const { postId } = req.body; // Assuming blogId is also provided

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the post is already liked
    const likedPostIndex = user.likedPosts.findIndex(post => post.postID.toString() === postId);

    const currentMonth = new Date().toISOString().slice(0, 7); // Format as YYYY-MM

    if (likedPostIndex > -1) {
      // Post is already liked, so remove it from likedPosts
      user.likedPosts.splice(likedPostIndex, 1);

      // Decrement the likes count in the Blog collection for the specific month
      await Blog.updateOne(
        { 'blogPosts._id': postId },
        { $inc: { [`blogPosts.$.monthlyInteraction.${currentMonth}.likes`]: -1 } }
      );

      await user.save();
      return res.status(200).json({ message: 'Post unliked successfully' });
    } else {
      // Post is not liked yet, so add it to likedPosts
      user.likedPosts.push({ postID: postId });

      // Increment the likes count in the Blog collection for the specific month
      await Blog.updateOne(
        { 'blogPosts._id': postId },
        { $inc: { [`blogPosts.$.monthlyInteraction.${currentMonth}.likes`]: 1 } }
      );

      await user.save();
      return res.status(200).json({ message: 'Post liked successfully' });
    }
  } catch (error) {
    console.error('Error toggling like status:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error toggling like status', error: error.message });
  }
};

export const toggleSavePost = async (req, res) => {
  const authHeader = req.headers.authorization; // Authorization token

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Token verification
    const userID = decoded.id;
    const { postId } = req.body; // Assuming blogId is also provided

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the post is already saved
    const savedPostIndex = user.savedPosts.findIndex(post => post.postID.toString() === postId);

    if (savedPostIndex > -1) {
      // Post is already saved, so remove it from savedPosts
      user.savedPosts.splice(savedPostIndex, 1);

      await user.save();
      return res.status(200).json({ message: 'Post unsaved successfully' });
    } else {
      // Post is not saved yet, so add it to savedPosts
      user.savedPosts.push({ postID: postId });

      await user.save();
      return res.status(200).json({ message: 'Post saved successfully' });
    }
  } catch (error) {
    console.error('Error toggling save status:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error toggling save status', error: error.message });
  }
};

export const getSavedPosts = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and extract user ID
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch the user details and savedPosts
    const user = await User.findById(userId).select('savedPosts').lean().exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedPosts = user.savedPosts || [];
    const savedPostIds = savedPosts.map(post => post.postID.toString()); // Keep IDs as strings

    // Fetch all blog posts
    const blogs = await Blog.find({}).select('blogPosts').lean().exec();

    // Collect all posts from all blogs
    let allPosts = [];
    blogs.forEach(blog => {
      allPosts = allPosts.concat(blog.blogPosts);
    });

    // Filter posts that match saved post IDs
    const filteredPosts = allPosts.filter(post => savedPostIds.includes(post._id.toString()));

    // Fetch user details for each post
    const enrichedPosts = await Promise.all(
      filteredPosts.map(async post => {

        // Fetch the user who posted the blog
        const author = await User.findOne({ blogs: { $elemMatch: { blogID: post._id } } })
        .select('fullName photo')
        .lean()
        .exec();

        // Get the current month's interaction data
        const currentMonth = new Date().toISOString().slice(0, 7); // Format as YYYY-MM
        const interactions = post.monthlyInteraction[currentMonth] || {
          likes: 0,
          commentedBy: {},
          shares: 0,
          visits: 0
        };

        // Calculate the number of comments
        const commentsCount = Object.keys(interactions.commentedBy).length;

        return {
          _id: post._id,
          title: post.title,
          body: post.body,
          postedAt: post.postedAt,
          blogMainImg: post.blogMainImg,
          likes: interactions.likes,
          commentsCount,
          shares: interactions.shares,
          author: {
            fullName: author?.fullName || 'Unknown',
            photo: author?.photo || 'default.jpg'
          }
        };
      })
    );

    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Expires', '0');
    res.setHeader('Pragma', 'no-cache');

    // Send the enriched saved posts
    res.status(200).json({
      posts: enrichedPosts,
      hasMore: enrichedPosts.length > 0
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      console.error('Error fetching saved posts:', error);
      return res.status(500).json({ message: 'Error fetching saved posts', error: error.message });
    }
  }
};

export const getComments = async (req, res) => {
  const { postId } = req.params; // Assuming the postId is passed as a URL parameter
  const { page = 1 } = req.query; // Default to page 1 if no page is specified
  const limit = 100; // Limit to 100 comments per page

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch the post by postId
    const post = await Blog.findOne({ 'blogPosts._id': postId })
      .select('blogPosts.$')  // Fetch only the post with the specific postId
      .lean()
      .exec();

    if (!post || !post.blogPosts || post.blogPosts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const blogPost = post.blogPosts[0]; // Extract the post

    let allComments = [];

    // Loop through monthly interactions to gather all comments
    blogPost.monthlyInteraction.forEach((interactionData) => {
      const commentsMap = interactionData.commentedBy || new Map();

      // Loop through each user ID and gather comments with the user information
      for (const [userId, comments] of commentsMap.entries()) {
        const user = User.findById(userId).select('fullName').lean().exec();
        const userName = user?.fullName || 'Unknown User';

        // Attach user name to each comment and push to allComments array
        comments.forEach(comment => {
          allComments.push({
            body: comment.body,
            userName
          });
        });
      }
    });

    // Implement pagination
    const startIndex = (page - 1) * limit;
    const paginatedComments = allComments.slice(startIndex, startIndex + limit);

    // Check if there are more comments
    const hasMore = startIndex + limit < allComments.length;

    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Expires', '0');
    res.setHeader('Pragma', 'no-cache');

    // Respond with paginated comments
    res.status(200).json({
      comments: paginatedComments,
      hasMore,
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
  }
};

export const addComment = async (req, res) => {
  const { postId } = req.params; // Assuming postId is passed as a URL parameter
  const { body } = req.body; // Assuming the comment body is passed in the request body

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch the post by postId
    const post = await Blog.findOne({ 'blogPosts._id': postId })
      .select('blogPosts.$')  // Fetch only the post with the specific postId
      .lean()
      .exec();

    if (!post || !post.blogPosts || post.blogPosts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const blogPost = post.blogPosts[0]; // Extract the post

    // Convert monthlyInteraction to a plain object if it's a Map
    if (blogPost.monthlyInteraction && blogPost.monthlyInteraction instanceof Map) {
      blogPost.monthlyInteraction = Object.fromEntries(blogPost.monthlyInteraction);
    }

    // Define the current month in 'YYYY-MM' format
    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    // Find the interaction data for the current month or create a new one
    let interactionData = blogPost.monthlyInteraction[currentMonth];

    if (!interactionData) {
      interactionData = {
        likes: 0,
        commentedBy: {},
        shares: 0,
        visits: 0
      };
      blogPost.monthlyInteraction[currentMonth] = interactionData;
    }

    // Initialize the comments map for the user if it doesn't exist
    if (!interactionData.commentedBy[userId]) {
      interactionData.commentedBy[userId] = [];
    }

    // Add the new comment
    interactionData.commentedBy[userId].push({ body });

    // Convert the monthlyInteraction object back to a Map for storage
    const monthlyInteractionMap = new Map(Object.entries(blogPost.monthlyInteraction));

    // Save the updated post
    await Blog.updateOne(
      { 'blogPosts._id': postId },
      { $set: { 'blogPosts.$.monthlyInteraction': monthlyInteractionMap } }
    );

    res.status(200).json({ message: 'Comment added successfully' });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      console.error('Error adding comment:', error);
      return res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
  }
};

export const updateBlog = async (req, res) => {
  const { title, body } = req.body;
  const authHeader = req.headers.authorization; // Authorization token
  const blogMainImg = req.file; // Uploaded image file
  const blogId = req.params.postId; // Blog ID from request parameters

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  try {
    // Verify the token and get userID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.id;

    // Find the blog post across all months
    const blogEntry = await Blog.findOne({ 'blogPosts._id': blogId });

    if (!blogEntry) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Find the index of the blog post to update
    const blogPostIndex = blogEntry.blogPosts.findIndex(post => post._id.toString() === blogId);

    if (blogPostIndex === -1) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Update the blog post fields
    if (title) blogEntry.blogPosts[blogPostIndex].title = title;
    if (body) blogEntry.blogPosts[blogPostIndex].body = body;

    if (blogMainImg) {
      if (!blogMainImg.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: 'Invalid file type. Please upload an image.' });
      }

      const maxSize = 5 * 1024 * 1024; // 5MB limit
      if (blogMainImg.size > maxSize) {
        return res.status(400).json({ message: 'File size exceeds the 5MB limit.' });
      }

      // Delete the old image from Firebase Storage
      const oldImgURL = blogEntry.blogPosts[blogPostIndex].blogMainImg;
      if (oldImgURL) {
        const oldImgRef = ref(storage, oldImgURL);
        await deleteObject(oldImgRef);
      }

      // Upload the new image to Firebase Storage
      const imgRef = ref(storage, `blogImages/${Date.now()}_${blogMainImg.originalname}`);
      await uploadBytes(imgRef, blogMainImg.buffer);
      const newImgURL = await getDownloadURL(imgRef);

      // Update the image URL
      blogEntry.blogPosts[blogPostIndex].blogMainImg = newImgURL;
    }

    // Save the updated blog entry
    await blogEntry.save();

    res.status(200).json({ message: 'Blog post updated successfully', blog: blogEntry.blogPosts[blogPostIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog post', error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  const authHeader = req.headers.authorization; // Authorization token
  const blogId = req.params.postId; // Blog ID from request parameters

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and get userID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.id;

    // Find the blog post across all months
    const blogEntry = await Blog.findOne({ 'blogPosts._id': blogId });

    if (!blogEntry) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Find the index of the blog post to delete
    const blogPostIndex = blogEntry.blogPosts.findIndex(post => post._id.toString() === blogId);

    if (blogPostIndex === -1) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Remove the blog post from the blog entry
    blogEntry.blogPosts.splice(blogPostIndex, 1);
    await blogEntry.save();

    // Remove references from User collection
    await User.updateMany(
      { 
        $or: [
          { 'blogs.blogID': blogId },
          { 'likedPosts.postID': blogId },
          { 'savedPosts.postID': blogId }
        ]
      },
      {
        $pull: {
          blogs: { blogID: blogId },
          likedPosts: { postID: blogId },
          savedPosts: { postID: blogId }
        }
      }
    );

    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Error deleting blog post', error: error.message });
  }
};