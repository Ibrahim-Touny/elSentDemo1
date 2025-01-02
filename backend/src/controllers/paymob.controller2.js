import axios from "axios";
import crypto from "crypto";
import Auction from "../models/auction.model.js";
const wallet_integration_id = process.env.PAYMOB_INTEGRATION_ID_Mobile_Wallet;
let card_integration_id = process.env.PAYMOB_INTEGRATION_ID_Online_Card;
//convert card id into number
card_integration_id = Number(card_integration_id);
const public_key = process.env.PAYMOB_PUBLIC_KEY;
const ngrok_url = process.env.PAYMOB_NGROK_WEBHOOK;
// Controller function
export const holdAmount = async (req, res) => {
  try {
    const userObject = {
      address: "6 october - fourth district - 1114 building number - 6th flat",
      auctions: [],
      bids: [],
      city: "Giza",
      createdAt: "2024-12-25T18:35:01.066Z",
      description: "description",
      email: "xmidos25256@gmail.com",
      emailVerified: true,
      fullName: "xmidos mk",
      notifications: [],
      paymentVerified: false,
      phone: "01120722572",
      products: [],
      profilePicture:
        "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg",
      reviews: [],
      transactions: [],
      updatedAt: "2024-12-25T23:53:27.938Z",
      userType: "user",
      verificationCode: 940895,
      __v: 0,
      _id: "676c5055a4611b7db6b27e41",
    };

    const auction = req.body.auction || req.body; // Auction details from the request body
    const user = req.user || userObject; // User details stored in req.user
    const [first_name, ...last_nameParts] = user.fullName.split(" ");
    // console.log("auction");
    const last_name = last_nameParts.join(" ");
    // console.log("alo", wallet_integration_id, card_integration_id);
    // Ensure necessary fields are provided
    if (
      !auction.startingPrice ||
      // !auction.items ||
      !user ||
      !first_name ||
      !user.phone ||
      !user.email
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate a unique special reference
    const specialReference = crypto.randomBytes(16).toString("hex");

    // Prepare the request payload for Paymob API
    const payload = {
      alo1: "s",
      amount: 100000, //amount in cents
      currency: "EGP",
      payment_methods: [card_integration_id], // Replace with actual Integration ID
      // items: auction.items.map((item) => ({
      //   name: item.name,
      //   amount: item.amount, // Amount per item in cents
      //   description: item.description || "Item description",
      //   quantity: item.quantity || 1,
      // })),
      billing_data: {
        apartment: "dummy",
        first_name: first_name,
        last_name: last_name,
        street: "dummy",
        building: "dummy",
        phone_number: user.phone,
        city: "dummy",
        country: "dummy",
        email: user.email,
        floor: "dummy",
        state: "dummy",
        alo2: "s",
      },
      extras: {
        ee: 22,
        user_id: user._id, // Assuming user ID is available in req.user
        auction_id: auction._id, // Assuming auction ID is in the request body
        alo3: 33,
      },
      special_reference: specialReference,
      notification_url: `${ngrok_url}/api/v1/paymob/webhook`,
      // "https://a2d3-41-234-201-253.ngrok-free.app/api/v1/paymob/webhook", // Replace with your actual webhook URL
      redirection_url: `http://localhost:5173/single-auction-detail/${auction._id}`, // Replace with your actual redirection URL
    };

    // Make the API request to Paymob
    const response = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      payload,
      {
        headers: {
          Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
        },
      }
    );

    // Return the API response to the client
    const client_secret = response.data.client_secret;
    const redirection_link = `https://accept.paymob.com/unifiedcheckout/?publicKey=${public_key}&clientSecret=${client_secret}`;
    res.status(200).json({ link: redirection_link });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the payment" });
  }
};
export const finalPayment = async (req, res) => {
  try {
    const userObject = {
      address: "6 october - fourth district - 1114 building number - 6th flat",
      auctions: [],
      bids: [],
      city: "Giza",
      createdAt: "2024-12-25T18:35:01.066Z",
      description: "description",
      email: "xmidos25256@gmail.com",
      emailVerified: true,
      fullName: "xmidos mk",
      notifications: [],
      paymentVerified: false,
      phone: "01120722572",
      products: [],
      profilePicture:
        "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg",
      reviews: [],
      transactions: [],
      updatedAt: "2024-12-25T23:53:27.938Z",
      userType: "user",
      verificationCode: 940895,
      __v: 0,
      _id: "676c5055a4611b7db6b27e41",
    };

    const auction = req.body.auction || req.body; // Auction details from the request body
    const user = req.user || userObject; // User details stored in req.user
    const [first_name, ...last_nameParts] = user.fullName.split(" ");
    const last_name = last_nameParts.join(" ");

    // Ensure necessary fields are provided
    if (
      !auction.startingPrice ||
      !auction.users ||
      !user ||
      !first_name ||
      !user.phone ||
      !user.email
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // console.log("usets", auction.users[0]);
    // console.log("usets", auction.users[1]);
    // Check if the user._id exists in the auction users array
    const userExistsInAuction = auction.users.some(
      (auctionUser) => auctionUser.user_id?.toString() === user._id.toString()
    );

    if (!userExistsInAuction) {
      return res.status(400).json({
        error:
          "You must pay the hold amount first before proceeding with the final payment.",
      });
    }

    // Generate a unique special reference
    const specialReference = crypto.randomBytes(16).toString("hex");

    // Prepare the request payload for Paymob API
    const payload = {
      amount: auction.startingPrice - 100000 || 5000000, // Amount in cents
      currency: "EGP",
      payment_methods: [card_integration_id], // Replace with actual Integration ID
      billing_data: {
        apartment: "dummy",
        first_name: first_name,
        last_name: last_name,
        street: "dummy",
        building: "dummy",
        phone_number: user.phone,
        city: "dummy",
        country: "dummy",
        email: user.email,
        floor: "dummy",
        state: "dummy",
      },
      extras: {
        user_id: user._id, // Assuming user ID is available in req.user
        auction_id: auction._id, // Assuming auction ID is in the request body
      },
      special_reference: specialReference,
      notification_url: `${ngrok_url}/api/v1/paymob/webhook-final`,
      // "https://a2d3-41-234-201-253.ngrok-free.app/api/v1/paymob/webhook-final", // Replace with your actual webhook URL
      redirection_url: `http://localhost:5173/single-auction-detail/${auction._id}`, // Replace with your actual redirection URL
    };

    // Make the API request to Paymob for the final payment
    const response = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      payload,
      {
        headers: {
          Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
        },
      }
    );

    // Return the API response to the client
    const client_secret = response.data.client_secret;
    const redirection_link = `https://accept.paymob.com/unifiedcheckout/?publicKey=${public_key}&clientSecret=${client_secret}`;
    res.status(200).json({ link: redirection_link });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the payment" });
  }
};

