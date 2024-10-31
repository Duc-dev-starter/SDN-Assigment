import { Document } from "mongoose";

export interface IBrand extends Document {
    _id: string,
    brandName: string,
    createdAt?: Date; // default new Date()
    updatedAt?: Date; // default new Date()
}