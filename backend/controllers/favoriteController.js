import Favorite from "../models/Favorite.js";
import BuySellPost from "../models/BuySellPost.js";
import HousingPost from "../models/HousingPost.js";

export const toggleFavorite = async (req, res) => {
  try {
    const { postType, postId } = req.body;
    const userId = req.user._id;

    const existing = await Favorite.findOne({ user: userId, postType, postId });

    if (existing) {
      await existing.deleteOne();
      res.json({ favorited: false, message: "Removed from favorites" });
    } else {
      await Favorite.create({ user: userId, postType, postId });
      res.json({ favorited: true, message: "Added to favorites" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    const buysellIds = favorites
      .filter((f) => f.postType === "buysell")
      .map((f) => f.postId);
    const housingIds = favorites
      .filter((f) => f.postType === "housing")
      .map((f) => f.postId);

    const [buysellPosts, housingPosts] = await Promise.all([
      BuySellPost.find({ _id: { $in: buysellIds } }).populate(
        "user",
        "name email"
      ),
      HousingPost.find({ _id: { $in: housingIds } }).populate(
        "user",
        "name email"
      ),
    ]);

    res.json({
      buysell: buysellPosts,
      housing: housingPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const { postType, postId } = req.query;
    const favorite = await Favorite.findOne({
      user: req.user._id,
      postType,
      postId,
    });
    res.json({ favorited: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
