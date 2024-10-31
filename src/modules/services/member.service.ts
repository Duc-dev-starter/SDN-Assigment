import { OAuth2Client } from "google-auth-library";
import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
import { encodePasswordUserNormal, isEmptyObject, sendMail } from "../../core/utils";
import { RegisterDto } from "../dtos";
import { IMember } from "../interfaces";
import { MemberRepository } from "../repositories";

export default class MemberService {
    public memberRepository = new MemberRepository();

    public async createUser(model: RegisterDto, isGoogle = false, isRegister = true): Promise<IMember> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        let newMember = {
            ...model,
            googleId: model.googleId || '',
            tokenVersion: 0,
        };

        if (isRegister && newMember.isAdmin === true) {
            throw new HttpException(
                HttpStatus.BadRequest,
                `You can only register with the Member role!`,
            );
        }


        // create a new user by google
        if (isGoogle) {
            if (model.googleId) {
                newMember = await this.formatUserByGoogle(model.googleId, newMember);
            } else {
                throw new HttpException(
                    HttpStatus.BadRequest,
                    'Field googleId via IdToken is empty, please send googleId!',
                );
            }
        }

        const existingMemberByMembername = await this.memberRepository.findByMembername(newMember.membername);
        if (existingMemberByMembername) {
            throw new HttpException(HttpStatus.Conflict, `Your membername: '${newMember.membername}' already exists!`);
        }

         // create a new user normal
         if (!isGoogle && model.password) {
            // handle encode password
            newMember.password = await encodePasswordUserNormal(model.password);
        }


        const createMember: IMember = await this.memberRepository.create(newMember);
        if (!createMember) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        const resultMember: IMember = createMember.toObject();
        delete resultMember.password;
        return resultMember;
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