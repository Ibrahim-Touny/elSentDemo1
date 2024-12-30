import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import "./cronJobs.js";
import cron from "node-cron";

import helmet from "helmet";
const app = express();
//app.use(morgan());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import productCategoryRouter from "./routes/productCategory.routes.js";
import auctionRouter from "./routes/auction.routes.js";
import cityRouter from "./routes/city.routes.js";
import bidRouter from "./routes/bid.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import cartRouter from "./routes/cart.routes.js";
import metalsRouter from "./routes/metalPrice.routes.js";
import liveRouter from "./routes/live.routes.js";
import paymobRouter from "./routes/paymob.routes.js";
import verifyRouter from "./routes/emailverification.routes.js";
import voucherRouter from "./routes/voucher.routes.js";
import imageRouter from "./routes/image.routes.js";
import contactRouter from "./routes/contact.routes.js";
// routes declaration
import fileUpload from "express-fileupload";
app.use(
  fileUpload({
    useTempFiles: true, // Enables temporary file storage
    tempFileDir: "/tmp/", // Temporary file directory
  })
);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/images", imageRouter);
app.use("/api/v1/product-categories", productCategoryRouter);
app.use("/api/v1/auctions", auctionRouter);
app.use("/api/v1/cities", cityRouter);
app.use("/api/v1/bids", bidRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/verify-email", verifyRouter);
app.use("/api/v1/vouchers", voucherRouter);

app.use("/api/v1/metals", metalsRouter);
app.use("/api/v1/metals/fetch", metalsRouter);
app.use(`/api/v1/live`, liveRouter);
app.use(`/api/v1/paymob`, paymobRouter);
app.use(`/api/v1/contact`, contactRouter);

import { fetchAndStoreMetalPricesCron } from "./controllers/metalPrice.controller.js";
cron.schedule("0 6 * * *", async () => {
  console.log("Cron job started: Fetching metal prices...");
  await fetchAndStoreMetalPricesCron();
  console.log("Cron job completed: Metal prices fetched and stored.");
});

export { app };
