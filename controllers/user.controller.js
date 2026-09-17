import uploadOnCloudinary from "../config/cloudinary.js";
import Todo from "../models/todo.model.js";
import User from "../models/user.model.js";

const getMe = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error occurred while fetching the user",
      error: error.message,
    });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find().select("-password");
     const adminUsers = await User.countDocuments({ role: "admin" });
    const memberUsers = await User.countDocuments({ role: "member" });

    if (!allUsers) {
      return res.status(400).json({
        success: false,
        message: "Error occurred while fetching all the user",
      });
    }
    const todosPerUser = [];
    for (const user of allUsers) {
      const todoCount = await Todo.countDocuments({ userId: user._id });
      if (todoCount) {
        todosPerUser.push(todoCount);
      }
    }

    return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: {
        allUsers,
        todosPerUser,
        adminUsers,
        memberUsers,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error occurred while fetching all the users",
      error: error.message,
    });
  }
};

const recentUsers = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      message: "Recent users fetched successfully",
      data: recentUsers,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error occurred while fetching recent users",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const deleteUser = await Todo.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deleteUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error occurred while deleting users",
    });
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "User edited successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error occurred while editing users",
    });
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image file to upload",
      });
    }

    const profilePhoto = req.file.path;
    const uploadProfile = await uploadOnCloudinary(profilePhoto);

    if (!uploadProfile) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to cloud storage",
      });
    }

    const photoUrl = uploadProfile.url;

    const user = await User.findByIdAndUpdate(
      userId,
      {  profilePhoto: photoUrl },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error occurred while uploading profile photo",
    });
  }
};

export {
  getMe,
  getAllUsers,
  deleteUser,
  editProfile,
  uploadProfilePhoto,
  recentUsers,
};
