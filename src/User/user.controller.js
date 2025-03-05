import mongoose from "mongoose";
import { ErrorHandler } from "../../utils/errorHandler.js";
import { sendToken } from "../../utils/sendToken.js";
import { createNewUserRepo } from "./user.repository.js";
import { findUserRepo } from "./user.repository.js";
export const createNewUser = async (req, res, next) => {
  try {
    console.log(req.body);

    const newUser = await createNewUserRepo(req.body);

    res.status(200).json({ success: true, newUser });
  } catch (err) {
    if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
      // Check if the duplicate field is 'email'
      if (err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({
          err: "This email is already registered. Please use a different email.",
        });
      }
    }
    return next(new ErrorHandler(400, err));
  }
};

export const isLoggedIn = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, msg: "User is Logged in" });
  } catch (error) {
    return next(new ErrorHandler(400, err));
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler(400, "please enter email/password"));
    }
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(
        new ErrorHandler(401, "user not found! register yourself now!!")
      );
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Invalid email or passswor!"));
    }
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const logoutUser = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "logout successful" });
};
