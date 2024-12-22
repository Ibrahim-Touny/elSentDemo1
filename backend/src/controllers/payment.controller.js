import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import {myfatoorah_payment_execute}  from "../MyFatoorah_src/controllers/myfatoorah_payment_execute.js";// @desc checkout
// @route POST /api/v1/payments/checkout
// @access Private
const paymentCheckout = asyncHandler(async (req, res) => {
  try {
      console.log("req.body11111111111", req.body);
      const countryIsoCode = "KWD";
      const apiKey = process.env.MYFATOORAH_API_KEY;
      const PaymentMethodId = 2;

      const getUserId = req.user._id.toString();
      const user = await User.findById({ _id: getUserId });
      if (!user) {
          return res.status(404).json(new ApiResponse(404, "User not found"));
      }

      
      
      const session = await myfatoorah_payment_execute(1000, 2, );

      console.log("Session result: ", session);

      if (!session || session.hasOwnProperty('error')) {
          return res.status(500).json(new ApiResponse(500, session.error || "Failed to execute payment"));
      }

      return res.status(201).json(session);
  } catch (error) {
      console.log(error);
      return res.status(500).json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});


export { 
  paymentCheckout,
};
