// Middleware to check if user is admin or owner of the resource
export const checkAdminOrOwner = (resource) => {
  return (req, res, next) => {
    // If user is admin, allow access
    if (req.user && req.user.role === "admin") {
      req.isAdmin = true;
      return next();
    }

    // If user is owner, allow access
    if (resource && resource.user) {
      const ownerId = resource.user._id || resource.user;
      if (ownerId.toString() === req.user._id.toString()) {
        req.isOwner = true;
        return next();
      }
    }

    // Neither admin nor owner
    return res.status(403).json({
      message: "Access denied. You must be the owner or an admin.",
    });
  };
};

// Helper to check if user can delete (admin or owner)
export const canDelete = (userId, resourceOwnerId) => {
  return (
    userId.role === "admin" ||
    userId._id.toString() === resourceOwnerId.toString()
  );
};
