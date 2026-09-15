import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const verifyJWT = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    const decodedUser = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
    const user = await User.findById(decodedUser.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error occurred while verifying request:", error);
  }
};

export { verifyJWT };

