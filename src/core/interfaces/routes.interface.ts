import { Router } from "express";

interface IRoute {
    viewPath?: object;
    apiPath: string;
    // path: string;
    router: Router;
}

export default IRoute;
