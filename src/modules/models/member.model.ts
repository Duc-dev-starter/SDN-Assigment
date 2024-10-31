import mongoose, { Schema } from 'mongoose';
import { IMember } from '../interfaces';
import { COLLECTION_NAME } from '../../core/constants';


const MemberSchemaEntity: Schema<IMember> = new Schema(
  {
    name: { type: String, required: true },
    membername: { type: String, required: true, unique: true, index: true },
    googleId: { type: String },
    password: {
        type: String,
        required: [
            function () {
                return !this.googleId;
            },
            'Please enter your password!',
        ],
    },
    avatar: { type: String },
    yob: { type: Number, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MemberSchema = mongoose.model<IMember & mongoose.Document>(COLLECTION_NAME.MEMBER, MemberSchemaEntity);

export default MemberSchema;
