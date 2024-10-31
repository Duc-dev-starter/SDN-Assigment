import { HttpStatus } from "../../core/enums";
import { HttpException } from "../../core/exceptions";
import { isEmptyObject } from "../../core/utils";
import { CreateBrandDto } from "../dtos";
import { IBrand } from "../interfaces";
import { BrandRepository } from "../repositories";

export default class BrandService {
    private brandRepository = new BrandRepository();

    public async createBrand(model: CreateBrandDto) : Promise<IBrand> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const brand = this.brandRepository.findBrandByName(model.brandName);
        if(!brand) {
            throw new HttpException(HttpStatus.Conflict, `Brand with name ${model.brandName} already exists`);
        }

        const createdBrand = this.brandRepository.createBrand(model);
        if (!createdBrand) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        return createdBrand;
    }
}