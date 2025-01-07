import { asyncHandler } from "../utils/asyncHandler.js";
import nodemailer from "nodemailer";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
// Email Verification Controller
const sendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit code
  user.verificationCode = verificationCode;
  user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes
  await user.save({ validateBeforeSave: false });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
      },
    });

    const year = new Date().getFullYear();

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: user.email,
      subject: "Your Verification Code",
      text: `Dear ${user.fullName},

Your verification code is ${verificationCode}. It is valid for 10 minutes.

If you did not request this code, please disregard this email.

Thank you for using MzBid.  
If you have any questions or concerns, feel free to contact our support team.

Best regards,  
The MzBid Team  

---
© ${year} MzBid. All rights reserved.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to email.",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res
      .status(500)
      .json({ success: false, message: "Email sending failed" });
  }
});
const verifyCode = asyncHandler(async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res
      .status(400)
      .json({ success: false, message: "Email and code are required" });
  }
  // console.log("Data", email, verificationCode);
  const user = await User.findOne({ email });
  // console.log("user", user);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (user.verificationCode != verificationCode) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification code",
    });
  }
  user.emailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json({ success: true, message: "Verification successful" });
});

export { sendVerificationCode, verifyCode };
