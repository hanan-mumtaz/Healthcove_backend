const express = require('express');
const router = express.Router();

const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/', authMiddleware, adminMiddleware, createBlog);
router.put('/:id', authMiddleware, adminMiddleware, updateBlog);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBlog);

module.exports = router;
const Blog = require('../models/Blog');

// Create Blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, image, category, status } = req.body;
    
    // Calculate read time automatically
    const wordsPerMinute = 200;
    const readTime = `${Math.ceil(content.split(/\s+/).length / wordsPerMinute)} min read`;

    const newBlog = new Blog({
      title,
      content,
      image,
      category,
      status,
      readTime,
      author: req.user.id // From authMiddleware
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: "Failed to create blog" });
  }
};

// Update Blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, image, category, status } = req.body;
    
    // Recalculate read time in case content changed
    const wordsPerMinute = 200;
    const readTime = `${Math.ceil(content.split(/\s+/).length / wordsPerMinute)} min read`;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, image, category, status, readTime },
      { new: true } // Returns the modified document
    );

    if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Failed to update blog" });
  }
};