import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IWatch } from '../interfaces';


const WatchSchemaEntity: Schema<IWatch> = new Schema(
  {
    watchName:{ type: String, required: true},
    image:{ type: String, required: true},
    price: {type: Number, required: true},
    automatic:{type: Boolean, default: false},
    watchDescription:{type: String, required: true},
    comment: [{type: mongoose.Schema.Types.ObjectId, ref: COLLECTION_NAME.COMMENT, required: true}],
    brandName:{type: mongoose.Schema.Types.ObjectId, ref: COLLECTION_NAME.BRAND, required: true},

  },
  { timestamps: true }
);

const WatchSchema = mongoose.model<IWatch & mongoose.Document>(COLLECTION_NAME.WATCH, WatchSchemaEntity);

export default WatchSchema;
