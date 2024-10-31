import { NextFunction, Request, Response } from "express";
import { BrandSchema, WatchSchema } from "../models";
import { CreateWatchDto } from "../dtos";
import { IWatch } from "../interfaces";
import { HttpStatus } from "../../core/enums";
import mongoose from "mongoose";

export default class WatchController {
    public viewGetWatches = async (req: Request, res: Response) => {
        const locals = {
            title: "Get Watches",
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
            const watches = await WatchSchema.aggregate([{ $sort: { createdAt: -1 } }, {
                $lookup: {
                    from: "brands", // Tên collection bạn muốn join
                    localField: "brandName", // Trường trong WatchSchema
                    foreignField: "_id", // Trường trong BrandSchema
                    as: "brand", // Tên mới để chứa kết quả populate
                },
            },
            { $unwind: "$brand" }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();
            const brands = await BrandSchema.find();
            const count = await WatchSchema.countDocuments({});
            return res.status(HttpStatus.Success).render("watchesDashboard", {
                brands,
                locals,
                watches,
                member,
                current: page,
                pages: Math.ceil(count / perPage),
            });
        } catch (error) {
            req.flash('error_msg', `Internet error when try connected with db. Please try later`);
            return res.status(HttpStatus.InternalServerError).redirect(`/watches`);
        }
}

public viewClientGetWatches = async (req: Request, res: Response, next: NextFunction) => {
    const locals = {
        title: "DucWatch",
        description: "Free NodeJs User Management System",
    };
    const isAdmin = req.session.member?.isAdmin

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

    const member = req.session.member;
    try {
        const watches = await WatchSchema.aggregate([{ $sort: { createdAt: -1 } }, {
            $lookup: {
                from: "brands", // Tên collection bạn muốn join
                localField: "brandName", // Trường trong WatchSchema
                foreignField: "_id", // Trường trong BrandSchema
                as: "brand", // Tên mới để chứa kết quả populate
            },
        },
        { $unwind: "$brand" },
        {
            $project: {
                watchName: 1,          // Chỉ lấy trường watchName
                image: 1,              // Chỉ lấy trường image
                price: 1,              // Chỉ lấy trường price
                brandName: "$brand.brandName"
            }
        }
    ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
        // console.log(watches)
        const count = await WatchSchema.countDocuments({});
        const brands = await BrandSchema.find({});
        return res.status(HttpStatus.Success).render("index", {
            locals,
            watches,
            current: page,
            member,
            brands,
            isAdmin,
            pages: Math.ceil(count / perPage),
        });
    } catch (error) {
        req.flash('error_msg', `Internet error when try connected with db. Please try later`);
        return res.status(HttpStatus.InternalServerError).redirect(`/`);
    }
}
public viewGetWatchDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Access the ID from query parameters
        const watchName = req.query.watchName as string; // Cast to string to avoid type issues
        const member = req.session.member;
        const isAdmin = req.session.member?.isAdmin

        if (!watchName) {
            req.flash('error_msg', 'Watch name is required');
            res.status(HttpStatus.NotFound).render('404', {member})
        }

        // Fetch the watch data based on the query parameter ID
        const watch = await WatchSchema.findOne({ watchName })
            .populate({
                path: 'brandName',
                select: 'brandName -_id',  // Select brandName and exclude _id
            })
            .populate({
                path: 'comment',
                populate: {
                    path: 'author',
                    select: 'name', // Select author name
                }
            });

        if (!watch) {
            req.flash('error_msg', 'Watch name is not found');
            return res.status(HttpStatus.NotFound).render('404', {member})
        }

        console.log(watch);

        let hasCommented = false;
        if (member) {
            hasCommented = watch.comment.some((comment: any) => comment.author._id.toString() === member.id.toString());
        }

        const locals = {
            title: "View Member Data",
            description: "Free NodeJs User Management System",
        };

        // Render the watch details page
        res.status(HttpStatus.Success).render("watchDetail", {
            locals,
            watch,
            member,
            hasCommented,
            isAdmin
        });
    } catch (error) {
        req.flash('error_msg', `Internet error when try connected with db. Please try later`);
        return res.status(HttpStatus.InternalServerError).redirect(`/`);
    }
};

    public addWatch = async (req: Request, res: Response) =>{
        try {
            const model: CreateWatchDto = {
                ...req.body,
                automatic: req.body.automatic === 'true' ,
                price: parseInt(req.body.price)
            };
            const existedWatch = await WatchSchema.findOne({watchName: { $regex: new RegExp('^' + req.body.watchName + '$', 'i') }});
            console.log(existedWatch)
            if(existedWatch){
                req.flash('error_msg', `Watch with name ${req.body.watchName} already exists.`);
                return res.status(HttpStatus.Conflict).redirect(`/watches`);
            }
            const newWatch: IWatch = await WatchSchema.create(model);
            if(!newWatch){
                req.flash('error_msg', 'Watch create failed. Please try again');
                return res.status(HttpStatus.Accepted).redirect(`/watches`);
            }
            req.flash('success_msg', `Watch ${req.body.watchName} created`);
            return res.redirect(`/watches`);
        } catch (error) {
            req.flash('error_msg', `Internet error when try connected with db. Please try later`);
            return res.status(HttpStatus.InternalServerError).redirect(`/watches`);
        } 
    }

    public deleteWatch = async (req: Request, res: Response) => {
       const watchId = req.query.watchId;
        try {
            const deletedWatch = await WatchSchema.findByIdAndDelete(watchId);
            console.log(deletedWatch)
            if (!deletedWatch) {
                req.flash('error_msg', 'Watch not found.');
                return res.redirect(`/watches`);
            }
            req.flash('success_msg', 'Watch deleted');
            return res.redirect(`/watches`);
        } catch (error) {
            req.flash('error_msg', `Internet error when try connected with db. Please try later`);
            return res.status(HttpStatus.InternalServerError).redirect(`/watches`);
        }
    }

    public editWatch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const watchId = req.query.watchId;
            // Tìm đồng hồ hiện tại theo ID
            const existingWatch = await WatchSchema.findById(watchId);
            if (!existingWatch) {
                req.flash('error_msg', 'Watch not found.');
                return res.redirect(`/watches`);
            }

            const duplicateWatch = await WatchSchema.findOne({ 
                watchName: req.body.watchName, 
                _id: { $ne: watchId }  // Loại trừ chính đồng hồ đang cập nhật
            });
    
            if (duplicateWatch) {
                req.flash('error_msg', `Watch with name "${req.body.watchName}" already exists.`);
                return res.redirect(`/watches`);
            }
            // Kiểm tra xem các giá trị có thay đổi không
            const isWatchUpdated = (
                existingWatch.watchName !== req.body.watchName ||
                existingWatch.image !== req.body.image ||
                existingWatch.price !== parseInt(req.body.price) ||
                existingWatch.automatic !== (req.body.automatic === 'true') ||
                existingWatch.watchDescription !== req.body.watchDescription ||
                existingWatch.brandName.toString() !== req.body.brandName
            );
            if (!isWatchUpdated) {
                req.flash('info_msg', `No changes detected when you update watch with name: ${req.body.watchName}.`);
                return res.status(HttpStatus.Found).redirect(`/watches`);
            }
    
            // Nếu có thay đổi, tiến hành cập nhật
            const updatedWatch = await WatchSchema.findByIdAndUpdate(watchId,
                {
                    watchName: req.body.watchName,
                    image: req.body.image,
                    price: parseInt(req.body.price),
                    automatic: req.body.automatic === 'true',
                    watchDescription: req.body.watchDescription,
                    brandName: req.body.brandName,
                    updatedAt: Date.now()  // Cập nhật thời gian sửa
                },
                { new: true }  // Trả về tài liệu đã được cập nhật
            );
            if(!updatedWatch){
                req.flash('error_msg', `Watch update failed. Please try again.`);
                return res.status(HttpStatus.Accepted).redirect(`/watches`);
            }
            // Nếu cập nhật thành công, chuyển hướng và thông báo
            req.flash('success_msg', `Watch updated successfully for row: ${req.body.index}!`);
            return res.redirect(`/watches`);
    
        } catch (error) {
            req.flash('error_msg', `Internet error when try connected with db. Please try later`);
            return res.status(HttpStatus.InternalServerError).redirect(`/watches`);
        }
    };

