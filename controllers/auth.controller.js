import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { auth } from "../config/firebase.js";

const generateToken = (user) => {
  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      type: "access",
    },
    process.env.JWT_ACCESS_SECRET_KEY,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY },
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET_KEY,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY },
  );

  return { accessToken, refreshToken };
};

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const createUser = await User.create({
      name,
      email,
      password: hashPassword,
      role: "member",
    });
    const user = await User.findById(createUser._id).select("-password");

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.log("Error occurred while creating user:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Error occurred while creating user",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password. Please try again",
      });
    }

    const token = generateToken(user);
    const userWithoutPassword = await User.findById(user._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "User login successfully",
      data: {
        user: userWithoutPassword,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      },
    });
  } catch (error) {
    console.log("Error occurred while login user:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Error occurred while login user",
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google userId is required",
      });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    if (!decodedToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase token validation failed",
      });
    }

    const existingUser = await User.findOne({ email: decodedToken.email }).select(
      "-password",
    );
    if (existingUser) {
      const token = generateToken(existingUser);
      return res.status(200).json({
        success: true,
        message: "User Login Successfully",
        data: {
          user: existingUser,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
        },
      });
    }

    const hashPassword = await bcrypt.hash(decodedToken.uid || decodedToken.email, 10);
    const createUser = await User.create({
      name: decodedToken.name,
      email: decodedToken.email,
      password: hashPassword,
      role: "member",
      profilePhoto: decodedToken.picture,
    });
    const user = await User.findById(createUser._id).select("-password");

    const token = generateToken(createUser);

    return res.status(200).json({
      success: true,
      message: "User created successfully and Login Successfully",
      data: {
        user,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      },
    });
  } catch (error) {
    console.log("Error occurred while login user with google:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Google Login failed",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh Token is required",
      });
    }

    const verifyToken = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
    );
    if (!verifyToken) {
      return res.status(403).json({
        success: false,
        message: "JWT verification failed",
      });
    }

    const user = await User.findOne({
      _id: verifyToken.id,
      email: verifyToken.email,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Access Token generated successfully",
      accessToken: token.accessToken,
    });
  } catch (error) {
    console.log("Error occurred while generating Token:", error);
    return res.status(401).json({
      success: false,
      message: error?.message || "Error occurred while generating Token",
    });
  }
};

const logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log("Error occurred while logging out:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Error occurred while logging out",
    });
  }
};
export { signUp, login, googleLogin, refreshToken, logout };
