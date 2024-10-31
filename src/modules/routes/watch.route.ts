import { API_PATH, VIEW_PATH } from '../../core/constants';
import {  WatchController } from '../controllers';
import { Router } from 'express';
import { IRoute } from '../../core/interfaces';
import { checkRoleMiddleware } from '../../core/middlewares';

export default class WatchRoute implements IRoute {
  public apiPath = API_PATH.WATCH;
  public viewPath = VIEW_PATH;
  public router = Router();
  public watchController = new WatchController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET domain:/ -> Register normal user view
    this.router.get(this.viewPath.WATCH_DASHBOARD, checkRoleMiddleware,this.watchController.viewGetWatches);
    this.router.get(this.viewPath.HOME, this.watchController.viewClientGetWatches);
    this.router.get(this.viewPath.VIEW_WATCH_DETAIL ,this.watchController.viewGetWatchDetail);
    this.router.post(`${this.apiPath}/create`, checkRoleMiddleware, this.watchController.addWatch);
    this.router.delete(`${this.apiPath}/delete`, checkRoleMiddleware, this.watchController.deleteWatch);
    this.router.put(`${this.apiPath}/edit-watch`, checkRoleMiddleware, this.watchController.editWatch);
    this.router.get(`/watches/search`, this.watchController.searchWatch);
    this.router.get(`/watches/:brandName`, this.watchController.filterWatch)
  }

}
