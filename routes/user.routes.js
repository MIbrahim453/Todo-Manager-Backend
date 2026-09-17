import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
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
// Members need this list when sharing a todo; the controller excludes passwords.
router.get("/get-all-users", verifyJWT, getAllUsers);
router.get("/recent-users", verifyJWT, authorizeRoles("admin"), recentUsers);
router.put("/edit-profile", verifyJWT, editProfile);
router.delete("/delete-user/:id", verifyJWT, authorizeRoles("admin"), deleteUser);
router.put("/upload-profile-photo", verifyJWT, upload.single("profilePhoto"), uploadProfilePhoto,);

export default router;
