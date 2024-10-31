import { Document } from 'mongoose';

// export type MemberRole = MemberRoleEnum.ADMIN | MemberRoleEnum.MEMBER | MemberRoleEnum.ALL;

export interface IMember extends Document {
    _id: string;
    name: string; // required
    membername: string; // required
    email: string; // unique
    googleId?: string; // default empty
    password?: string; // required if google_id is null or empty
    avatar?: string; // url
    yob?: number; 
    isAdmin: boolean

    // check verify
    tokenVersion: number; // default 0

    createdAt?: Date; // default new Date()
    updatedAt?: Date; // default new Date()
}

