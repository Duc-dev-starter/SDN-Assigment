import { Document, Types } from "mongoose";
import { IComment } from "./comment.interface";
import { IBrand } from "./brand.interface";

export interface IWatch extends Document {
    _id: string,
    watchName: string,
    image: string,
    price: number,
    automatic: boolean,
    watchDescription: string,
    comment: Types.ObjectId[],
    brandName: IBrand,
    createdAt?: Date; // default new Date()
    updatedAt?: Date; // default new Date()
}