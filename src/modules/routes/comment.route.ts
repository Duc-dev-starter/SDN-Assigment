import { RequestHandler, Router } from "express";
import { API_PATH, VIEW_PATH } from "../../core/constants";
import { IRoute } from "../../core/interfaces";
import { CommentController } from "../controllers";
import { checkRoleMiddleware } from "../../core/middlewares";
import { asyncHandler } from "../../core/utils";

export default class CommentRoute implements IRoute{
    public apiPath = API_PATH.COMMENT;
    public viewPath = VIEW_PATH;
    public router = Router();
    public commentController = new CommentController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.apiPath}`, asyncHandler(this.commentController.addComment as RequestHandler));
        
    }

}