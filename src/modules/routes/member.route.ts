import { API_PATH, VIEW_PATH } from '../../core/constants';
import { adminForbidden, checkRoleMiddleware, validationMiddleware } from '../../core/middlewares';
import { RegisterDto } from '../dtos';
import { MemberController } from '../controllers';
import { Router } from 'express';
import { IRoute } from '../../core/interfaces';

export default class MemberRoute implements IRoute {
  public apiPath = API_PATH.MEMBERS;
  public viewPath = VIEW_PATH;
  public router = Router();
  public memberController = new MemberController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET domain:/api/members -> Register normal user view
    this.router.get(this.viewPath.REGISTER, this.memberController.viewRegister);

    // POST domain:/api/members -> Register normal user
     this.router.post(this.apiPath, this.memberController.register);

     // POST domain:/api/users/search -> view all users includes params: keyword, status, role
     this.router.get(
      this.viewPath.DASHBOARD,
      checkRoleMiddleware,
      this.memberController.viewGetMembers,
  ); 


// GET domain:/api/members -> Register normal user view
this.router.get(this.viewPath.PROFILE,adminForbidden,this.memberController.viewProfile);

this.router.put(`${this.apiPath}/edit`, adminForbidden,this.memberController.editProfile);
this.router.get(`/change-password`, adminForbidden,this.memberController.viewChangePassword);
this.router.put(`${this.apiPath}/change-password`, adminForbidden,this.memberController.changePassword);
}
}
