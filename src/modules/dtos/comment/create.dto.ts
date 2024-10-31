import {  IsDate, IsNotEmpty, IsString, MinLength } from "class-validator";

export default class CreateCommentDto {
    constructor(
        brandName: string,
        created_at: Date = new Date(),
        updated_at: Date = new Date(),
    ) {
        this.brandName = brandName;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    @IsNotEmpty()
    @IsString()
    public brandName: string;

    @IsDate()
    public created_at: Date;

    @IsDate()
    public updated_at: Date;
}
