import { RegisterDto } from "../dtos";
import { API_PATH, VIEW_PATH } from "../../core/constants";
/// <reference path="../../types/express-flash-message.d.ts" />
import { MemberService } from "../services";
import { NextFunction, Request, Response } from "express";
import { MemberSchema } from "../models";
import { HttpStatus } from "../../core/enums";
import bcrypt from 'bcrypt'
import { OAuth2Client } from "google-auth-library";
import { encodePasswordUserNormal, isEmptyObject } from "../../core/utils";
import { IMember } from "../interfaces";

class MemberController {
    private memberService = new MemberService();
    private memberSchema = new MemberSchema();

    public viewRegister = async (req: Request, res: Response, next: NextFunction) => {
        const locals = {
            title: "Register",
            description: "Free NodeJs User Management System",
            formType: "register" 
        };

        try {
            return res.status(HttpStatus.Success).render("login", locals);
        } catch (error) {
            console.log(error);
        }
    }

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: RegisterDto = req.body;
            const newModel = {
                ...model,
                yob : parseInt(req.body.yob)
            }
            console.log(newModel);
            const routerPath = req.originalUrl; 

            const isGoogle = routerPath === API_PATH.MEMBERS_GOOGLE;
            const isNotCreateUsers = !(routerPath === API_PATH.CREATE_MEMBER);

                if (isEmptyObject(model)) {
                    req.flash('error_msg', 'Cannot let model empty.');
                    return res.status(HttpStatus.BadRequest).redirect(`/register`);
                }
    
            let newMember = {
                ...newModel,
                googleId: model.googleId || '',
                tokenVersion: 0,
            };
    
    
            // create a new user by google
            if (isGoogle) {
                if (model.googleId) {
                    newMember = await this.formatUserByGoogle(model.googleId, newMember);
                } else {
                    req.flash('error_msg', 'Field googleId via IdToken is empty, please send googleId!');
                    return res.status(HttpStatus.BadRequest).redirect(`/register`);
                }
            }
    
            const existingMemberByMembername = await MemberSchema.findOne({membername: model.membername});
            if (existingMemberByMembername) {
                req.flash('error_msg', `Membername: '${existingMemberByMembername.membername}' already exists!`);
                return res.status(HttpStatus.Conflict).redirect(`/register`);
            }
    
