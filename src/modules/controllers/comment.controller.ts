import { NextFunction, Request, Response } from "express";
import { isEmptyObject } from "../../core/utils";
import { HttpStatus } from "../../core/enums";
import { VIEW_PATH } from "../../core/constants";
import { CommentSchema, WatchSchema } from "../models";
import mongoose from "mongoose";

export default class CommentController {
    public addComment= async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.originalUrl);
        const watchName = decodeURIComponent(req.query.watchName as string); 
        try {
            const model = req.body;
            const author = req.session.member
            const isAdmin = req.session.member?.isAdmin;
            if(!req.session.member){
                req.flash("error_msg", 'You must be logged in')
                res.status(HttpStatus.Unauthorized).redirect('/login');
                return;
            }
            if (isEmptyObject(model)) {
                req.flash('error_msg', 'Cannot let model empty.');
                return res.redirect(`/watchDetail?watchName=${watchName}`);
            }
            if(isAdmin){
                req.flash('error_msg', 'Admin cannot comment.');
                return res.redirect(`/watchDetail?watchName=${watchName}`);
            }
    
            const watch = await WatchSchema.findOne({ watchName }).populate('comment');
            console.log(watchName)
            if (!watch) {
                req.flash('error_msg', 'Watch not found.');
                return res.redirect(`/watchDetail?watchName=${watchName}`);
            }
    
            const existingComment = watch.comment.find((c: any) => c.author.toString() === author?.id.toString());
            if (existingComment) {
                req.flash('error_msg', 'You have already commented on this watch.');
                return res.redirect(`/watchDetail?watchName=${watchName}`);
            }

            const newComment = new CommentSchema({
                author: author?.id,
                rating: model.rating,
                content: model.content,
            });
            const newCommentId = new mongoose.Types.ObjectId(newComment._id);
            // Lưu comment mới vào database
            await newComment.save();
    
            // Thêm comment vào danh sách comment của đồng hồ
            watch.comment.push(newCommentId);
            await watch.save();
    
            req.flash('success_msg', 'Comment added successfully.');
            res.redirect(`/watchDetail?watchName=${watchName}`);

        } catch (error) {
            console.log(error);
            req.flash('error_msg', 'Something went wrong.Please try again');
            res.redirect(`/watchDetail?watchName=${watchName}`);
        }
    }
}