export const refundTransactions = async (req, res) => {
  try {
    const auction = req.body.auction || req.body; // Auction details from the request body
    // console.log("auction", auction);
    if (!auction || !auction.users || !Array.isArray(auction.users)) {
      return res.status(400).json({ error: "Invalid auction data" });
    }

    const refundPromises = auction.users.map(async (user) => {
      if (user.transaction_id) {
        // console.log("user", user);
        const payload = {
          transaction_id: user.transaction_id,
          amount_cents: 10, // Amount to refund in cents
        };
        const response = await axios.post(
          "https://accept.paymob.com/api/acceptance/void_refund/refund",
          payload,
          {
            headers: {
              Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
            },
          }
        );
        return response.data; // Extract only the data from the response
      }
    });

    // Wait for all refund requests to complete
    const results = await Promise.all(refundPromises);

    // Empty the array of users after the promise is finished
    try {
      await Auction.findByIdAndUpdate(
        auction._id, // Assuming `auction.id` contains the auction ID
        { $set: { users: [] } }, // Update the `users` field to an empty array
        { new: true } // Return the updated document
      );
    } catch (error) {
      console.error("Error updating auction users:", error);
      res.status(500).json({ error: "Failed to update auction users" });
    }
    res
      .status(200)
      .json({ message: "Refunds processed successfully", results });
  } catch (error) {
    console.error("the error", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the refunds" });
  }
};
