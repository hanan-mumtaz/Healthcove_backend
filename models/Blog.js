const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Blog title is required"], 
      trim: true 
    },
    content: { 
      type: String, 
      required: [true, "Blog content is required"] 
    },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    image: { 
      type: String, 
      required: [true, "Cover image URL is required"] 
    },
    category: { 
      type: String, 
      default: "Nutrition" 
    },
    // ✅ ADDED: Status to match the Frontend (Draft/Published)
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft'
    },
    tags: [{ type: String }],
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    // ✅ IMPROVED: Optional helper for the frontend
    readTime: { 
      type: String, 
      default: "5 min read" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);