    public searchWatch = async (req: Request, res: Response) => {
        const member = req.session.member
        const isAdmin = req.query.admin === 'true'
        try {
            const watchName = req.query.watches || ''; // Lấy từ khóa tìm kiếm từ query param
            let matchCondition: any = {
                watchName: { $regex: watchName, $options: 'i' } // Tìm kiếm theo watchName
            };

        
            let watches = [];
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
            if(member?.isAdmin && isAdmin){
                watches = await WatchSchema.aggregate([
                    {
                        $match: {
                            watchName: { $regex: watchName, $options: 'i' } // Tìm kiếm theo watchName không phân biệt hoa thường
                        }
                    },
                    {
                        $sort: { createdAt: -1 } // Sắp xếp theo ngày tạo
                    },
                    {
                        $lookup: {
                            from: "brands", // Tên collection bạn muốn join
                            localField: "brandName", // Trường trong WatchSchema
                            foreignField: "_id", // Trường trong BrandSchema
                            as: "brand" // Tên mới để chứa kết quả populate
                        }
                    },
                    {
                        $unwind: "$brand" // Chuyển mảng thành object để dễ truy cập
                    }
                ])
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
            }else{
                watches = await WatchSchema.aggregate([
                    {
                        $match: matchCondition
                    },
                    { 
                        $sort: { createdAt: -1 } // Sắp xếp theo ngày tạo
                    },
                    {
                        $lookup: {
                            from: "brands", // Tên collection của bảng brands
                            localField: "brandName", // Trường trong WatchSchema là ObjectId
                            foreignField: "_id", // Trường trong BrandSchema để join
                            as: "brand" // Tạo trường mới chứa kết quả join
                        }
                    },
                    { 
                        $unwind: "$brand" // Chuyển mảng thành object để dễ truy cập
                    },
                    {
                        $project: {
                            watchName: 1,          // Chỉ lấy các trường cần thiết
                            image: 1,
                            price: 1,
                            brandName: "$brand.brandName" // Lấy tên thương hiệu từ kết quả join
                        }
                    }
                ]);
            }
            // Sử dụng aggregation với tìm kiếm và $lookup
            const brands = await BrandSchema.find();
            const count = await WatchSchema.countDocuments({});
            // Render lại trang với kết quả tìm kiếm
            if(member?.isAdmin && isAdmin){
                return res.render('watchesDashboard', { watches,member,brands, current:page, pages: Math.ceil(count / perPage), });
            }
            else{
                return res.render('index', { watches,member,brands }); 
            }
        } catch (error) {
            req.flash('error_msg', 'Something went wrong');
            if(member?.isAdmin && isAdmin){
                return res.status(HttpStatus.InternalServerError).redirect('/watches');
            }else{
                return res.status(HttpStatus.InternalServerError).redirect('/');
            }
        }
    }

