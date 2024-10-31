import { IMember } from "../interfaces";
import { MemberSchema } from "../models";

class AuthRepository {
    async create(memberData: Partial<IMember>) : Promise<IMember>{
        const member = new MemberSchema(memberData);
        return await member.save();
    }

    async findById(id: string): Promise<IMember | null> {
        return await MemberSchema.findById(id);
    }

    async findByMembername(membername: string): Promise<IMember | null> {
        return await MemberSchema.findOne({membername});
      }
    
      async findAll(): Promise<IMember[]> {
        return await MemberSchema.find();
      }
    
      async update(id: string, updates: Partial<IMember>): Promise<IMember | null> {
        return await MemberSchema.findByIdAndUpdate(id, updates, { new: true });
      }
    
}

export default AuthRepository;