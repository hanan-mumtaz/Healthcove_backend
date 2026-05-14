const Blog = require('../models/Blog');

// 1. Get All Blogs (With Search & Category Filtering)
exports.getBlogs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== "All") query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs" });
  }
};

// 2. Get Single Blog
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name picture');
    
    if (!blog) return res.status(404).json({ message: "Blog post not found" });
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching the blog post", error: error.message });
  }
};

// 3. Create Blog (Dietitian Only)
exports.createBlog = async (req, res) => {
  try {
    // Calculate read time based on 200 words per minute
    const wordsPerMinute = 200;
    const wordCount = req.body.content.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / wordsPerMinute)} min read`;

    const blog = new Blog({
      ...req.body,
      author: req.user.id, // ✅ Critical: Attach admin ID from authMiddleware
      readTime: readTime    // ✅ Auto-generated
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error("Blog Create Error:", error.message);
    res.status(400).json({ message: "Creation failed", error: error.message });
  }
};

// 4. Update Blog (Dietitian Only)
exports.updateBlog = async (req, res) => {
  try {
    // Recalculate read time in case content was updated
    const wordsPerMinute = 200;
    const wordCount = req.body.content ? req.body.content.split(/\s+/).length : 0;
    const readTime = wordCount > 0 ? `${Math.ceil(wordCount / wordsPerMinute)} min read` : undefined;

    const updateData = { ...req.body };
    if (readTime) updateData.readTime = readTime;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });
    
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// 5. Delete Blog
exports.deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};