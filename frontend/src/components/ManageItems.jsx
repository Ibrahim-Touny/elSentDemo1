import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteSingleAuctionById,
  getSellerAuction,
  reset,
  getAllAuctions,
} from "../store/auction/auctionSlice";
import { FaEye } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
import Loading from "./Loading";
import Pagination from "./Pagination";

const ManageItems = () => {
  const dispatch = useDispatch();
  const { sellerAuction, isLoading, isError, message, auction } = useSelector(
    (state) => state.auction
  );
  //// console.log("elements", sellerAuction, isLoading, isError, message, auction);

  // Fetch auctions when the component mounts
  useEffect(() => {
    dispatch(getAllAuctions());
  }, [dispatch]);

  // Handle delete action
  const handleDeleteAuction = async (id) => {
    await dispatch(deleteSingleAuctionById(id)).then(() => {
      toast.success("Item deleted.", {
        autoClose: 500,
      });
    });
    dispatch(getAllAuctions());
  };

  // Pagination part
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(6);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = auction?.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage(currentPage - 1);
  const nextPage = () => setCurrentPage(currentPage + 1);

  // Render the loading, error or auction data
  if (isLoading) {
    return (
      <div className="text-center">
        <Loading width="sidebar" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500">{message}</div>;
  }

  return (
    <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl ">
      <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5 ">
        Manage Items
      </h2>
      {/* console.log("alooo", auction)*/}
      <div className="overflow-auto px-4 bg-theme-bg2 rounded-2xl border border-border-info-color">
        <table className="text-left whitespace-nowrap w-full border-separate border-spacing-x-0 border-spacing-y-4">
          <thead className="table-header-group">
            <tr className="table-row bg-theme-color [&_th]:table-cell [&_th]:pl-5 [&_th]:pr-3 [&_th]:py-3">
              <th className="rounded-l-lg ">Product</th>
              <th>Category</th>
              <th>Bids</th>
              <th>Status</th>
              <th>Your Bid</th>
              <th>Winner</th>
              <th className="rounded-r-lg">Action</th>
            </tr>
          </thead>

          <tbody className="table-row-group">
            {auction?.length === 0 ? (
              <tr className="table-row bg-theme-bg">
                <td
                  colSpan="7"
                  className="text-center m-2 w-full p-10 h-[400px]"
                >
                  No Item
                </td>
              </tr>
            ) : (
              currentItems?.map((auction) => (
                <tr
                  key={auction?._id}
                  className="table-row bg-theme-bg [&_td]:table-cell [&_td]:pl-5 [&_td]:pr-3 [&_td]:py-3"
                >
                  <td className="rounded-l-lg">
                    <div className="flex items-center gap-2">
                      <img
                        src={auction?.images[0] || auction?.image}
                        alt="auction image"
                        className="w-[50px] h-[50px] rounded-full"
                      />
                      <span className="pr-10">{auction?.name}</span>
                    </div>
                  </td>
                  <td>
                    <span>{auction?.category?.name || "---"}</span>
                  </td>
                  <td>
                    <span>{auction?.bids?.length}</span>
                  </td>
                  <td className="capitalize">
                    <span className="px-3 py-1 rounded-full text-sm border bg-theme-bg2 border-border-info-color">
                      {auction?.status}
                    </span>
                  </td>
                  <td>
                    <span>{auction?.startingPrice}</span>
                  </td>
                  <td>
                    <span>{auction?.winner?.bidder?.fullName || "----"}</span>
                  </td>
                  <td className="link:mr-2 capitalize rounded-r-lg">
                    <Link
                      className="text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color  px-2 py-[5px] transition-all"
                      to={`/single-auction-detail/${auction?._id}`}
                    >
                      <FaEye size={16} className="inline mt-[-2px]" />
                    </Link>
                    {
                      <>
                        <Link
                          className="text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color  px-2 py-[5px] transition-all"
                          to={`/edit-auction/${auction?._id}`}
                        >
                          <FaRegEdit size={16} className="inline mt-[-3px]" />
                        </Link>
                      </>
                    }

                    <button
                      className="text-color-danger hover:text-white hover:bg-color-danger rounded-lg border-2 border-color-danger  px-[6px] py-[3px] transition-all"
                      onClick={() => handleDeleteAuction(auction?._id)}
                    >
                      <MdDeleteForever
                        size={20}
                        className=" inline mt-[-3px]"
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {auction?.length > 0 && (
        <Pagination
          totalPosts={auction?.length}
          postsPerPage={itemsPerPage}
          paginate={paginate}
          currentPage={currentPage}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      )}
    </div>
  );
};

export default ManageItems;
