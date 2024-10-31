import { Document } from "mongoose";
import { IMember } from "./member.inteface";

export interface IComment extends Document {
    _id: string,
    rating: number,
    content: string,
    author: IMember
    createdAt?: Date; // default new Date()
    updatedAt?: Date; // default new Date()
}