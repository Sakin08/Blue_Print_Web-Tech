import StudyGroup from "../models/StudyGroup.js";

export const createStudyGroup = async (req, res) => {
  try {
    const {
      title,
      course,
      description,
      subject,
      meetingType,
      location,
      meetingLink,
      schedule,
      maxMembers,
      tags,
    } = req.body;

    const studyGroup = await StudyGroup.create({
      title,
      course,
      description,
      subject,
      meetingType,
      location,
      meetingLink,
      schedule,
      maxMembers: maxMembers || 0,
      tags: tags ? JSON.parse(tags) : [],
      creator: req.user._id,
      members: [req.user._id], // Creator is automatically a member
    });

    await studyGroup.populate(
      "creator",
      "name email profilePicture department batch isStudentVerified"
    );

    res.status(201).json(studyGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudyGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find({ isActive: true })
      .populate(
        "creator",
        "name email profilePicture department batch isStudentVerified"
      )
      .populate("members", "name profilePicture")
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudyGroupById = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate(
        "creator",
        "name email profilePicture department batch isStudentVerified"
      )
      .populate("members", "name email profilePicture");

    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinStudyGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    if (group.maxMembers > 0 && group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: "Group is full" });
    }

    group.members.push(req.user._id);
    await group.save();
    await group.populate(
      "creator",
      "name email profilePicture department batch isStudentVerified"
    );
    await group.populate("members", "name profilePicture");

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveStudyGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    group.members = group.members.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await group.save();

    res.json({ message: "Left study group" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudyGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Study group not found" });
    }

    // Allow admin or owner to delete
    const isOwner = group.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await group.deleteOne();
    res.json({ message: "Study group deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
