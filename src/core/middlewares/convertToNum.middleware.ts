import { NextFunction, Request, Response } from "express";

const convertToNumMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.yob) {
        req.body.yob = Number(req.body.yob); // Chuyển đổi chuỗi thành số
    }
    next();
};
export default convertToNumMiddleware