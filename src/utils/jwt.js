import jwt from "jsonwebtoken";
import {JWT_SECRET} from "./../config/env.js"
const getToken =(payload)=>{
    const token = jwt.sign(payload,JWT_SECRET);
    return token;
}

const decodeToken=(token)=>{
    const payload = jwt.decode(token);
    return payload;
}

const verifyToken=(token)=>{
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        return decoded;
    } catch (error) {
        console.log(error);
        return null;
        
    }
   
}

export  {getToken,decodeToken,verifyToken}