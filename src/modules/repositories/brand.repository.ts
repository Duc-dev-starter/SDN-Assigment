import { IBrand } from "../interfaces";
import { BrandSchema } from "../models";

export default class BrandRepository {
   async findBrandByName (brandName: string) {
        try {
         return await BrandSchema.findOne({brandName: { $regex: new RegExp('^' + brandName + '$', 'i') }});
        } catch (error) {
            console.log(error);
        }
   }

   async createBrand (brand: Partial<IBrand>) {
    return await BrandSchema.create(brand);
   }
}