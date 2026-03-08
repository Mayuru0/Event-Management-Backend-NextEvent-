import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_REFRESH_SECRET } from "./../config/env.js";

const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7m" });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "21d" });
};

const getToken = (payload) => {
  const token = jwt.sign(payload, JWT_SECRET);
  return token;
};

const decodeToken = (token) => {
  const payload = jwt.decode(token);
  return payload;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export { getToken, decodeToken, verifyToken, generateAccessToken, generateRefreshToken, verifyRefreshToken };
