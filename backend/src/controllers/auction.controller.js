import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import City from "../models/city.model.js";
import mongoose from "mongoose";

// @desc Create auction product
// @route POST /api/v1/auctions
// @access Private/ Seller only
const createAuction = asyncHandler(async (req, res) => {
//  // console.log("files of images", req.files.images);
   
  try {
    const {
      name,
      description,
      category,
      startTime,
      endTime,
      startingPrice,
      location,
      height,
      width,
      length,
      materialUsed,
      weight,
      workmanshipFee,
      incrementPrice,
    } = req.body;

   


    const files = req?.files; // Assuming `req.files` contains the array of uploaded images
    let uploadedImages;
    // Check if images are provided
    if (!files || files.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, "At least one image is required"));
    }
        
    if (files) {
      // Upload images to Cloudinary or your storage service
       uploadedImages = await Promise.all(
        files.map(async (file) => {
          const imgUrlCloudinary = await uploadOnCloudinary(file.path);
          
          if (!imgUrlCloudinary) {
            throw new Error("Error uploading images");
          }
          return imgUrlCloudinary.url; // Assuming Cloudinary returns an object with the URL
        })
      );
    }


    // Check if fields are empty
    if (
      !name ||
      !description ||
      !category ||
      !startTime ||
      !endTime ||
      !startingPrice ||
      !location ||
      !height ||
      !width ||
      !length ||
      !materialUsed ||
      !weight ||
      !workmanshipFee ||
      !incrementPrice
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, "All fields are required"));
    }

    // Check if startTime is before endTime
    if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Start time must be before end time"));
    }

    // Check if startingPrice is a positive number
    if (startingPrice <= 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Starting price must be a positive number"));
    }

    let currentDate = new Date();
    let status = "upcoming";
    if (new Date(startTime).getTime() < currentDate.getTime()) {
      status = "active";
    }
    if (new Date(endTime).getTime() < currentDate.getTime()) {
      status = "over";
    }

    // Create the auction
    const auction = await Auction.create({
      name,
      description,
      category,
      seller: req.user._id,
      startTime,
      endTime,
      location,
      images: uploadedImages, // Save the array of image URLs
      startingPrice,
      status,
      height,
      length,
      width,
      materialUsed,
      weight,
      workmanshipFee,
      incrementPrice,
    });

    if (!auction) {
      return res
        .status(500)
        .json(new ApiResponse(500, "Error creating auction"));
    }

    return res
      .status(201)
      .json(new ApiResponse(201, "Auction created successfully", auction));
  } catch (error) {
    // Handle the error
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get all auctions
// @route GET /api/v1/auctions
// @access Public

const getAllAuctions = asyncHandler(async (req, res) => {
  try {
    const { location, category, itemName } = req.body;

    let filter = {  };

    if (location) {
      if (!mongoose.Types.ObjectId.isValid(location)) {
        const cityid = await City.find({ name: location });
        if (cityid.length > 0) {
          filter.location = cityid[0]._id.toString();
        } else {
          // console.log("Invalid location name:", location);
        }
      } else {
        filter.location = location;
      }
    }

    if (category) filter.category = category;
    if (itemName) filter.name = { $regex: itemName, $options: "i" };

    const auctions = await Auction.find(filter)
      .populate("category", "name") // Populate the category with its name
      .populate("location", "name") // Populate the location with its name
      .populate("winner") // Populate the winner (Bid)
      .populate("bids")
      .populate({
        path: "bids",
        populate: {
          path: "bidder",
          select: "fullName email profilePicture",
        },
      })
      .populate({
        path: "winner",

        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      })
      .sort({ createdAt: -1 }); // Sort auctions by creation date (newest first)
    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", auctions)
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, error.message || "Internal server error"));
  }
});

// @desc Get a single Auction by ID
// @route GET /api/v1/auctions/:id
// @access Public

const getSingleAuctionById = asyncHandler(async (req, res) => {
  try {
    // console.log("single auction getting...");

    const auction = await Auction.findById(req.params.id)
      .populate("category", "name") // Populating category
      .populate("location", "name") // Populating location
      // .populate("seller", "fullName email phone location profilePicture") // Populating seller
      .populate({
        path: "bids",
        populate: {
          path: "bidder", // Populate bidder inside bids
          select: "fullName email profilePicture", // Select specific fields from bidder
        },
      })
      .populate({
        path: "winner",
        populate: {
          path: "bidder", // Populate bidder for the winner
          select: "fullName profilePicture",
        },
      });
    // // console.log("resp", auction);

    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }

    return res.json(
      new ApiResponse(200, "Auction retrieved successfully", auction)
    );
  } catch (error) {
    // Handle the error
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Update auction status
// @route POST /api/v1/auctions/:id/status
// @access public

const updateAuctionStatus = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    //check start and now time and update status
    const now = new Date();

    if (now < auction.startTime) {
      auction.status = "upcoming";
    } else if (now > auction.startTime && now < auction.endTime) {
      auction.status = "active";
    } else {
      auction.status = "over";
    }

    await auction.save();
    return res.json(
      new ApiResponse(200, "Auction status updated successfully", auction)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get all auctions of a user on which he placed bids
// @route GET /api/v1/auctions/user-bids
// @access Private

const getBidsAuctionsByUser = asyncHandler(async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate("auction")
      // populate category in auction
      .populate({
        path: "auction",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });
    // it is not showing in reverse order

    if (!bids) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }

    return res.json(new ApiResponse(200, "bids retrieved successfully", bids));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get all auctions by a user uploaded by him
// @route GET /api/v1/auctions/user-auctions
// @access Private

const getAuctionsByUser = asyncHandler(async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id })
      .populate("category", "name")
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "fullName",
        },
      })
      .sort({ createdAt: -1 });

    if (!auctions) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }

    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", {
        auctions: auctions,
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc delete auction by id
// @route DELETE /api/v1/auctions/delete/:id
// @access Private

