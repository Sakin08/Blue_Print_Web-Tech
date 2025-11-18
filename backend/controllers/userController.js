import User from "../models/User.js";
import Review from "../models/Review.js";

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name profilePicture")
      .populate("following", "name profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's reviews
    const reviews = await Review.find({ reviewee: user._id })
      .populate("reviewer", "name profilePicture")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ user, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      interests,
      phone,
      department,
      username,
      gender,
      dateOfBirth,
      emergencyContact,
      socialLinks,
      address,
      dormInfo,
      coursesEnrolled,
      coursesTaught,
    } = req.body;

    const updateData = {};

    // Mandatory fields (can be updated)
    if (name) updateData.name = name;
    if (department) updateData.department = department;

    // Optional fields
    if (bio !== undefined) updateData.bio = bio;
    if (interests !== undefined) updateData.interests = interests;
    if (phone !== undefined) updateData.phone = phone;
    if (username !== undefined) updateData.username = username;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (emergencyContact !== undefined)
      updateData.emergencyContact = emergencyContact;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (address !== undefined) updateData.address = address;
    if (dormInfo !== undefined) updateData.dormInfo = dormInfo;
    if (coursesEnrolled !== undefined)
      updateData.coursesEnrolled = coursesEnrolled;
    if (coursesTaught !== undefined) updateData.coursesTaught = coursesTaught;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Follow user
export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      isFollowing: !isFollowing,
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create review
export const createReview = async (req, res) => {
  try {
    const { revieweeId, rating, comment, transactionType, relatedItem } =
      req.body;

    if (revieweeId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot review yourself" });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment,
      transactionType,
      relatedItem,
    });

    // Update reviewee's rating
    const reviews = await Review.find({ reviewee: revieweeId });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      rating: avgRating,
      reviewCount: reviews.length,
    });

    await review.populate("reviewer", "name profilePicture");
    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You already reviewed this transaction" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get user reviews
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate("reviewer", "name profilePicture")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get following users with lastActive info
export const getFollowingUsers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("following", "name profilePicture lastActive department")
      .select("following");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
