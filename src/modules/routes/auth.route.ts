import { Router } from "express";
import { API_PATH, VIEW_PATH } from "../../core/constants";
import { IRoute } from "../../core/interfaces";
import { AuthController } from "../controllers";

export default class AuthRoute implements IRoute{
    public apiPath = API_PATH.AUTH;
    public viewPath = VIEW_PATH;
    public router = Router();
    public authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET domain:/api/auth -> Login user view
        this.router.get(this.viewPath.LOGIN, this.authController.viewLogin);
        // POST domain:/api/auth -> Login normal
        this.router.post(this.apiPath, this.authController.login);
        // POST domain:/api/auth -> Login normal
        this.router.post(API_PATH.AUTH_GOOGLE, this.authController.login);
        this.router.get(API_PATH.AUTH_LOGOUT, this.authController.logout);
    }
}