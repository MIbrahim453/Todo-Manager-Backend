import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteUser,
  editProfile,
  getAllUsers,
  getMe,
  recentUsers,
  uploadProfilePhoto,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", verifyJWT, getMe);
router.get("/get-all-users", verifyJWT, getAllUsers);
router.get("/recent-users", verifyJWT, recentUsers);
router.put("/edit-profile", verifyJWT, editProfile);
router.delete("/delete-user/:id", verifyJWT, deleteUser);
router.put("/upload-profile-photo", verifyJWT, upload.single("profilePhoto"), uploadProfilePhoto,);

export default router;
