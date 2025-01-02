import { asyncHandler } from "../utils/asyncHandler.js";
import nodemailer from "nodemailer";
import ApiResponse from "../utils/ApiResponse.js";

// Contact Us Controller
const contactUs = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  // console.log("body", req.body);
  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required",
    });
  }

  try {
    // Configure nodemailer transporter
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

    // Email details
    const mailOptions = {
      from: email, // Sender's email
      to:
        process.env.SUPPORT_EMAIL ||
        process.env.USER_EMAIL ||
        "xmidos25256@gmail.com", // Support email address
      subject: `Contact Us Inquiry from ${name}`,
      text: `You have received a new message from the Contact Us form on MzBid.  

Details:  
- Name: ${name}  
- Email: ${email}  
- Message: ${message}  

Best regards,  
The MzBid Contact Form  

---  
© ${year} MzBid. All rights reserved.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message:
        "Your message has been sent successfully. We will contact you soon.",
    });
  } catch (error) {
    console.error("Error sending contact us email:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send your message. Please try again later.",
    });
  }
});

export { contactUs };
