import Notification from "../models/Notification.js";

// Get all notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
      // Exclude self-notifications (safety net)
      $or: [{ sender: { $ne: req.user._id } }, { sender: { $exists: false } }],
    })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure user can only delete their own notifications
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this notification" });
    }

    await notification.deleteOne();
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all notifications for current user
export const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.user._id });
    res.json({
      message: "All notifications deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to create notification
export const createNotification = async (notificationData) => {
  try {
    // NEVER send notifications to yourself
    if (notificationData.recipient && notificationData.sender) {
      if (
        notificationData.recipient.toString() ===
        notificationData.sender.toString()
      ) {
        console.log("Skipping self-notification");
        return null;
      }
    }

    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Helper function to notify followers when user posts something
export const notifyFollowers = async (
  userId,
  postType,
  postTitle,
  postLink
) => {
  try {
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId).select("followers name");

    if (!user || !user.followers || user.followers.length === 0) {
      return;
    }

    const postTypeLabels = {
      event: "📅 Event",
      job: "💼 Job",
      food: "🍕 Food Order",
      housing: "🏠 Housing",
      buysell: "🛍️ Buy/Sell",
      lostfound: "🔍 Lost & Found",
      studygroup: "📚 Study Group",
    };

    // Filter out the user themselves from followers
    const notifications = user.followers
      .filter((followerId) => followerId.toString() !== userId.toString())
      .map((followerId) => ({
        recipient: followerId,
        sender: userId,
        type: `${postType}_posted`,
        title: `${user.name} posted a new ${
          postTypeLabels[postType] || postType
        }`,
        message: postTitle,
        link: postLink,
        read: false,
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error("Error notifying followers:", error);
  }
};

// Helper function to notify content owner (e.g., when someone comments, likes, etc.)
export const notifyContentOwner = async (
  ownerId,
  actorId,
  actionType,
  contentTitle,
  contentLink
) => {
  try {
    // Don't notify if the actor is the owner
    if (ownerId.toString() === actorId.toString()) {
      return;
    }

    const User = (await import("../models/User.js")).default;
    const actor = await User.findById(actorId).select("name");

    if (!actor) {
      return;
    }

    const actionLabels = {
      comment: "commented on",
      like: "liked",
      rsvp: "RSVP'd to",
      interested: "is interested in",
      join: "joined",
    };

    await createNotification({
      recipient: ownerId,
      sender: actorId,
      type: `${actionType}_added`,
      title: `${actor.name} ${actionLabels[actionType] || actionType}`,
      message: contentTitle,
      link: contentLink,
    });
  } catch (error) {
    console.error("Error notifying content owner:", error);
  }
};
