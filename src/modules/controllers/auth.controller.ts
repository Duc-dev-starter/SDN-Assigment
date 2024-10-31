import { NextFunction, Request, Response } from "express";
import { LoginDto } from "../dtos";
import { API_PATH, VIEW_PATH } from "../../core/constants";
import { isEmptyObject } from "../../core/utils";
import { OAuth2Client } from "google-auth-library";
import { MemberSchema } from "../models";
import bcrypt from 'bcrypt';
import { HttpStatus } from "../../core/enums";

export default class AuthController {

    public viewLogin = async (req: Request, res: Response, next: NextFunction) => {
        const locals = {
            title: "Login",
            description: "Free NodeJs User Management System",
            formType: "login" 
        };

        try {
            return res.status(HttpStatus.Success).render("login", locals);
        } catch (error) {
            req.flash('error_msg', 'Something went wrong.');
            return res.status(HttpStatus.BadRequest).redirect(VIEW_PATH.LOGIN);
        }
    }

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: LoginDto = req.body;
            const isGoogle = req.route.path === API_PATH.AUTH_GOOGLE ? true : false;
            let memberLogin = model
            let membernameCheck = model.membername;
            if (isEmptyObject(model)) {
                req.flash('error_msg', 'Cannot let model empty.');
                return res.redirect(VIEW_PATH.LOGIN);
            }
            if (isGoogle) {
                        if (model.googleId) {
                            const client = new OAuth2Client();
                            const ticket = await client.verifyIdToken({
                                idToken: model.googleId,
                            });
                            const payload = ticket.getPayload();
                            if (payload) {
                                memberLogin.membername = payload.email!;
                                membernameCheck = payload.email!;
                            }
                        } else {
                            req.flash('error_msg', 'Field google_id via IdToken is empty, please send google_id!')
                            return res.redirect(VIEW_PATH.LOGIN);
                        }
                    }
                    const member = await MemberSchema.findOne({membername: membernameCheck});
            if (!member) {
                req.flash('error_msg', `Your membername: ${membernameCheck} is not exists.`)
                return res.status(HttpStatus.BadRequest).redirect(VIEW_PATH.LOGIN);
        }
            if (member.googleId && model.password ) {
                req.flash('error_msg', `You must login by google!`)
                return res.redirect(VIEW_PATH.LOGIN);
            }
            
            //login normal
        if (!isGoogle && model.password) {
            const isMatchPassword = await bcrypt.compare(model.password, member.password!);
            if (!isMatchPassword) {
                req.flash('error_msg', `Your password is not valid!`)
                return res.status(HttpStatus.BadRequest).redirect(VIEW_PATH.LOGIN);
            }
        }
         req.session.member = {
            name: member.name,
            isAdmin: member.isAdmin,
            id: member._id,
            version: member.tokenVersion || 0
        };
            if(member.isAdmin){
                req.flash('success_msg', 'Login Successfully! Welcome admin.');
                res.status(HttpStatus.Success).redirect(VIEW_PATH.DASHBOARD)
            }
            else{
                req.flash('success_msg', 'Login Successfully! Welcome member.');
                res.status(HttpStatus.Success).redirect(VIEW_PATH.HOME)
            }
            console.log(req.session)
            // res.status(HttpStatus.Success).json(formatResponse<TokenData>(tokenData));
        } catch (error) {
            req.flash('error_msg', 'Login failed. Please try again');
            console.log(req.session)
            res.status(HttpStatus.InternalServerError).redirect(VIEW_PATH.LOGIN);
        }
    };

    public logout = async (req: Request, res: Response) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(HttpStatus.InternalServerError).send('Error destroying session');
            }
            res.status(HttpStatus.Success).redirect(VIEW_PATH.HOME);
        });
    }
}