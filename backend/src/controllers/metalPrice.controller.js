import axios from 'axios';
import MetalPrice from '../models/metalPrice.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

const fetchAndStoreMetalPrices = asyncHandler(async (req, res, next) => {
  try {
    const response = await axios.get('https://api.metalpriceapi.com/v1/latest', {
      params: {
        api_key: "40d6b3b27efd11453d8d082532bb8863",
        base: 'SAR',
        currencies: 'XAU,XAG,XPT,XPD'
      }
    });

    // console.log('API response:', response.data);

    const prices = response.data.rates;
    if (!prices) {
      throw new Error('No rates found in the response');
    }

    const metalMapping = {
      SARXAG: 'Silver',
      SARXAU: 'Gold',
      SARXPD: 'Palladium',
      SARXPT: 'Platinum'
    };

    for (const metalCode of Object.keys(metalMapping)) {
      const priceInOunce = prices[metalCode];
      if (priceInOunce) {
        const formattedPrice = Number((priceInOunce / 31.1035).toFixed(2));

        await MetalPrice.findOneAndUpdate(
          { metal: metalMapping[metalCode] },
          { price: formattedPrice, date: new Date() },
          { upsert: true }
        );
      } else {
        console.warn(`Price for ${metalCode} not found in response.`);
      }
    }

    if (res) {
      res.status(200).json(new ApiResponse(200, 'Metal prices fetched and stored successfully'));
    }
  } catch (error) {
    console.error('Error fetching and storing metal prices:', error);
    if (res) {
      res.status(500).json(new ApiResponse(500, 'Error fetching and storing metal prices'));
    }
    if (next) {
      next(error);
    }
  }
});

const fetchAndStoreMetalPricesCron = async () => {
  try {
    // console.log('Cron job started: Fetching metal prices...');
    await fetchAndStoreMetalPrices();
    // console.log('Cron job completed: Metal prices fetched and stored.');
  } catch (error) {
    console.error('Error in cron job:', error);
  }
};

const getAllMetalPrices = asyncHandler(async (req, res) => {
  try {
    const metalPrices = await MetalPrice.find({});

    if (!metalPrices) {
      return res.status(404).json(new ApiResponse(404, 'Metal prices not found'));
    }

    return res.status(200).json(new ApiResponse(200, 'Metal prices found', metalPrices));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, error?.message || 'Internal server error'));
  }
});

export { fetchAndStoreMetalPrices, fetchAndStoreMetalPricesCron, getAllMetalPrices };
