import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getSingleAuctionById } from "../store/auction/auctionSlice";
import { getAllUsers } from "../store/user/userSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../components/Loading";
import axios from "axios";
import { useParams } from "react-router-dom";

const AuctionUsers = ({ match }) => {
  const dispatch = useDispatch();
  const [usersInAuction, setUsersInAuction] = useState([]);
  const { singleAuction, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auction
  );
  const { allUser } = useSelector((state) => state.user);
  const params = useParams();
  //   const [users, setUsers] = useState([]);
  const auctionId = params.id; // Fetch the auction ID from the URL params

  useEffect(() => {
    dispatch(getSingleAuctionById(auctionId)); // Fetch auction by ID
    dispatch(getAllUsers()); // Fetch all users
  }, [dispatch, auctionId]);
  //   // console.log("users", singleAuction);
  useEffect(() => {
    if (isSuccess) {
      // Filter users who are in the current singleAuction
      //   // console.log("user", singleAuction.users);
      //   // console.log("users", allUser);
      const filteredUsers = allUser.filter((user) =>
        singleAuction.users?.some(
          (auctionUser) => auctionUser.user_id == user._id
        )
      );
      setUsersInAuction(filteredUsers);
      //   // console.log("filtered users", filteredUsers);
    } else if (isError) {
      toast.error(message);
    }
  }, [singleAuction, allUser, isSuccess, isError, message]);

  const handleRefund = async (userId) => {
    try {
      await axios.post("http://localhost:8000/api/v1/paymob/refund", {
        auction: singleAuction,
      });
      toast.success("Refund processed successfully");
    } catch (error) {
      toast.error("Refund failed. Please try again.");
      // console.log("error in refund", error.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-start mb-5">
      <div className="flex w-full items-center justify-center">
        <h2 className="flex text-2xl font-bold text-white my-2">
          Users in Auction {singleAuction?.name}
        </h2>
      </div>

      <div className="flex flex-col min-h-screen w-full bg-body-bg text-[#7386a8]">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 max-w-[1400px] mx-auto">
            {usersInAuction.length > 0 ? (
              usersInAuction.map((user, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg shadow-lg bg-white flex flex-col items-center"
                >
                  <img
                    src={user.profilePicture}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full"
                  />
                  <h3 className="text-lg font-semibold mt-2">
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <button
                    onClick={() => handleRefund(user._id)}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                  >
                    Refund
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center w-full text-gray-500">
                No users found in this auction.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionUsers;