             // create a new user normal
             if (!isGoogle && model.password) {
                // handle encode password
                newMember.password = await encodePasswordUserNormal(model.password);
            }
    
    
            const createMember: IMember = await MemberSchema.create(newMember);
            if (!createMember) {
                req.flash('error_msg', `Create item failed!`);
                return res.status(HttpStatus.Accepted).redirect(`/register`);
            }
            const resultMember: IMember = createMember.toObject();
            delete resultMember.password;
            req.flash('success_msg', 'Register successfully. Please login to your account');
            res.status(HttpStatus.Success).redirect(VIEW_PATH.LOGIN)
        } catch (error) {
            req.flash('error_msg', 'Something went wrong. Please try again');
            res.status(HttpStatus.InternalServerError).redirect(VIEW_PATH.REGISTER)
        }
    };

    public viewGetMembers = async (req: Request, res: Response, next: NextFunction) => {
        const locals = {
            title: "Get Members",
            description: "Free NodeJs User Management System",
        };

        const member = req.session.member

        let perPage = 10;
        let page = 1;
        if (req.query.page) {
            if (typeof req.query.page === 'string') {
                const parsedPage = parseInt(req.query.page, 10);
                if (!isNaN(parsedPage) && parsedPage > 0) {
                    page = parsedPage;
                }
            } else if (typeof req.query.page === 'number' && req.query.page > 0) {
                page = req.query.page;
            }
            // Nếu req.query.page là mảng hoặc kiểu khác, bạn có thể xử lý thêm tại đây nếu cần
        }


        try {
            const members = await MemberSchema.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();
            const count = await MemberSchema.countDocuments({});
            console.log(count);
            return res.status(HttpStatus.Success).render("dashboard", {
                locals,
                members,
                current: page,
                member,
                pages: Math.ceil(count / perPage),
            });
        } catch (error) {
            req.flash('error_msg', 'Something went wrong.');
            return res.status(HttpStatus.InternalServerError).redirect(`/accounts}`);
        }
    }

    public viewProfile = async (req: Request, res: Response, next: NextFunction) => {
        const memberId = req.query.memberId;
        const isAdmin = req.session.member?.isAdmin
        try {
            if(!req.session.member){
                req.flash('error_msg', 'Please login to access this page.');
                return res.redirect('/login');  
            }
            const member = await MemberSchema.findOne({ _id: memberId });
    
            const locals = {
                title: "Profile",
                description: "Free NodeJs User Management System",
            };
            console.log(member)
            res.status(HttpStatus.Success).render("profile", {
                locals,
                member,
                isAdmin
            });
        } catch (error) {
            req.flash('error_msg', 'Something went wrong.');
            return res.status(HttpStatus.InternalServerError).redirect(`/profile?memberId=${memberId}`);
        }
    }

    public editProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const memberId = req.query.memberId;
            const admin = req.session.member?.isAdmin
            console.log(req.body)
            const existingMember = await MemberSchema.findById(memberId);
            if (!existingMember) {
                req.flash('error_msg', 'Member not found.');
                return res.status(HttpStatus.BadRequest).redirect(`/`);
            }
            if(admin){
                req.flash('error_msg', `Admin cannot change their profile.`);
                return res.status(HttpStatus.BadRequest).redirect(`/profile?memberId=${memberId}`);
            }
            // Kiểm tra xem các giá trị có thay đổi không
            const isMemberUpdated = (
                existingMember.name !== req.body.name ||
                existingMember.yob !== parseInt(req.body.yob) 
            );
            if (!isMemberUpdated) {
                req.flash('info_msg', `No changes detected when you update.`);
                return res.status(HttpStatus.Found).redirect(`/profile?memberId=${memberId}`);
            }
    
            // Nếu có thay đổi, tiến hành cập nhật
            const updatedMember = await MemberSchema.findByIdAndUpdate(memberId,
                {
                    name: req.body.name,
                    yob: parseInt(req.body.yob),
                    updatedAt: Date.now()  // Cập nhật thời gian sửa
                },
                { new: true }  // Trả về tài liệu đã được cập nhật
            );
            if(!updatedMember){
                req.flash('error_msg', `Member update failed. Please try again.`);
                return res.status(HttpStatus.Accepted).redirect(`/profile?memberId=${memberId}`);
            }
            // Nếu cập nhật thành công, chuyển hướng và thông báo
            req.flash('success_msg', `Member updated successfully!`);
            return res.status(HttpStatus.Success).redirect(`/profile?memberId=${memberId}`);
    
        } catch (error) {
            req.flash('error_msg', `Internet error when try connected with db. Please try later`);
            return res.status(HttpStatus.InternalServerError).redirect(`/profile?memberId=${req.query.memberId}`);
        }
    }

    public viewChangePassword = async (req: Request, res: Response) => {
        try {
            const locals = {
                title: "Change Password",
                description: "Free NodeJs User Management System",
            };

            const isAdmin = req.session.member?.isAdmin
            
            const member = req.session.member
            const admin = req.session.member?.isAdmin
            if(admin){
                req.flash('error_msg', `Admin cannot change their password.`);
                req.flash('admin_msg', 'This is admin')
                return res.status(HttpStatus.BadRequest).redirect(`/changePassword`);
            }
            return res.render('changePassword', {
                locals,
                member,isAdmin
            })
        } catch (error) {
            req.flash('error_msg', `Internet error when try connected with db. Please try later`);
            return res.status(HttpStatus.InternalServerError).redirect(`/change-password`);
        }
    }

    public changePassword = async (req: Request, res: Response) => {
        try {
            const { oldPassword, newPassword, confirmNewPassword } = req.body;
            const memberId = req.query.memberId;
            const admin = req.session.member?.isAdmin
            const existingMember = await MemberSchema.findById(memberId);
            if (!existingMember) {
                req.flash('error_msg', 'Member not found.');
                return res.status(HttpStatus.BadRequest).redirect(`/`);
            }
            if(admin){
                req.flash('error_msg', `Admin cannot change their password.`);
                return res.status(HttpStatus.BadRequest).redirect(`/change-password`);
            }

            const isMatch = await bcrypt.compare(oldPassword, existingMember.password as string);
            if(!isMatch) {
                req.flash('error_msg', `Your old password is invalid.`);
                return res.status(HttpStatus.BadRequest).redirect(`/change-password`);
            }
            const isPasswordUpdated = (
              req.body.newPassword!== req.body.oldPassword 
            );

            if(!isPasswordUpdated){
                req.flash('info_msg', `No changes detected when you update.`);
                return res.status(HttpStatus.Found).redirect(`/change-password`);
            }

            if (newPassword !== confirmNewPassword) {
                req.flash('error_msg', `Your new password and confirm password do not match.`);
                return res.status(HttpStatus.BadRequest).redirect(`/change-password`);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword!, salt);
            existingMember.password = hashedPassword;
            await existingMember.save();
            req.flash('success_msg', `Password updated successfully! Please login again`);

            req.session.destroy((err) => {
                if (err) {
                    return res.status(HttpStatus.InternalServerError).send('Error destroying session');
                }
                
            });
                return res.status(HttpStatus.Success).render(`login`, {success_msg: ['Password updated successfully! Please login again'], formType: 'login'});
            
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Something went wrong.');
            return res.status(HttpStatus.InternalServerError).redirect(`/change-password`);
        }
    }

    private async formatUserByGoogle(googleId: string, newUser: RegisterDto): Promise<RegisterDto> {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: googleId,
        });
        const payload = ticket.getPayload();
        if (payload) {
            newUser.name = payload.name!;
            newUser.membername = payload.name!
            newUser.avatar = payload.picture!;
            newUser.googleId = payload.sub!;
        }
        return newUser;
    }

}

export default MemberController