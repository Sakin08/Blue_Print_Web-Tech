import BuySellPost from "../models/BuySellPost.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const createPost = [
  upload.array("images", 5), // Allow up to 5 images
  async (req, res) => {
    try {
      const { title, description, price, location, coordinates } = req.body;
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "At least one image required" });
      }

      // Upload all images to Cloudinary
      const imageUrls = await Promise.all(
        req.files.map((file) => uploadImage(file))
      );

      const postData = {
        title,
        description,
        price,
        location,
        images: imageUrls,
        image: imageUrls[0], // First image as main
        user: req.user._id,
      };

      const post = await BuySellPost.create(postData);

      await post.populate(
        "user",
        "name email phone profilePicture department batch isStudentVerified"
      );

      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

export const getPosts = async (req, res) => {
  const posts = await BuySellPost.find().populate(
    "user",
    "name email phone profilePicture department batch isStudentVerified"
  );
  res.json(posts);
};

export const getPost = async (req, res) => {
  try {
    const post = await BuySellPost.findById(req.params.id).populate(
      "user",
      "name email phone profilePicture department batch isStudentVerified"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Increment view count without validation
    await BuySellPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { runValidators: false }
    );

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const post = await BuySellPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  Object.assign(post, req.body);
  await post.save();
  res.json(post);
};

export const deletePost = async (req, res) => {
  try {
    const post = await BuySellPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Allow admin or owner to delete
    const isOwner = post.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    console.log("Delete attempt:", {
      postId: req.params.id,
      postOwner: post.user.toString(),
      currentUser: req.user._id.toString(),
      userRole: req.user.role,
      isOwner,
      isAdmin,
    });

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
