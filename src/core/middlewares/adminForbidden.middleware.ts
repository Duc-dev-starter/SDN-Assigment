import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../enums';

const adminForbidden = async (req: Request, res: Response, next: NextFunction) => {
    // Kiểm tra xem token có tồn tại trong session hay không
   const member = req.session.member;
   if(!member){
    req.flash('error_msg', 'Please login to access this page.');
    return res.redirect('/login');  
   }
    if (member?.isAdmin) {
        console.log(req.session)
        return res.status(HttpStatus.NotFound).render('404', {member})
    }else{
        next();
    }
};

export default adminForbidden
