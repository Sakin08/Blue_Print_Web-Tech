import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  getDashboardStats,
  deleteUser,
  updateUserRole,
  getAllRestaurants,
  toggleRestaurantStatus,
  deleteRestaurantAdmin,
  getAllOrders,
  getAllReportsAdmin,
  updateReportStatusAdmin,
  banUserAdmin,
  unbanUserAdmin,
  // Events
  getAllEventsAdmin,
  deleteEventAdmin,
  updateEventAdmin,
  // Jobs
  getAllJobsAdmin,
  deleteJobAdmin,
  updateJobAdmin,
  // Housing
  getAllHousingAdmin,
  deleteHousingAdmin,
  updateHousingAdmin,
  // Buy/Sell
  getAllBuySellAdmin,
  deleteBuySellAdmin,
  updateBuySellAdmin,
  // Lost & Found
  getAllLostFoundAdmin,
  deleteLostFoundAdmin,
  updateLostFoundAdmin,
  // Study Groups
  getAllStudyGroupsAdmin,
  deleteStudyGroupAdmin,
  updateStudyGroupAdmin,
  // Posts
  getAllPostsAdmin,
  deletePostAdmin,
  updatePostAdmin,
  // Blood Donation
  getAllBloodDonorsAdmin,
  getAllBloodRequestsAdmin,
  deleteBloodDonorAdmin,
  deleteBloodRequestAdmin,
  updateBloodRequestStatusAdmin,
  // Comments
  getAllCommentsAdmin,
  deleteCommentAdmin,
  // Notifications
  getAllNotificationsAdmin,
  deleteNotificationAdmin,
  sendBulkNotificationAdmin,
  sendNotificationToUserAdmin,
  // Messages
  getAllMessagesAdmin,
  deleteMessageAdmin,
  // RSVPs
  getAllRSVPsAdmin,
  deleteRSVPAdmin,
  // Reviews
  getAllReviewsAdmin,
  deleteReviewAdmin,
  // Reminders
  getAllRemindersAdmin,
  deleteReminderAdmin,
  // Menu Items
  getAllMenuItemsAdmin,
  deleteMenuItemAdmin,
  updateMenuItemAdmin,
  // Enhanced Stats
  getEnhancedDashboardStats,
} from "../controllers/adminController.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect, adminOnly);

// Dashboard stats
router.get("/stats", getDashboardStats);
router.get("/stats/enhanced", getEnhancedDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/pending", getPendingUsers);
router.post("/users/:userId/approve", approveUser);
router.delete("/users/:userId/reject", rejectUser);
router.delete("/users/:userId", deleteUser);
router.patch("/users/:userId/role", updateUserRole);
router.post("/users/:userId/ban", banUserAdmin);
router.post("/users/:userId/unban", unbanUserAdmin);

// Restaurant management
router.get("/restaurants", getAllRestaurants);
router.patch(
  "/restaurants/:restaurantId/toggle-status",
  toggleRestaurantStatus
);
router.delete("/restaurants/:restaurantId", deleteRestaurantAdmin);

// Order management
router.get("/orders", getAllOrders);

// Menu Items management
router.get("/menu-items", getAllMenuItemsAdmin);
router.delete("/menu-items/:itemId", deleteMenuItemAdmin);
router.patch("/menu-items/:itemId", updateMenuItemAdmin);

// Reports management
router.get("/reports", getAllReportsAdmin);
router.patch("/reports/:reportId/status", updateReportStatusAdmin);

// Events management
router.get("/events", getAllEventsAdmin);
router.delete("/events/:eventId", deleteEventAdmin);
router.patch("/events/:eventId", updateEventAdmin);

// Jobs management
router.get("/jobs", getAllJobsAdmin);
router.delete("/jobs/:jobId", deleteJobAdmin);
router.patch("/jobs/:jobId", updateJobAdmin);

// Housing management
router.get("/housing", getAllHousingAdmin);
router.delete("/housing/:housingId", deleteHousingAdmin);
router.patch("/housing/:housingId", updateHousingAdmin);

// Buy/Sell management
router.get("/buy-sell", getAllBuySellAdmin);
router.delete("/buy-sell/:postId", deleteBuySellAdmin);
router.patch("/buy-sell/:postId", updateBuySellAdmin);

// Lost & Found management
router.get("/lost-found", getAllLostFoundAdmin);
router.delete("/lost-found/:itemId", deleteLostFoundAdmin);
router.patch("/lost-found/:itemId", updateLostFoundAdmin);

// Study Groups management
router.get("/study-groups", getAllStudyGroupsAdmin);
router.delete("/study-groups/:groupId", deleteStudyGroupAdmin);
router.patch("/study-groups/:groupId", updateStudyGroupAdmin);

// Posts management
router.get("/posts", getAllPostsAdmin);
router.delete("/posts/:postId", deletePostAdmin);
router.patch("/posts/:postId", updatePostAdmin);

// Blood Donation management
router.get("/blood-donors", getAllBloodDonorsAdmin);
router.get("/blood-requests", getAllBloodRequestsAdmin);
router.delete("/blood-donors/:donorId", deleteBloodDonorAdmin);
router.delete("/blood-requests/:requestId", deleteBloodRequestAdmin);
router.patch(
  "/blood-requests/:requestId/status",
  updateBloodRequestStatusAdmin
);

// Comments management
router.get("/comments", getAllCommentsAdmin);
router.delete("/comments/:commentId", deleteCommentAdmin);

// Notifications management
router.get("/notifications", getAllNotificationsAdmin);
router.delete("/notifications/:notificationId", deleteNotificationAdmin);
router.post("/notifications/bulk", sendBulkNotificationAdmin);
router.post("/notifications/user/:userId", sendNotificationToUserAdmin);

// Messages management
router.get("/messages", getAllMessagesAdmin);
router.delete("/messages/:messageId", deleteMessageAdmin);

// RSVPs management
router.get("/rsvps", getAllRSVPsAdmin);
router.delete("/rsvps/:rsvpId", deleteRSVPAdmin);

// Reviews management
router.get("/reviews", getAllReviewsAdmin);
router.delete("/reviews/:reviewId", deleteReviewAdmin);

// Reminders management
router.get("/reminders", getAllRemindersAdmin);
router.delete("/reminders/:reminderId", deleteReminderAdmin);

export default router;
