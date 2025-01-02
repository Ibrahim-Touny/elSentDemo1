import { Link } from "react-router-dom";
import CountDownTimer from "../components/CountDownTimer";
import { useState } from "react";
import { BsCurrencyDollar } from "react-icons/bs";
import socket from "../socket";

// eslint-disable-next-line react/prop-types
const SingleAuction = ({
  name,
  startingPrice,
  image,
  endTime,
  startTime,
  sellerId,
  id,
  status,
}) => {
  const [statusData, setStatusData] = useState(status);

  socket.on("setStatus", async () => {
    await setStatusData("over");
  });

  const logInUser = JSON.parse(localStorage.getItem("user"));
  //// console.log("data", id);

  return (
    <div className="h-full justify-between bg-theme-bg rounded-lg flex flex-col p-3 text-white">
      <div>
        <div className="w-full rounded-md relative bg-white overflow-hidden">
          <img
            className="w-full sm:h-[300px] rounded-md object-contain hover:scale-105 transition-all duration-300"
            src={image}
            alt="item image"
          />
          <div className="absolute bottom-3 right-3 border-[0.5px] border-color-primary border-solid rounded-full py-1 px-3 text-sm bg-gray-950 bg-opacity-[0.8]">
            <CountDownTimer
              startTime={startTime}
              endTime={endTime}
              status={status}
              id={id}
            />
          </div>
        </div>
        {/* show the winner of auction */}
        {statusData === "over" ? (
          <div className="flex justify-between item-center my-2 border-t border-border-info-color">
            <Link
              to={`/single-auction-detail/${id}`}
              className="bg-theme-color hover:bg-color-danger text-white text-sm font-bold rounded-md my-auto py-2 w-full text-center no-underline mt-3"
            >
              View
            </Link>
          </div>
        ) : (
          <div className="flex justify-between item-center my-2 border-t border-border-info-color py-1">
            <div className="flex flex-row">
              <p className="text-[20px]">{name}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-[12px]">Current Bid</p>
              <p className="mt-2">SAR {startingPrice}</p>
            </div>
            <Link
              to={`/single-auction-detail/${id}`}
              className={`flex items-center gap-1 text-white text-sm font-bold rounded-md my-auto px-3 py-2 text-center no-underline ${
                sellerId === logInUser?._id
                  ? "bg-theme-bg2 text-body-text-color border border-border-info-color"
                  : "bg-color-primary border cursor-pointer border-border-info-color hover:bg-color-danger transition-all"
              }`}
            >
              <BsCurrencyDollar
                size={18}
                strokeWidth={0.4}
                className="mt-[-2px]"
              />
              <span>Place Bid</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleAuction;
