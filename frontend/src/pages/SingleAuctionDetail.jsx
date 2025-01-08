import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllAuctions, reset } from "../store/auction/auctionSlice";
import CountDownTimer from "../components/CountDownTimer";
import BidCard from "../components/BidCard";
import { placeABid } from "../store/bid/bidSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendNewBidNotification } from "../store/notification/notificationSlice";
import socket from "../socket";
import Loading from "../components/Loading";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import axios from "axios";

const SingleAuctionDetail = ({ noPadding }) => {
  const [newBidAmount, setNewBidAmount] = useState("");
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const { user } = useSelector((state) => state.auth);
  const logInUser = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("description");
  const params = useParams();
  const dispatch = useDispatch();
  const { auction, isLoading, error } = useSelector((state) => state.auction);
  const { bids } = useSelector((state) => state.bid);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [singleAuctionData, setSingleAuctionData] = useState();
  const [auctionWinnerDetailData, setAuctionWinnerDetailData] = useState();
  const [bidsData, setBidsData] = useState([]);
  const [singleAuction, setSingleAuction] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleHoldAmount = async () => {
    if (!auction) return;

    try {
      console.log("first");
      const response = await axios.post(
        "http://localhost:8000/api/v1/paymob/hold",
        { auction: singleAuction }, // Send the whole auction object
        { withCredentials: true }
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
  useEffect(() => {
    dispatch(getAllAuctions());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (auction) {
      const foundAuction = auction.find(
        (oneAuction) => oneAuction._id === params.id
      );
      setSingleAuction(foundAuction);
      setSingleAuctionData(foundAuction);
    }
  }, [auction, params.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const auctionStartTime = new Date(singleAuction?.startTime).getTime();
      const auctionEndTime = new Date(singleAuction?.endTime).getTime();

      if (
        currentTime >= auctionStartTime &&
        currentTime <= auctionEndTime &&
        !auctionStarted
      ) {
        setAuctionStarted(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [singleAuction?.startTime]);

  socket.on("winnerSelected", async (data) => {
    setAuctionStarted(false);
    setAuctionWinnerDetailData(data);
  });

  const handleWinner = () => {
    socket.emit("selectWinner", params?.id);
  };

  const confirmBid = () => {
    const { fullName, email, phone, address } = user;

    if (!fullName || !email || !phone || !address) {
      toast.error("Please fill all your profile fields first!");
      return false;
    } else {
      const bidData = {
        id: params.id,
        amount: Math.floor(newBidAmount),
      };

      if (Math.floor(newBidAmount) <= singleAuctionData?.startingPrice) {
        toast.info("Bid amount should be greater than the current bid");
      } else {
        dispatch(placeABid(bidData));
        setNewBidAmount("");
        socket.emit("newBid", {
          profilePicture: loggedInUser?.profilePicture,
          fullName: loggedInUser?.fullName,
          bidAmount: Math.floor(newBidAmount),
          bidTime: new Date().getTime(),
          auctionId: params.id,
        });
        dispatch(
          sendNewBidNotification({
            auctionId: params.id,
            type: "BID_PLACED",
            newBidAmount: singleAuction.startingPrice,
            fullName: loggedInUser?.fullName,
          })
        );
        toast.success("Bid placed successfully!");
        setActiveTab("bids");
      }
    }
    //refresh page
    setTimeout(() => {
      dispatch(getAllAuctions());
    }, 1000);
  };

  socket.on("newBidData", async (data) => {
    setBidsData([
      {
        _id: new Date().getTime(),
        bidder: {
          fullName: data.fullName,
          profilePicture: data.profilePicture,
        },
        bidAmount: data.bidAmount,
        bidTime: data.bidTime,
        auction: data.auctionId,
      },
      ...bidsData,
    ]);

    setSingleAuctionData((previousState) => ({
      ...previousState,
      startingPrice: data.bidAmount,
    }));
  });

  useEffect(() => {
    setBidsData(bids);
  }, [bids]);

  useEffect(() => {
    socket.on("connect", () => {});
    socket.emit("joinAuction", loggedInUser?._id);
    socket.on("newUserJoined", (data) => {});
  }, []);
  const navigate = useNavigate();
  const holdAmount = (id) => {
    navigate(`/hold-amount/${id}`);
  };

  const placeBidHandle = async (event) => {
    event.preventDefault();

    // console.log("testttttttttttttttttttttttt")
    if (user?.paymentVerified === false) {
      toast.info(
        "Please verify your payment method to place a bid. Go to settings..."
      );
    }
    let bidData = {
      id: params.id,
      amount: Math.floor(newBidAmount),
    };
    if (Math.floor(newBidAmount) <= singleAuctionData?.startingPrice) {
      toast.info("Bid amount should be greater than the current bid");
    } else if (singleAuction?.endTime < new Date().getTime() / 1000) {
      toast.info("Auction time is over");
    } else {
      dispatch(placeABid(bidData));
      setNewBidAmount("");
      socket.emit("newBid", {
        profilePicture: loggedInUser?.profilePicture,
        fullName: loggedInUser?.fullName,
        bidAmount: Math.floor(newBidAmount),
        bidTime: new Date().getTime(),
        auctionId: params.id,
      });

      await socket.emit("sendNewBidNotification", {
        auctionId: params.id,
        type: "BID_PLACED",
        newBidAmount: newBidAmount,
        fullName: loggedInUser?.fullName,
        id: loggedInUser?._id,
      });
      setActiveTab("bids");
      dispatch(
        sendNewBidNotification({
          auctionId: params.id,
          type: "BID_PLACED",
          newBidAmount: newBidAmount,
          fullName: loggedInUser?.fullName,
        })
      );
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((previousIndex) =>
      previousIndex + 1 < singleAuction?.images?.length ? previousIndex + 1 : 0
    );
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((previousIndex) =>
      previousIndex - 1 >= 0
        ? previousIndex - 1
        : singleAuction?.images?.length - 1
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!singleAuction) {
    return <div>Auction not found.</div>;
  }

  // ... (JSX from previous responses will be here)
  return (
    <>
      <div
        className={`flex place-content-between py-10 px-5 lg:py-20 lg:px-10 items-start gap-7 flex-wrap md:flex-nowrap ${noPadding ? "lg:py-0 px-0" : "p-4"}`}
        id="item01"
      >
        {/*// console.log("singleauction", singleAuction)*/}
        <div className="relative rounded-xl md:max-w-[45%] w-full">
          <img
            className="rounded-xl w-full"
            src={singleAuction?.images[currentImageIndex]}
            alt={`Product image ${currentImageIndex + 1}`}
          />
          <button
            className="absolute top-1/2 left-2 text-white bg-black bg-opacity-50 p-2 rounded-full"
            onClick={handlePreviousImage}
          >
            <FaArrowLeft />
          </button>
          <button
            className="absolute top-1/2 right-2 text-white bg-black bg-opacity-50 p-2 rounded-full"
            onClick={handleNextImage}
          >
            <FaArrowRight />{" "}
          </button>
        </div>
        <div className="w-full flex gap-4 flex-col">
          <div>
            <h2 className="text-3xl font-extrabold text-white">
              {singleAuction?.name}
            </h2>
            <div className="pt-4 flex flex-row gap-4 flex-wrap text-body-text-color capitalize">
              <a
                href="#"
                className="px-4 py-1 border rounded-full hover:bg-color-primary border-border-info-color hover:text-white transition-all"
              >
                {singleAuction?.category?.name}
              </a>
              <a
                href="#"
                className="px-4 py-1 border rounded-full hover:bg-color-primary border-border-info-color hover:text-white transition-all"
              >
                {singleAuction?.location?.name}
              </a>
            </div>
            <div className="pt-4 border-t border-border-info-color">
              <h3 className="text-heading-color font-medium">
                Product Specifications
              </h3>
              <ul className="text-body-text-color">
                {!isNaN(singleAuction.height) ? (
                  <li>Height: {singleAuction.height} cm</li>
                ) : null}
                {!isNaN(singleAuction.length) ? (
                  <li>Length: {singleAuction.length} cm</li>
                ) : null}
                {!isNaN(singleAuction.width) ? (
                  <li>Width: {singleAuction.width} cm</li>
                ) : null}
                {!isNaN(singleAuction.weight) ? (
                  <li>Weight: {singleAuction.weight} cm</li>
                ) : null}
                {singleAuction.workmanshipFee && (
                  <li>Workmanship Fee: {singleAuction.workmanshipFee} </li>
                )}
              </ul>
            </div>
            <div className="pt-4 border-t border-border-info-color">
              <div className="flex gap-4 pt-4 font-bold text-white">
                <button
                  className={`px-5 py-2 rounded-xl ${
                    activeTab === "description"
                      ? "bg-color-primary"
                      : "bg-theme-bg2 text-body-text-color"
                  }`}
                  onClick={() => setActiveTab("description")}
                >
                  Details
                </button>
                <button
                  className={`px-5 py-2 rounded-xl ${
                    activeTab === "bids"
                      ? "bg-color-primary"
                      : "bg-theme-bg2 text-body-text-color"
                  }`}
                  onClick={() => setActiveTab("bids")}
                >
                  Bids
                </button>
              </div>
            </div>
            <div>
              <div
                id="description"
                className={`pt-4 border-t border-border-info-color ${
                  activeTab === "description" ? "block" : "hidden"
                }`}
              >
                <h3 className="text-heading-color font-medium">Description</h3>
                <p className="text-body-text-color">
                  {singleAuction?.description}
                </p>
              </div>
              <div
                id="bids"
                className={`pt-4 border-t border-border-info-color max-h-[250px] overflow-y-auto ${
                  activeTab === "bids" ? "block" : "hidden"
                } no-scrollbar`}
              >
                {singleAuction?.bids?.length > 0 || bidsData.length > 0 ? (
                  singleAuction.bids?.map((bid) => (
                    <BidCard key={bid._id} bid={bid} />
                  ))
                ) : (
                  <h1 className="text-white">No bids yet</h1>
                )}
              </div>
            </div>
          </div>
          <div className="text-heading-color capitalize"></div>
          <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <h3 className="text-heading-color font-medium">
                  {singleAuction?.bids?.length > 0
                    ? "Current Bid"
                    : "Starting Price"}
                </h3>
                <p className="text-body-text-color">
                  SAR {singleAuctionData?.startingPrice}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-heading-color font-medium">Time</h3>
                <div className="text-body-text-color">
                  <CountDownTimer
                    startTime={singleAuction?.startTime}
                    endTime={singleAuction?.endTime}
                    id={singleAuction?._id}
                    Winner={handleWinner}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
              {singleAuction?.status === "over" || auctionWinnerDetailData ? (
                bidsData.length > 0 ? (
                  <div>
                    <h1 className="font-bold text-white">Winner</h1>
                    <div className="flex sm:gap-10 items-center border mt-2 justify-between md:w-[80%] py-1 px-2 md:px-5 border-theme-bg-light rounded-full">
                      <div className="flex gap-4 items-center text-white">
                        <img
                          src={
                            auctionWinnerDetailData?.bidder?.profilePicture ||
                            singleAuction?.winner?.bidder?.profilePicture
                          }
                          alt="bidder profilePicture"
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {auctionWinnerDetailData?.bidder?.fullName ||
                              singleAuction?.winner?.bidder?.fullName}
                          </span>
                          <span className="text-xs text-body-text-color">
                            {new Date(
                              auctionWinnerDetailData?.bidTime ||
                                singleAuction?.winner?.bidTime
                            ).toLocaleDateString()}{" "}
                            {""}
                            {`${new Date(
                              auctionWinnerDetailData?.bidTime ||
                                singleAuction?.winner?.bidTime
                            ).toLocaleTimeString()}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-white">
                        Bid Amount : SAR
                        {auctionWinnerDetailData?.bidAmount ||
                          singleAuction?.winner?.bidAmount}
                      </div>
                    </div>
                  </div>
                ) : (
                  <h1 className="text-white">No bids</h1>
                )
              ) : (
                auctionStarted && (
                  <form
                    className="flex justify-between items-center flex-wrap gap-4"
                    onSubmit={placeBidHandle}
                  >
                    <div className="flex flex-col gap-4 pt-4 border-t border-border-info-color">
                      {auctionStarted && (
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              className="outline-none text-slate-300 px-3 py-4 rounded-xl bg-theme-bg2 border border-border-info-color focus:border-theme-color transition-all"
                              placeholder="Enter your bid"
                              value={newBidAmount}
                              readOnly
                              required
                            />
                            <div className="flex flex-col">
                              <button
                                type="button"
                                className="bg-theme-bg2 hover:bg-theme-color text-white px-2 py-1 rounded-t-md"
                                onClick={() =>
                                  setNewBidAmount((prev) =>
                                    prev
                                      ? +prev +
                                        (singleAuction.incrementPrice
                                          ? singleAuction?.incrementPrice
                                          : 500)
                                      : singleAuction?.startingPrice
                                  )
                                }
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                className="bg-theme-bg2 hover:bg-theme-color text-white px-2 py-1 rounded-b-md"
                                onClick={() =>
                                  setNewBidAmount((prev) =>
                                    Math.max(
                                      prev
                                        ? +prev - 500
                                        : singleAuction?.startingPrice,
                                      singleAuction?.startingPrice
                                    )
                                  )
                                }
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                          {logInUser ? (
                            user?.paymentVerified ? (
                              <div className="ml-auto flex gap-2">
                                <button
                                  type="button"
                                  className="bg-color-primary py-2 px-4 rounded-lg text-white"
                                  onClick={() => confirmBid()}
                                >
                                  Confirm Bid
                                </button>
                                <button
                                  type="button"
                                  className="bg-color-primary py-2 px-4 rounded-lg text-white"
                                  // onClick={() => holdAmount(singleAuction._id)}
                                  onClick={() => handleHoldAmount()}
                                >
                                  Hold Amount
                                </button>
                              </div>
                            ) : (
                              <div className="ml-auto flex gap-2">
                                <button
                                  type="button"
                                  className="bg-color-primary py-2 px-4 rounded-lg text-white"
                                  onClick={() => confirmBid()}
                                >
                                  Confirm Bid
                                </button>
                                <button
                                  type="button"
                                  className="bg-color-primary py-2 px-4 rounded-lg text-white"
                                  // onClick={() => holdAmount(singleAuction._id)}
                                  onClick={() => handleHoldAmount()}
                                >
                                  Hold Amount
                                </button>
                              </div>
                            )
                          ) : (
                            <Link
                              to="/login"
                              className="bg-color-primary py-2 px-4 rounded-lg cursor-pointer text-white"
                            >
                              Place Bid
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </form>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleAuctionDetail;
