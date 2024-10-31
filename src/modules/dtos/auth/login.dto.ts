import {  IsNotEmpty, IsString, MinLength } from "class-validator";

export default class LoginDto {
    constructor(
        googleId: string,
        membername: string,
        password: string,
    ) {
        this.membername = membername;
        this.googleId = googleId || "";
        this.password = password;
    }

    public googleId: string;

    @IsNotEmpty()
    @IsString()
    public membername: string;

    @IsNotEmpty()
    @MinLength(6)
    public password: string;
}
