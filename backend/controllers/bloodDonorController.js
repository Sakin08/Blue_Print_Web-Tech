import BloodDonor from "../models/BloodDonor.js";
import BloodRequest from "../models/BloodRequest.js";

// Calculate next eligible donation date (120 days)
const calculateNextEligibleDate = (lastDonationDate) => {
  const nextDate = new Date(lastDonationDate);
  nextDate.setDate(nextDate.getDate() + 120);
  return nextDate;
};

// Register as blood donor
export const registerDonor = async (req, res) => {
  try {
    const { bloodGroup, location, phone, lastDonationDate } = req.body;

    const existingDonor = await BloodDonor.findOne({ user: req.user._id });
    if (existingDonor) {
      return res.status(400).json({ message: "Already registered as donor" });
    }

    let nextEligibleDate = null;
    if (lastDonationDate) {
      nextEligibleDate = calculateNextEligibleDate(new Date(lastDonationDate));
    }

    const donor = await BloodDonor.create({
      user: req.user._id,
      bloodGroup,
      location,
      phone,
      lastDonationDate: lastDonationDate || null,
      nextEligibleDate,
    });

    await donor.populate(
      "user",
      "name email profilePicture department batch isStudentVerified"
    );

    res.status(201).json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all donors with filters
export const getDonors = async (req, res) => {
  try {
    const { bloodGroup, location, eligible } = req.query;
    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (location) filter.location = { $regex: location, $options: "i" };

    if (eligible === "true") {
      filter.$or = [
        { nextEligibleDate: { $lte: new Date() } },
        { nextEligibleDate: null },
      ];
      filter.isAvailable = true;
    }

    const donors = await BloodDonor.find(filter)
      .populate(
        "user",
        "name email profilePicture department batch isStudentVerified"
      )
      .sort({ nextEligibleDate: 1 });

    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get donor by user ID
export const getDonorByUserId = async (req, res) => {
  try {
    const donor = await BloodDonor.findOne({
      user: req.params.userId,
    }).populate(
      "user",
      "name email profilePicture department batch isStudentVerified"
    );

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update donor profile
export const updateDonor = async (req, res) => {
  try {
    const { bloodGroup, location, phone, isAvailable } = req.body;

    const donor = await BloodDonor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({ message: "Donor profile not found" });
    }

    if (bloodGroup) donor.bloodGroup = bloodGroup;
    if (location) donor.location = location;
    if (phone) donor.phone = phone;
    if (isAvailable !== undefined) donor.isAvailable = isAvailable;

    await donor.save();
    await donor.populate(
      "user",
      "name email profilePicture department batch isStudentVerified"
    );

    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update donation (add to history)
export const updateDonation = async (req, res) => {
  try {
    const { date, location, notes } = req.body;

    const donor = await BloodDonor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({ message: "Donor profile not found" });
    }

    const donationDate = new Date(date);
    donor.lastDonationDate = donationDate;
    donor.nextEligibleDate = calculateNextEligibleDate(donationDate);
    donor.totalDonations += 1;

    donor.donationHistory.push({
      date: donationDate,
      location,
      status: "completed",
      notes,
    });

    await donor.save();
    await donor.populate(
      "user",
      "name email profilePicture department batch isStudentVerified"
    );

    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create blood request
export const createBloodRequest = async (req, res) => {
  try {
    const { bloodGroup, location, urgency, message, contactPhone, neededBy } =
      req.body;

    const request = await BloodRequest.create({
      requester: req.user._id,
      bloodGroup,
      location,
      urgency,
      message,
      contactPhone,
      neededBy,
    });

    await request.populate(
      "requester",
      "name email profilePicture department batch"
    );

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all blood requests
export const getBloodRequests = async (req, res) => {
  try {
    const { bloodGroup, status } = req.query;
    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (status) filter.status = status;
    else filter.status = "open";

    const requests = await BloodRequest.find(filter)
      .populate("requester", "name email profilePicture department batch")
      .populate("responses.donor", "name profilePicture")
      .sort({ urgency: -1, createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single blood request by ID
export const getBloodRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate("requester", "name email profilePicture department batch phone")
      .populate("responses.donor", "name profilePicture email phone");

    if (!request) {
      return res.status(404).json({ message: "Blood request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Respond to blood request
export const respondToRequest = async (req, res) => {
  try {
    const { status, message } = req.body;

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.responses.push({
      donor: req.user._id,
      status,
      message,
    });

    await request.save();
    await request.populate(
      "requester",
      "name email profilePicture department batch"
    );
    await request.populate("responses.donor", "name profilePicture");

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update request status
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete donor profile
export const deleteDonor = async (req, res) => {
  try {
    const donor = await BloodDonor.findOne({ user: req.user._id });
    if (!donor) {
      return res.status(404).json({ message: "Donor profile not found" });
    }

    await donor.deleteOne();
    res.json({ message: "Donor profile deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete blood request
export const deleteBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Allow admin or owner to delete
    const isOwner = request.requester.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await request.deleteOne();
    res.json({ message: "Blood request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
