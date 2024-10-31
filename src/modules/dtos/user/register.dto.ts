import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export default class RegisterDto {
    constructor(
        googleId: string = '',
        membername: string,
        name: string,
        password: string,
        yob: number,
        avatar: string = '',
        isAdmin: boolean = false,

        tokenVersion: number = 0,

        createdAt: Date = new Date(),
        updatedAt: Date = new Date(),
    ) {
        this.googleId = googleId;
        this.membername = membername;
        this.name = name;
        this.password = password;
        this.yob = yob;
        this.avatar = avatar;
        this.isAdmin = isAdmin;

        this.tokenVersion = tokenVersion;

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public googleId: string;

    @IsNotEmpty()
    @IsString()
    public membername: string;

    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @MinLength(6)
    public password: string;

    @IsBoolean()
    public isAdmin: boolean;

    @IsNotEmpty()
    @IsNumber()
    public yob: number;

    public avatar: string;
    public tokenVersion: number;

    @IsDate()
    public createdAt: Date;

    @IsDate()
    public updatedAt: Date;
}