import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { getSingleAuctionById } from "../store/auction/auctionSlice";

const HoldAmount = () => {
  const { id } = useParams(); // Auction ID from the URL
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { singleAuction, isLoading, isError } = useSelector(
    (state) => state.auction
  );
  // Fetch auction data based on the auction ID
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        dispatch(getSingleAuctionById(id));
        setAuction(singleAuction);
      } catch (error) {
        console.error("Error fetching auction details:", error);
        toast.error("Error fetching auction details.");
      }
    };

    fetchAuction();
  }, [id]);

  // Handle the "Hold Amount" request
  const handleHoldAmount = async () => {
    if (!auction) return;

    try {
      console.log("first");
      const response = await axios.post(
        "http://localhost:8000/api/v1/paymob/hold",
        { auction: singleAuction } // Send the whole auction object
      );
      // Check if the response was successful
      if (response.status === 200) {
        toast.success("Amount has been held successfully!");
        // navigate("/some-success-page"); // Navigate to a success page
        window.location.href = response.data.link;
      }
    } catch (error) {
      console.error("Error holding the amount:", error);
      toast.error("Failed to hold amount. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading auction details...</div>;
  }

  if (!auction) {
    return <div className="text-white">Auction not found</div>;
  }

  return (
    <div className="auction-details-container text-white">
      <h2>{auction.name}</h2>
      <p>{auction.description}</p>
      <p>Starting Price: SAR {auction.startingPrice}</p>
      {/* Add other auction details you want to display here */}

      <button
        onClick={handleHoldAmount}
        className="hold-amount-button bg-color-primary py-2 px-4 rounded-lg text-white"
      >
        Hold Amount
      </button>
    </div>
  );
};

export default HoldAmount;
