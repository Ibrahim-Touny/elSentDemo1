import axios from "axios";
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY; // Add this in your .env file
const PAYMOB_API_URL = "https://accept.paymob.com/api";
const PAYMOB_INTEGRATION_ID_Online_Card =
  process.env.PAYMOB_INTEGRATION_ID_Online_Card;
export const getAuthToken = async () => {
  const response = await axios.post(`${PAYMOB_API_URL}/auth/tokens`, {
    api_key: PAYMOB_API_KEY,
  });
  return response.data.token;
};

export const createTransaction = async (authToken, amount_cents, userId) => {
  try {
    // Transaction creation request body
    const response = await axios.post(
      `${PAYMOB_API_URL}/api/ecommerce/orders`, // Endpoint to create a new order
      {
        auth_token: authToken,
        amount_cents: amount_cents, // Amount to hold (in cents)
        currency: "EGP", // Currency
        delivery_needed: false, // You can set this to true if you want delivery info
        items: [
          {
            name: "Product Name", // This can be dynamic, depending on the actual item
            description: "Payment for product/service",
            amount_cents: amount_cents, // Ensure this is set correctly
            quantity: 1, // You can adjust based on your order system
          },
        ],
        integration_id: PAYMOB_INTEGRATION_ID_Online_Card, // Integration ID for your online card
      }
    );

    // If the response is successful, return the transaction object
    if (response.data.id) {
      return {
        id: response.data, // Return the transaction ID
        status: "success", // Status of the transaction
      };
    } else {
      throw new Error("Failed to create transaction");
    }
  } catch (error) {
    throw new Error(`Error creating transaction: ${error.message}`);
  }
};

export const captureTransaction = async (
  authToken,
  transactionId,
  amountCents
) => {
  const response = await axios.post(`${PAYMOB_API_URL}/acceptance/capture`, {
    auth_token: authToken,
    transaction_id: transactionId,
    amount_cents: amountCents,
  });
  return response.data;
};

export const voidTransaction = async (authToken, transaction_id) => {
  try {
    const response = await axios.post(
      `${PAYMOB_API_URL}/acceptance/void_refund/void`,
      {
        auth_token: authToken,
        transaction_id: transaction_id,
      }
    );
  } catch (error) {
    // console.log("error", error.message, error.response && error.response.data);
  }
  // console.log("response", response.data);
  return response.data;
};
