import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllVouchers, disableAllVouchers } from "../../store/voucher/voucherSlice";

const Giveaway = () => {
  //// console.log('Trying...');
  const { vouchers } = useSelector((state) => state.voucher);
  const dispatch = useDispatch();

  //// console.log('Dispatch function:', dispatch);
  //// console.log('Vouchers state:', vouchers);

  useEffect(() => {
    //// console.log("useEffect triggered");
    dispatch(getAllVouchers());
  }, [dispatch]);

  //// console.log('Vouchers after useEffect:', vouchers);

  const [winner, setWinner] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  // Function to choose a random winner
  const chooseWinner = () => {
    setIsRolling(true);

    // Start the animation for the users to roll across
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * vouchers.data.length);
      setWinner(vouchers.data[randomIndex]);
      setIsRolling(false);
    }, 15000); // Stop the rolling after 15 seconds
  };

  const handleDisableAllVouchers = async () => {
      //// console.log("button click , , ...........");
      await dispatch(disableAllVouchers());
    };

  return (
    <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl">
      <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
        Giveaway
      </h2>
      <div className="bg-brown-500 p-5 rounded-lg">
        <div className="text-white overflow-hidden relative w-full">
          {/* User List */}
          <div
            className={`flex transition-transform duration-[500ms] ${
              isRolling ? "animate-roll" : ""
            }`}
          >
            {vouchers?.data?.map((voucher, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-2 p-4 border-2 border-border-info-color rounded-lg"
              >
                <img
                  src={voucher.userPhoto}
                  alt={voucher.userName}
                  className="w-32 h-32 object-cover rounded-full mb-2"
                />
                <p className="text-center">{voucher.userName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Choose Winner Button */}
        <div className="mt-5 flex justify-center">
          <button
            className="px-6 py-3 bg-theme-color text-white rounded-lg hover:bg-theme-color/80 transition-all"
            onClick={chooseWinner}
            disabled={isRolling}
          >
            {isRolling ? "Rolling..." : "Choose Winner"}
          </button>
        </div>

        {/* Disable All Vouchers Button */}
        <div className="mt-5 flex justify-center">
          <button
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-600/80 transition-all"
            onClick={handleDisableAllVouchers}
          >
            Disable All Vouchers
          </button>
        </div>

        {/* Display Winner */}
        {winner && (
          <div className="mt-5 text-center text-white font-bold text-xl">
            <p>Winner: {winner.userName} - {winner.userEmail}</p>
            <img
              src={winner.userPhoto}
              alt={winner.userName}
              className="w-32 h-32 object-cover rounded-full mx-auto mt-3"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Giveaway;