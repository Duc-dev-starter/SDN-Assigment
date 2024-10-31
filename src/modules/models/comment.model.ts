import mongoose, { Schema } from 'mongoose';
import { IComment } from '../interfaces';
import { COLLECTION_NAME } from '../../core/constants';


const CommentSchemaEntity: Schema<IComment> = new Schema(
  {
    rating:{ type: Number,  min: 1,  max:5,  require: true},
    content: {type: String, require: true},
    author:{  type: mongoose.Schema.Types.ObjectId, ref: COLLECTION_NAME.MEMBER, require: true }
  },
  { timestamps: true }
);

const CommentSchema = mongoose.model<IComment & mongoose.Document>(COLLECTION_NAME.COMMENT, CommentSchemaEntity);

export default CommentSchema;
