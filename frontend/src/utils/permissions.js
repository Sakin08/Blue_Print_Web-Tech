// Helper functions to check user permissions

export const canDelete = (currentUser, contentOwner) => {
  if (!currentUser) {
    return false;
  }

  // Admin can delete anything
  if (currentUser.role === "admin") {
    return true;
  }

  // Owner can delete their own content
  // Handle both object and string IDs - convert both to strings for comparison
  const ownerId =
    typeof contentOwner === "object" ? contentOwner?._id : contentOwner;
  const currentUserId = currentUser._id;

  // Convert both to strings and compare
  const ownerIdStr = String(ownerId || "");
  const currentUserIdStr = String(currentUserId || "");

  const isOwner = ownerIdStr === currentUserIdStr && ownerIdStr !== "";

  return isOwner;
};

export const canEdit = (currentUser, contentOwner) => {
  if (!currentUser) return false;

  // Admin can edit anything
  if (currentUser.role === "admin") return true;

  // Owner can edit their own content
  const ownerId = contentOwner?._id || contentOwner;
  return currentUser._id === ownerId;
};

export const isAdmin = (user) => {
  return user?.role === "admin";
};

export const isOwner = (currentUser, contentOwner) => {
  if (!currentUser || !contentOwner) return false;
  const ownerId = contentOwner?._id || contentOwner;
  return currentUser._id === ownerId;
};
