import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
import { isEmptyObject } from "../../core/utils";
import { IComment } from "../interfaces";
import { CommentSchema } from "../models";

export default class CommentService {

    public async createComment(model: any, author: string, isAdmin: boolean) : Promise<IComment> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }
        model.author = author;
        if(isAdmin){
            throw new HttpException(HttpStatus.BadRequest, 'Admin cannot comment!');
        }

        const existingComment = await CommentSchema.findOne({author})

        if (existingComment) {
            throw new HttpException(HttpStatus.BadRequest, 'You have already reviewed this!');
        }

        const createdItem: IComment = await CommentSchema.create(model);
        if (!createdItem) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        return createdItem;
    }
}