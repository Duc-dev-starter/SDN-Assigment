import { RequestHandler, Router } from "express";
import { API_PATH, VIEW_PATH } from "../../core/constants";
import { IRoute } from "../../core/interfaces";
import { BrandController } from "../controllers";
import { checkRoleMiddleware } from "../../core/middlewares";
import { asyncHandler } from "../../core/utils";

export default class BrandRoute implements IRoute{
    public apiPath = API_PATH.BRAND;
    public viewPath = VIEW_PATH;
    public router = Router();
    public brandController = new BrandController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET domain:/api/auth -> Login user view
        this.router.get(this.viewPath.BRAND_DASHBOARD, checkRoleMiddleware,this.brandController.viewGetBrands);
        // POST domain:/api/auth -> Login normal
        this.router.post(this.apiPath, checkRoleMiddleware,this.brandController.viewGetBrands);
        // POST domain:/api/auth -> Login normal
        this.router.put(`${this.apiPath}/edit-brand`, checkRoleMiddleware, asyncHandler(this.brandController.editBrand as RequestHandler));
        this.router.post(`${this.apiPath}/create`, checkRoleMiddleware, asyncHandler(this.brandController.addBrand as RequestHandler));
        this.router.delete(`${this.apiPath}/delete`, checkRoleMiddleware, asyncHandler(this.brandController.deleteBrand as RequestHandler));
    }

}