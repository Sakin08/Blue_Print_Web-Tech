import FoodOrder from "../models/FoodOrder.js";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";

// Create order
export const createOrder = async (req, res) => {
  try {
    const {
      restaurant,
      items,
      deliveryAddress,
      deliveryLocation,
      phone,
      paymentMethod,
      specialInstructions,
    } = req.body;

    // Validate restaurant
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check if restaurant is active
    if (!restaurantDoc.isActive) {
      return res
        .status(400)
        .json({ message: "Restaurant is not accepting orders" });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res
          .status(404)
          .json({ message: `Menu item ${item.menuItem} not found` });
      }
      if (!menuItem.available) {
        return res
          .status(400)
          .json({ message: `${menuItem.name} is not available` });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
      });
    }

    const deliveryFee = restaurantDoc.deliveryFee || 0;
    const total = subtotal + deliveryFee;

    // Check minimum order
    if (restaurantDoc.minimumOrder && subtotal < restaurantDoc.minimumOrder) {
      return res.status(400).json({
        message: `Minimum order amount is ৳${restaurantDoc.minimumOrder}`,
      });
    }

    const order = await FoodOrder.create({
      customer: req.user._id,
      restaurant,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress,
      deliveryLocation,
      phone,
      paymentMethod,
      specialInstructions,
    });

    await order.populate([
      { path: "customer", select: "name email phone" },
      { path: "restaurant", select: "name phone location" },
    ]);

    // Update restaurant stats
    restaurantDoc.totalOrders = (restaurantDoc.totalOrders || 0) + 1;
    await restaurantDoc.save();

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await FoodOrder.find({ customer: req.user._id })
      .populate("restaurant", "name logo phone location")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get restaurant's orders (owner only)
export const getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (
      restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const orders = await FoodOrder.find({ restaurant: req.params.restaurantId })
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await FoodOrder.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("restaurant", "name logo phone location owner");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isCustomer =
      order.customer._id.toString() === req.user._id.toString();
    const isOwner =
      order.restaurant.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (restaurant owner only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await FoodOrder.findById(req.params.id).populate(
      "restaurant"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the restaurant
    if (
      order.restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = status;

    // Update timestamps
    if (status === "confirmed") order.confirmedAt = new Date();
    if (status === "preparing") order.preparingAt = new Date();
    if (status === "ready") order.readyAt = new Date();
    if (status === "delivered") order.deliveredAt = new Date();

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await FoodOrder.findById(req.params.id).populate(
      "restaurant"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isOwner =
      order.restaurant.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Can't cancel if already delivered
    if (order.status === "delivered") {
      return res.status(400).json({ message: "Cannot cancel delivered order" });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.cancelledBy = isCustomer
      ? "customer"
      : isOwner
      ? "restaurant"
      : "admin";

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add review
export const addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await FoodOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if customer
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Can only review delivered orders
    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Can only review delivered orders" });
    }

    order.rating = rating;
    order.review = review;
    order.reviewedAt = new Date();
    await order.save();

    // Update restaurant rating
    const restaurant = await Restaurant.findById(order.restaurant);
    const totalRating = restaurant.rating * restaurant.totalReviews + rating;
    restaurant.totalReviews += 1;
    restaurant.rating = totalRating / restaurant.totalReviews;
    await restaurant.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
