import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

const authMiddleWare = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "unauthorized" });
    }

    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return res.status(401).json({
    //     message: "Authorization token missing or incorrectly formatted",
    //   });
    // }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "authorisation required" });
    }

    const decoded = jwt.verify(token, process.env.jwt_secret);

    const user = await User.findById(decoded.userId).select("-password");

    // validate user
    if (!user) {
      return res.status(401).json({ message: "user does not exist" });
    }
   req.user = {
  ...user.toObject(),
  userId: user._id.toString(),
};
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleWare;
