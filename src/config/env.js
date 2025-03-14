import dotenv from "dotenv";

dotenv.config(); 

export const JWT_SECRET = process.env.JWT_SECRET;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const PORT = process.env.PORT || 8000;
export const BASE_URL = process.env.BASE_URL ;
export const MONGO_URI = process.env.MONGO_URI;
export const DATABASE_LOCAL = process.env.DATABASE_LOCAL;
export const LOCAL_DATABASE = process.env.LOCAL_URLS;


