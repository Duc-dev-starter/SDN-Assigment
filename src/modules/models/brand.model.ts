import mongoose, { Schema } from 'mongoose';
import { IBrand } from '../interfaces';
import { COLLECTION_NAME } from '../../core/constants';


const BrandSchemaEntity: Schema<IBrand> = new Schema(
  {
    brandName: { type: String, unique: true, index: true, required: true },
  },
  { timestamps: true }
);

const BrandSchema = mongoose.model<IBrand & mongoose.Document>(COLLECTION_NAME.BRAND, BrandSchemaEntity);

export default BrandSchema;