const deleteSingleAuctionById = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    //delete all related data to this auction like bids and reviews

    const bids = await Bid.find({ auction: req.params.id });
    if (bids) {
      await Bid.deleteMany({ auction: req.params.id });
    }
    // console.log(auction, "auction.............");

    await Auction.deleteOne({ _id: req.params.id });
    return res.json(
      new ApiResponse(200, "Auction deleted successfully", auction)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc update a single auction by id
// @route PUT /api/v1/auctions/update/:id
// @access Private
//FIXME:
const updateSingleAuactionById = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      startTime,
      endTime,
      startingPrice,
      location,
      height,
      length,
      width,
      materialUsed,
      weight,
      workmanshipFee,
      incrementPrice,
    } = req.body;
    // console.log("images", req.body.images);
    const images = req.files?.map((file) => file.path); // Assuming you're using multer for handling multiple files

    // console.log(req.body, "req.body........");
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }

    // Check if startingPrice is a positive number
    if (startingPrice <= 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Starting price must be a positive number"));
    }

    let currentDate = new Date();

    if (startTime > endTime) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Start time must be before end time"));
    }
    if (startTime < currentDate.getTime()) {
      auction.status = "active";
    } else {
      auction.status = "upcoming";
    }
    if (auction.status === "over") {
      return res
        .status(400)
        .json(new ApiResponse(400, "Auction is over, you can't update"));
    }

    let imgUrlsCloudinary = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const imgUrlCloudinary = await uploadOnCloudinary(image);
        // console.log(imgUrlCloudinary);
        if (!imgUrlCloudinary?.url) {
          return res.status(400).json(new ApiResponse(400, "Invalid image"));
        }
        imgUrlsCloudinary.push(imgUrlCloudinary.url);
      }
    }

    auction.name = name ? name : auction.name; 
    auction.description = description ? description : auction.description;
    auction.category = category ? category : auction.category;
    auction.startTime = startTime ? startTime : auction.startTime;
    auction.endTime = endTime ? endTime : auction.endTime;
    auction.startingPrice = startingPrice
      ? startingPrice
      : auction.startingPrice;
    auction.location = location ? location : auction.location;
    auction.height = height ? height : auction.height;
    auction.length = length ? length : auction.length;
    auction.width = width ? width : auction.width;
    auction.materialUsed = materialUsed ? materialUsed : auction.materialUsed;
    auction.weight = weight ? weight : auction.weight;
    auction.workmanshipFee = workmanshipFee
      ? workmanshipFee
      : auction.workmanshipFee;
    auction.incrementPrice = incrementPrice
      ? incrementPrice
      : auction.incrementPrice;

    // Update the auction's images array
    auction.images =
      imgUrlsCloudinary.length > 0 ? imgUrlsCloudinary : auction.images;

    await auction.save();
    return res
      .status(201)
      .json(new ApiResponse(201, "Auction Updated Successfully."));
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// @desc Get auction winner
// @route GET /api/v1/auctions/:id/winner
// @access Public

const getAuctionWinner = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate({
      path: "winner",

      populate: {
        path: "bidder",
        select: "fullName  profilePicture",
      },
    });

    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    if (auction.bids.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }
    const winner = {
      winnerFullName: auction?.winner?.bidder?.fullName,
      winnerProfilePicture: auction?.winner?.bidder?.profilePicture,
      winnerBidAmount: auction?.winner?.bidAmount,
      winnerBidTime: auction?.winner?.bidTime,
    };

    return res.status(200).json(
      new ApiResponse(200, "Auction winner retrieved successfully", {
        winner: winner,
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});



const getLiveAuctions = asyncHandler(async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "active" })
      .limit(10)
      .populate("seller", "fullName email phone location profilePicture")
      .populate({
        path: "winner",

        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      });

    if (!auctions) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }
    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", auctions)
    );
  } catch (error) {
    // Handle the error
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get UPCOMING 10 auctions
// @route GET /api/v1/auctions/upcoming-auctions
// @access Public

const getUpcomingAuctions = asyncHandler(async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "upcoming" })
      .limit(10)
      .populate("seller", "fullName email phone location profilePicture")
      .populate({
        path: "winner",

        populate: {
          path: "bidder",
          select: "fullName  profilePicture",
        },
      });

    if (!auctions) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }
    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", auctions)
    );
  } catch (error) {
    // Handle the error
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc update payment status of auction
// @route PUT /api/v1/auctions/update-payment-status/:id
// @access Private

const updatePaymentStatus = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    auction.paid = true;
    await auction.save();
    return res.json(
      new ApiResponse(
        200,
        "Auction payment status updated successfully",
        auction
      )
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

export {
  createAuction,
  getAllAuctions,
  getSingleAuctionById,
  updateAuctionStatus,
  getBidsAuctionsByUser,
  getAuctionsByUser,
  deleteSingleAuctionById,
  updateSingleAuactionById,
  getAuctionWinner,
  getLiveAuctions,
  getUpcomingAuctions,
  updatePaymentStatus,
};
