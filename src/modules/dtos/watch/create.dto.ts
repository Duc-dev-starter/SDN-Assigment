import {  IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";
import { IBrand, IComment } from "../../interfaces";
import { Types } from "mongoose";

export default class CreateWatchDto {
    constructor(
        watchName: string,
        image: string,
        price: number,
        automatic: boolean,
        watchDescription: string,
        comment: Types.ObjectId[], 
        brandName: IBrand, 
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
    ) {
        this.watchName = watchName;
        this.brandName = brandName;
        this.image = image;
        this.price = price;
        this.automatic = automatic;
        this.watchDescription = watchDescription;
        this.comment = comment;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    @IsNotEmpty()
    @IsString()
    public watchName: string;

    @IsNotEmpty()
    @IsString()
    public watchDescription: string;

    @IsNotEmpty()
    @IsBoolean()
    public automatic: boolean;

    @IsNotEmpty()
    @IsString()
    public image: string;

    @IsNotEmpty()
    @IsNumber()
    public price: number;

    public comment: Types.ObjectId[];

    @IsNotEmpty()
    public brandName: IBrand;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;
}
