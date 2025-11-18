import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import FoodOrder from "../models/FoodOrder.js";
import Report from "../models/Report.js";
import BuySellPost from "../models/BuySellPost.js";
import HousingPost from "../models/HousingPost.js";
import Event from "../models/Event.js";
import Job from "../models/Job.js";
import StudyGroup from "../models/StudyGroup.js";
import LostFound from "../models/LostFound.js";
import Post from "../models/Post.js";
import BloodDonor from "../models/BloodDonor.js";
import BloodRequest from "../models/BloodRequest.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import Message from "../models/Message.js";
import RSVP from "../models/RSVP.js";
import Review from "../models/Review.js";
import Reminder from "../models/Reminder.js";
import MenuItem from "../models/MenuItem.js";
import FoodMenu from "../models/FoodMenu.js";

// Get pending users (not approved)
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve user
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { note } = req.body || {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isApproved = true;
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    if (note) user.approvalNote = note;

    await user.save();

    res.json({ message: "User approved successfully", user });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Reject/Delete user
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User rejected and deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, approved, search } = req.query;

    let query = {};
    if (role) query.role = role;
    if (approved !== undefined) query.isApproved = approved === "true";
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { registrationNumber: new RegExp(search, "i") },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      pendingUsers,
      totalRestaurants,
      totalOrders,
      students,
      teachers,
      staff,
      totalReports,
      pendingReports,
      totalBuySell,
      totalHousing,
      totalEvents,
      totalJobs,
      totalStudyGroups,
      totalLostFound,
      bannedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: false }),
      Restaurant.countDocuments(),
      FoodOrder.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "staff" }),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      BuySellPost.countDocuments(),
      HousingPost.countDocuments(),
      Event.countDocuments(),
      Job.countDocuments(),
      StudyGroup.countDocuments(),
      LostFound.countDocuments(),
      User.countDocuments({ isBanned: true }),
    ]);

    res.json({
      totalUsers,
      pendingUsers,
      totalRestaurants,
      totalOrders,
      totalReports,
      pendingReports,
      bannedUsers,
      usersByRole: {
        students,
        teachers,
        staff,
      },
      contentStats: {
        buySell: totalBuySell,
        housing: totalHousing,
        events: totalEvents,
        jobs: totalJobs,
        studyGroups: totalStudyGroups,
        lostFound: totalLostFound,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting system admin
    if (user.isSystemAdmin) {
      return res
        .status(403)
        .json({ message: "Cannot delete system administrator" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["student", "teacher", "other", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent admin from changing their own role
    if (userId === req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot change your own role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent changing system admin's role
    if (user.isSystemAdmin) {
      return res
        .status(403)
        .json({ message: "Cannot modify system administrator" });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    res.json({
      message: `User role updated from ${oldRole} to ${role} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Restaurant Management
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate("owner", "name email role")
      .sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();

    res.json({ message: "Restaurant status updated", restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRestaurantAdmin = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    await restaurant.deleteOne();
    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Order Management
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const orders = await FoodOrder.find(query)
      .populate("customer", "name email phone")
      .populate("restaurant", "name location")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reports Management
export const getAllReportsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate("reporter", "name email")
      .populate("reportedUser", "name email")
      .populate("resolvedBy", "name")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReportStatusAdmin = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      {
        status,
        adminNotes,
        resolvedBy: req.user._id,
        resolvedAt: status === "resolved" ? new Date() : undefined,
      },
      { new: true }
    )
      .populate("reporter", "name email")
      .populate("reportedUser", "name email");

    res.json({ message: "Report updated successfully", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const banUserAdmin = async (req, res) => {
  try {
    const { banReason } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent banning system admin
    if (user.isSystemAdmin) {
      return res
        .status(403)
        .json({ message: "Cannot ban system administrator" });
    }

    user.isBanned = true;
    user.banReason = banReason;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: "User banned successfully", user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unbanUserAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: false, banReason: "" },
      { new: true }
    ).select("-password");

    res.json({ message: "User unbanned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== EVENTS MANAGEMENT ====================
export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEventAdmin = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEventAdmin = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.eventId, req.body, {
      new: true,
      runValidators: true,
    }).populate("organizer", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== JOBS MANAGEMENT ====================
export const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJobAdmin = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJobAdmin = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.jobId, req.body, {
      new: true,
      runValidators: true,
    }).populate("postedBy", "name email");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== HOUSING MANAGEMENT ====================
export const getAllHousingAdmin = async (req, res) => {
  try {
    const housing = await HousingPost.find()
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(housing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHousingAdmin = async (req, res) => {
  try {
    const housing = await HousingPost.findByIdAndDelete(req.params.housingId);
    if (!housing) {
      return res.status(404).json({ message: "Housing post not found" });
    }
    res.json({ message: "Housing post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHousingAdmin = async (req, res) => {
  try {
    const housing = await HousingPost.findByIdAndUpdate(
      req.params.housingId,
      req.body,
      { new: true, runValidators: true }
    ).populate("postedBy", "name email");

    if (!housing) {
      return res.status(404).json({ message: "Housing post not found" });
    }
    res.json({ message: "Housing post updated successfully", housing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== BUY/SELL MANAGEMENT ====================
export const getAllBuySellAdmin = async (req, res) => {
  try {
    const posts = await BuySellPost.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBuySellAdmin = async (req, res) => {
  try {
    const post = await BuySellPost.findByIdAndDelete(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Buy/Sell post not found" });
    }
    res.json({ message: "Buy/Sell post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBuySellAdmin = async (req, res) => {
  try {
    const post = await BuySellPost.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true, runValidators: true }
    ).populate("seller", "name email");

    if (!post) {
      return res.status(404).json({ message: "Buy/Sell post not found" });
    }
    res.json({ message: "Buy/Sell post updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== LOST & FOUND MANAGEMENT ====================
export const getAllLostFoundAdmin = async (req, res) => {
  try {
    const items = await LostFound.find()
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLostFoundAdmin = async (req, res) => {
  try {
    const item = await LostFound.findByIdAndDelete(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Lost & Found item not found" });
    }
    res.json({ message: "Lost & Found item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLostFoundAdmin = async (req, res) => {
  try {
    const item = await LostFound.findByIdAndUpdate(
      req.params.itemId,
      req.body,
      { new: true, runValidators: true }
    ).populate("postedBy", "name email");

    if (!item) {
      return res.status(404).json({ message: "Lost & Found item not found" });
    }
    res.json({ message: "Lost & Found item updated successfully", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== STUDY GROUPS MANAGEMENT ====================
export const getAllStudyGroupsAdmin = async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate("creator", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudyGroupAdmin = async (req, res) => {
  try {
    const group = await StudyGroup.findByIdAndDelete(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }
    res.json({ message: "Study group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudyGroupAdmin = async (req, res) => {
  try {
    const group = await StudyGroup.findByIdAndUpdate(
      req.params.groupId,
      req.body,
      { new: true, runValidators: true }
    ).populate("creator", "name email");

    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }
    res.json({ message: "Study group updated successfully", group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== POSTS MANAGEMENT ====================
export const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePostAdmin = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePostAdmin = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.postId, req.body, {
      new: true,
      runValidators: true,
    }).populate("author", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== BLOOD DONATION MANAGEMENT ====================
export const getAllBloodDonorsAdmin = async (req, res) => {
  try {
    const donors = await BloodDonor.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBloodRequestsAdmin = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate("requestedBy", "name email phone")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBloodDonorAdmin = async (req, res) => {
  try {
    const donor = await BloodDonor.findByIdAndDelete(req.params.donorId);
    if (!donor) {
      return res.status(404).json({ message: "Blood donor not found" });
    }
    res.json({ message: "Blood donor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBloodRequestAdmin = async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndDelete(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: "Blood request not found" });
    }
    res.json({ message: "Blood request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBloodRequestStatusAdmin = async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.requestId,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate("requestedBy", "name email");

    if (!request) {
      return res.status(404).json({ message: "Blood request not found" });
    }
    res.json({ message: "Blood request status updated successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== COMMENTS MANAGEMENT ====================
export const getAllCommentsAdmin = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCommentAdmin = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== NOTIFICATIONS MANAGEMENT ====================
export const getAllNotificationsAdmin = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotificationAdmin = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(
      req.params.notificationId
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendBulkNotificationAdmin = async (req, res) => {
  try {
    const { title, message, type, targetRole } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Title and message are required" });
    }

    let users;
    if (targetRole === "all") {
      users = await User.find({ isApproved: true });
    } else {
      users = await User.find({ role: targetRole, isApproved: true });
    }

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for the selected role" });
    }

    const notifications = users.map((user) => ({
      recipient: user._id,
      title,
      message,
      type: type || "admin_info",
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    // Emit socket events to notify users in real-time
    if (req.app.get("io")) {
      const io = req.app.get("io");
      createdNotifications.forEach((notification) => {
        io.to(`user_${notification.recipient}`).emit(
          "notification",
          notification
        );
      });
    }

    res.json({
      message: `Notification sent to ${users.length} users`,
      count: users.length,
    });
  } catch (error) {
    console.error("Send bulk notification error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const sendNotificationToUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, message, type } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Title and message are required" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create notification
    const notification = await Notification.create({
      recipient: userId,
      title,
      message,
      type: type || "admin_info",
    });

    // Emit socket event to notify user in real-time
    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.to(`user_${userId}`).emit("notification", notification);
    }

    res.json({
      message: "Notification sent successfully",
      notification,
    });
  } catch (error) {
    console.error("Send notification to user error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== MESSAGES MANAGEMENT ====================
export const getAllMessagesAdmin = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessageAdmin = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== RSVP MANAGEMENT ====================
export const getAllRSVPsAdmin = async (req, res) => {
  try {
    const rsvps = await RSVP.find()
      .populate("user", "name email")
      .populate("event", "title date")
      .sort({ createdAt: -1 });
    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRSVPAdmin = async (req, res) => {
  try {
    const rsvp = await RSVP.findByIdAndDelete(req.params.rsvpId);
    if (!rsvp) {
      return res.status(404).json({ message: "RSVP not found" });
    }
    res.json({ message: "RSVP deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== REVIEWS MANAGEMENT ====================
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== REMINDERS MANAGEMENT ====================
export const getAllRemindersAdmin = async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate("user", "name email")
      .sort({ reminderDate: -1 })
      .limit(200);
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReminderAdmin = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.reminderId);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== MENU ITEMS MANAGEMENT ====================
export const getAllMenuItemsAdmin = async (req, res) => {
  try {
    const items = await MenuItem.find()
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMenuItemAdmin = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMenuItemAdmin = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.itemId, req.body, {
      new: true,
      runValidators: true,
    }).populate("restaurant", "name");

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json({ message: "Menu item updated successfully", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== ENHANCED DASHBOARD STATS ====================
export const getEnhancedDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      pendingUsers,
      totalRestaurants,
      totalOrders,
      students,
      teachers,
      staff,
      totalReports,
      pendingReports,
      totalBuySell,
      totalHousing,
      totalEvents,
      totalJobs,
      totalStudyGroups,
      totalLostFound,
      bannedUsers,
      totalPosts,
      totalBloodDonors,
      totalBloodRequests,
      totalComments,
      totalMessages,
      totalRSVPs,
      totalReviews,
      totalReminders,
      totalMenuItems,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApproved: false }),
      Restaurant.countDocuments(),
      FoodOrder.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "staff" }),
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      BuySellPost.countDocuments(),
      HousingPost.countDocuments(),
      Event.countDocuments(),
      Job.countDocuments(),
      StudyGroup.countDocuments(),
      LostFound.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Post.countDocuments(),
      BloodDonor.countDocuments(),
      BloodRequest.countDocuments(),
      Comment.countDocuments(),
      Message.countDocuments(),
      RSVP.countDocuments(),
      Review.countDocuments(),
      Reminder.countDocuments(),
      MenuItem.countDocuments(),
    ]);

    res.json({
      totalUsers,
      pendingUsers,
      bannedUsers,
      usersByRole: {
        students,
        teachers,
        staff,
      },
      contentStats: {
        posts: totalPosts,
        events: totalEvents,
        jobs: totalJobs,
        buySell: totalBuySell,
        housing: totalHousing,
        studyGroups: totalStudyGroups,
        lostFound: totalLostFound,
      },
      restaurantStats: {
        totalRestaurants,
        totalOrders,
        totalMenuItems,
        totalReviews,
      },
      bloodDonationStats: {
        totalDonors: totalBloodDonors,
        totalRequests: totalBloodRequests,
      },
      engagementStats: {
        totalComments,
        totalMessages,
        totalRSVPs,
        totalReminders,
      },
      moderationStats: {
        totalReports,
        pendingReports,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
