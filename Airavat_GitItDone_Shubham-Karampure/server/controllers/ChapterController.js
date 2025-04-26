const ComicBlog = require("../models/ComicBlogs");
const Chapter = require("../models/Chapter");
const User = require("../models/User");
const imageService = require("../services/imageService");

class ComicBlogController {
  async createComicBlog(req, res) {
    try {
      const { title, email, chapters } = req.body;
      
      // Log incoming data for debugging
      console.log("Creating comic blog with data:", {
        title,
        email,
        chaptersLength: chapters?.length,
      });
      
      // Validate required fields
      if (!title || !email || !chapters || !Array.isArray(chapters) || chapters.length === 0) {
        return res.status(400).json({ 
          message: "Invalid request data. Title, email, and at least one chapter are required.",
          receivedData: { title, email, chaptersCount: chapters?.length || 0 }
        });
      }
      
      // Map chapters to ensure proper structure
      const formattedChapters = chapters.map((chapter, index) => ({
        chapter_number: chapter.chapter_number || index + 1,
        chapter_title: chapter.chapter_title || `Chapter ${index + 1}`,
        chat_bubbles: chapter.chat_bubbles || chapter.chat_bubble || [],
        conclusion: chapter.conclusion || "",
        image_context: chapter.image_context || "",
        narration_box: chapter.narration_box || "",
        image_url: chapter.image_url || "",
      }));
      
      // Create ComicBlog with processed chapters array
      const comicBlog = await ComicBlog.create({
        title,
        email,
        chapters: formattedChapters,
      });

      return res.status(201).json({
        message: "Comic blog created successfully with chapters and images",
        comicBlog,
      });
    } catch (err) {
      console.error("Error creating comic blog:", err);
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
    }
  }

  async getComicBlogs(req, res) {
    try {
      // Populate the 'email' field and the 'chapters' field within the comic blog
      const blogs = await ComicBlog.find()
        .populate("email") // Populates the email field in the comic blog
        .populate("chapters"); // Populates the chapters field in the comic blog

      // Update the image URL to use correct path
      const updatedBlogs = blogs.map((blog) => {
        return {
          ...blog.toObject(),
          chapters: blog.chapters.map((chapter) => ({
            ...chapter.toObject(),
            image_url: chapter.image_url.replace(/\\/g, "/"), // Ensure image URL uses correct path format
          })),
        };
      });

      return res.status(200).json({ blogs: updatedBlogs });
    } catch (err) {
      console.error("Error fetching comic blogs:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getBlogChapters(req, res) {
    try {
      const { title } = req.body;

      const chapters = await Chapter.find({ title }).sort({
        chapter_number: 1,
      });
      return res.status(200).json({ chapters });
    } catch (err) {
      console.error("Error fetching blog chapters:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new ComicBlogController();
