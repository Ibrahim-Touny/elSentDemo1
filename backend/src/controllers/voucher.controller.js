import Voucher from "../models/voucher.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateVoucherCode = () => {
    return 'VOUCHER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const createVoucher = asyncHandler(async (req, res) => {
    try {
        const user  = req.body;
        const voucher = await Voucher.create({
            code: generateVoucherCode(),
            user: user._id,
            userName: user.fullName,
            userEmail: user.email,
            userPhoto: user.profilePicture
        });

        if (!voucher) {
            return res.status(500).json(new ApiResponse(500, "Error creating Voucher"));
            }
    
           // return res.status(201).json(new ApiResponse(201, "Voucher created successfully", voucher));
           res.status(201).json({
            status:true,
            message:"Voucher created successfully",
            data:voucher
           })
        } catch (error) {
            // Handle the error
            return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
        }
    });

export const getAllVouchers = asyncHandler(async (req, res) => {
    try {
        const vouchers = await Voucher.find({ isUsed: false });

        if (!vouchers) {
            return res.status(404).json(new ApiResponse(404, "Vouchers not found"));
        }

        // console.log('Vouchers:', vouchers);

        return res.status(200).json(new ApiResponse(200, "Vouchers found", vouchers));
    } catch (error) {
        // Handle the error
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
    }
});

export const disableAllVouchers = asyncHandler(async (req, res) => {
    try {
        const vouchers = await Voucher.updateMany({}, { isUsed: true });

        if (!vouchers) {
            return res.status(404).json(new ApiResponse(404, "Vouchers not found"));
        }
        return res.status(200).json(new ApiResponse(200, "Vouchers disabled successfully", vouchers));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
    }
});


export default {
    createVoucher,
};