    public filterWatch = async (req: Request, res: Response) => {
            const brandName = req.params.brandName;
            const member = req.session.member
            console.log(brandName);
            if(brandName){
                try {
                    const brand = await BrandSchema.findOne({ brandName: { $regex: brandName, $options: 'i' } });
                    if (!brand) {
                        req.flash('error_msg', `Brand ${brandName} not found.`);
                        return res.status(404).redirect(`/${brandName}`);
                    }
                    const brands = await BrandSchema.find();
                    const watches = await WatchSchema.aggregate([
                        {
                            $match: { brandName: new mongoose.Types.ObjectId(brand._id) }
                        },
                        {
                            $lookup: {
                                from: 'brands', // Tên collection brands
                                localField: 'brandName', // Trường brandName trong watches
                                foreignField: '_id', // Trường _id trong brands
                                as: 'brand' // Tên trường mới chứa thông tin chi tiết của brand
                            }
                        },
                        {
                            $unwind: '$brand' // Đảm bảo brandDetails không phải là một mảng
                        },
                        {
                            $project: {
                                watchName: 1,          // Chỉ lấy các trường cần thiết
                                image: 1,
                                price: 1,
                                brandName: "$brand.brandName" // Lấy tên thương hiệu từ kết quả join
                            }
                        }
                    ]);
                    console.log(watches)
                    // Render view với dữ liệu watches và thông tin chi tiết về brand
                    return res.render('index', { watches, brand, member, brands });
                } catch (error) {
                    
                }
            }else{

            }
            
    }

    
}