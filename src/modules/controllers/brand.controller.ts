import { NextFunction, Request, Response } from "express";
import { BrandSchema, WatchSchema } from "../models";
import { CreateBrandDto } from "../dtos";
import { IBrand } from "../interfaces";
import { HttpStatus } from "../../core/enums";

export default class BrandController {
    public viewGetBrands = async (req: Request, res: Response, next: NextFunction) => {
            const locals = {
                title: "Get Brands",
                description: "Free NodeJs User Management System",
            };
            const member = req.session.member
            let perPage = 10;
            let page = 1;
            if (req.query.page) {
                if (typeof req.query.page === 'string') {
                    const parsedPage = parseInt(req.query.page, 10);
                    if (!isNaN(parsedPage) && parsedPage > 0) {
                        page = parsedPage;
                    }
                } else if (typeof req.query.page === 'number' && req.query.page > 0) {
                    page = req.query.page;
                }
                // Nếu req.query.page là mảng hoặc kiểu khác, bạn có thể xử lý thêm tại đây nếu cần
            }
    
    
            try {
                const brands = await BrandSchema.aggregate([{ $sort: { createdAt: -1 } }])
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
                const count = await BrandSchema.countDocuments({});
                return res.render("brandDashboard", {
                    locals,
                    brands,
                    member,
                    current: page,
                    pages: Math.ceil(count / perPage),
                });
            } catch (error) {
                req.flash('error_msg', `Something went wrong!`);
            return res.status(HttpStatus.BadRequest).redirect(`/brands`);
            }
}
    public viewEditBrand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const brand = await BrandSchema.findOne({ _id: req.params.id });
    
            const locals = {
                title: "Edit Brand Data",
                description: "Free NodeJs User Management System",
            };
    
            res.status(HttpStatus.Success).render("editBrand", {
                locals,
                brand,
            });
        } catch (error) {
            req.flash('error_msg', `Something went wrong!`);
            return res.status(HttpStatus.BadRequest).redirect(`/brands`);
        }
    }

    public editBrand = async (req: Request, res: Response, next: NextFunction) => {
       try {
            const brandId = req.query.brandId;
            const brandName = req.body.brandName
            console.log(brandId);
            console.log(brandName);
            const existingBrand = await BrandSchema.findById(brandId);
            if (!existingBrand) {
                req.flash('error_msg', 'Brand not found.');
                return res.redirect(`/brands`);
            }

            const duplicateBrand = await BrandSchema.findOne({ 
                brandName: req.body.brandName, 
                _id: { $ne: brandId }  // Loại trừ chính đồng hồ đang cập nhật
            });
    
            if (duplicateBrand) {
                req.flash('error_msg', `Brand with name "${req.body.brandName}" already exists.`);
                return res.redirect(`/brands`);
            }

            const isBrandUpdated = (
                existingBrand.brandName !== brandName
            );
            if (!isBrandUpdated) {
                req.flash('info_msg', `No changes detected when you update brand with name: ${brandName}.`);
                return res.status(HttpStatus.Found).redirect(`/brands`);
            }

            const updatedBrand = await BrandSchema.findByIdAndUpdate(brandId,
                {
                    brandName,
                    updatedAt: Date.now()  // Cập nhật thời gian sửa
                },
                { new: true }  // Trả về tài liệu đã được cập nhật
            );

            if(!updatedBrand){
                req.flash('error_msg', `Brand update failed. Please try again.`);
                return res.status(HttpStatus.Accepted).redirect(`/brands`);
            }
            // Nếu cập nhật thành công, chuyển hướng và thông báo
            req.flash('success_msg', `Brand updated successfully!`);
            return res.redirect(`/brands`);
       } catch (error) {
        req.flash('error_msg', `Something went wrong!`);
        return res.status(HttpStatus.BadRequest).redirect(`/brands`);
       }

    }

    public addBrand = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: CreateBrandDto = {
                ...req.body,
            };
            const existedBrand = await BrandSchema.findOne({brandName: { $regex: new RegExp('^' + model.brandName + '$', 'i') }});
            console.log(existedBrand)
            if(existedBrand){
                req.flash('error_msg', `Brand with name ${model.brandName} already exists.`);
                return res.status(HttpStatus.Conflict).redirect(`/brands`);
            }
            const newBrand: IBrand = await BrandSchema.create(model);
            if(!newBrand){
                req.flash('error_msg', 'Brand create failed. Please try again');
                return res.status(HttpStatus.Accepted).redirect(`/brands`);
            }
            req.flash('success_msg', `Brand ${req.body.brandName} created`);
            return res.redirect(`/brands`);
        } catch (error) {
            req.flash('error_msg', `Internet error when try connected with db. Please try later`);
            return res.status(HttpStatus.InternalServerError).redirect(`/brands`);
        } 
    };

    public deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
        const brandId = req.query.brandId;
        try {

            const watchWithBrand = await WatchSchema.findOne({ brandName: brandId });

    if (watchWithBrand) {
        req.flash('error_msg', 'Brand is assigned to one or more watches and cannot be deleted.');
        return res.redirect(`/brands`);
    }
            const deletedBrand = await BrandSchema.findByIdAndDelete(brandId);
            console.log(deletedBrand)
            if (!deletedBrand) {
                req.flash('error_msg', 'Brand not found.');
                return res.redirect(`/brands`);
            }
            req.flash('success_msg', 'Brand deleted');
            return res.redirect(`/brands`);
        } catch (error) {
            req.flash('error_msg', `Internet error when try connected with db. Please try later`);
            return res.status(HttpStatus.InternalServerError).redirect(`/brands`);
        }
    }
    
}