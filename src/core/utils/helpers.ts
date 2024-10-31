import jwt from 'jsonwebtoken';
import { DataStoredInToken } from '../../modules/interfaces';

export const getUserIdCurrent = (authHeader: string) => {
    if (!authHeader) {
        return '';
    }
    const token = authHeader.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_TOKEN_SECRET ?? '') as DataStoredInToken;
    return user;
};

export const isEmptyObject = (obj: any): boolean => {
    return !Object.keys(obj).length;
};

export const formatResponse = <T>(data: T, success: boolean = true) => {
    return {
        success,
        data,
    };
};

