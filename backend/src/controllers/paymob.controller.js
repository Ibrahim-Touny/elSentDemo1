import axios from "axios";
import {
  getAuthToken,
  createTransaction,
  captureTransaction,
  voidTransaction,
} from "../utils/paymobHelper.js";
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID_Online_Card =
  process.env.PAYMOB_INTEGRATION_ID_Online_Card;
const PAYMOB_API_URL = process.env.PAYMOB_API_URL;
import Auction from "../models/auction.model.js";
// Payment Controller function for creating the payment order
export const createPaymentOrder = async (req, res) => {
  // console.log("usersssss", req.user);
  try {
    const { amount_cents } = req.body;

    // Extract user-related data from req.user
    const { fullName, email, phone, address, city } = req.user;

    // Split fullName into first and last name
    const [first_name, ...lastNameParts] = fullName.split(" ");
    const last_name = lastNameParts.join(" ") || "";

    // Step 1: Authenticate
    const authResponse = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      {
        api_key: PAYMOB_API_KEY,
      }
    );

    if (!authResponse.data.token) {
      return res
        .status(500)
        .json({ message: "Failed to obtain authentication token" });
    }

    const token = authResponse.data.token;

    // Step 2: Create Order
    const orderResponse = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: amount_cents || 1000, // Amount in cents
        amount: amount_cents / 100,
        currency: "EGP", // Assuming currency is EGP
        items: [
          {
            name: "Product Name", // Replace with actual product name
            amount_cents: amount_cents,
            description: "Payment for product/service",
            quantity: 1,
          },
        ],
      }
    );

    if (!orderResponse.data.id) {
      return res.status(500).json({ message: "Failed to create order" });
    }

    const orderId = orderResponse.data.id;

    // Step 3: Generate Payment Key
    try {
      const paymentKeyResponse = await axios.post(
        "https://accept.paymob.com/api/acceptance/payment_keys",
        {
          auth_token: token,
          amount_cents: amount_cents * 100,
          expiration: 3600, // Payment key validity duration in seconds
          order_id: orderId,
          billing_data: {
            apartment: "NA",
            email: email,
            floor: "NA",
            first_name: first_name, // Extracted first name
            street: address || "NA",
            building: "NA",
            phone_number: phone || "NA",
            shipping_method: "NA",
            postal_code: "NA",
            city: city || "NA",
            country: "EGY", // Assuming country is Egypt
            last_name: last_name, // Extracted last name
            state: "NA",
          },
          currency: "EGP", // Assuming currency is EGP
          integration_id: PAYMOB_INTEGRATION_ID_Online_Card,
        }
      );

      if (!paymentKeyResponse.data.token) {
        console.error("Payment Key Response:", paymentKeyResponse.data);
        return res
          .status(500)
          .json({ message: "Failed to generate payment key" });
      }

      const paymentKey = paymentKeyResponse.data.token;

      // Redirect to Payment Link
      const paymentURL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
      return res.status(200).json({ payment_link: paymentURL });
    } catch (error) {
      console.error(
        "Error in Step 3 (Payment Key Generation):",
        error.response?.data || error.message
      );
      return res.status(500).json({
        message: "Error generating payment key",
        details: error.response?.data || error.message,
      });
    }
  } catch (error) {
    console.error(
      "Error processing payment:",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Error processing payment" });
  }
};
export const capture = async (req, res) => {
  const { transaction_id, amount_cents } = req.body;

  try {
    const authToken = await getAuthToken();
    const captureResponse = await captureTransaction(
      authToken,
      transaction_id,
      amount_cents
    );
    // console.log("captureResponse", captureResponse);
    res.json({ captureResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const preAuthorize = async (req, res) => {
  const { amount_cents } = req.body;
  const userId = req.user?._id || 10000;
  try {
    // Get the auth token from Paymob
    const authToken = await getAuthToken();

    // Create the transaction (this will hold the amount, not capture it yet)
    const preAuthorizeResponse = await createTransaction(
      authToken,
      amount_cents,
      userId
    );
    // console.log("preAuthorizeResponse", preAuthorizeResponse);
    if (preAuthorizeResponse?.id) {
      // Store the pre-authorization transaction id in the database (e.g., in an orders or pre_authorizations collection)
      // Example: await storePreAuthorization(userId, preAuthorizeResponse.id);

      res.json({
        message: "Pre-authorization successful",
        preAuthorizeResponse,
      });
    } else {
      res.status(500).json({ message: "Failed to pre-authorize the amount" });
    }
  } catch (error) {
    console.error("Error during pre-authorization:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const voidPreAuthorization = async (req, res) => {
  const { transaction_id } = req.body; // The transaction ID from the pre-authorization response
  // console.log("first");
  try {
    const authToken = await getAuthToken();

    // Call the void transaction API to cancel the pre-authorization
    const refundResponse = await voidTransaction(authToken, transaction_id);
    if (refundResponse) {
      res.json({
        message: "Pre-authorization voided successfully",
        refundResponse,
      });
    } else {
      res.status(500).json({ message: "Failed to void pre-authorization" });
    }
  } catch (error) {
    console.error("Error during void pre-authorization:", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const refund = async (req, res) => {
  const { transaction_id, amount_cents } = req.body;

  try {
    const authToken = await getAuthToken();
    const refundResponse = await voidTransaction(authToken, transaction_id);
    res.json({ refundResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const webHookController = async (req, res) => {
  const payload = req.body.obj;
  const transactionId = payload.id; // Transaction ID
  const userId = payload.payment_key_claims.extra.user_id; // User ID
  const auctionId = payload.payment_key_claims.extra.auction_id; // Auction ID
  // console.log("obj", transactionId, userId, auctionId);
  if (!transactionId || !userId || !auctionId) {
    return res.status(400).json({ message: "Missing required data" });
  }
  const userObject = {
    transaction_id: transactionId,
    user_id: userId,
  };
  // console.log("success", payload.success);
  if (payload.success == true) {
    try {
      const auction = await Auction.findByIdAndUpdate(
        auctionId, // Find by auction ID
        { $push: { users: userObject } }, // Push the user object into the users array
        { new: true } // Options: `new` returns the updated document, `upsert` creates a new auction if not found
      );
      res.status(200).send("Payment successful");
    } catch (error) {
      console.error("Error verifying transaction with Paymob:", error);
      res.status(500).send("Error verifying payment");
    }
  } else {
    res.status(400).send("Payment not approved");
  }
};

export const webHookFinalController = async (req, res) => {
  const payload = req.body.obj;
  const transactionId = payload.id; // Transaction ID
  const userId = payload.payment_key_claims.extra.user_id; // User ID
  const auctionId = payload.payment_key_claims.extra.auction_id; // Auction ID

  // console.log("Received Webhook Payload", transactionId, userId, auctionId);

  // Check if required data exists
  if (!transactionId || !userId || !auctionId) {
    return res.status(400).json({ message: "Missing required data" });
  }

  // console.log("Payment Success:", payload.success);

  if (payload.success === true) {
    try {
      // Update the auction document to set the `paid` attribute to true
      const auction = await Auction.findByIdAndUpdate(
        auctionId, // Find auction by ID
        { paid: true }, // Set the `paid` field to true
        { new: true } // Return the updated auction document
      );

      // Check if the auction was found and updated
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }

      // console.log("Auction payment updated:", auction);
      res
        .status(200)
        .send("Payment successfully processed and auction marked as paid");
    } catch (error) {
      console.error("Error updating auction payment status:", error);
      res.status(500).send("Error updating auction payment status");
    }
  } else {
    res.status(400).send("Payment not approved");
  }
};
