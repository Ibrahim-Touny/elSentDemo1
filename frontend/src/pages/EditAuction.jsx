import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSingleAuctionById,
  reset,
  updateSingleAuction,
} from "../store/auction/auctionSlice.js";
import { getAllCategories } from "../store/category/categorySlice.js";
import { getAllCities } from "../store/city/citySlice.js";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditAuction = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { singleAuction, isLoading, message, isError, isSuccess } = useSelector(
    (state) => state.auction
  );
  const [singleAuctionData, setSingleAuctionData] = useState(singleAuction);
  const [imgUrl, setImgUrl] = useState(singleAuction?.image || "");
  const imgRef = useRef(null);
  const { categories } = useSelector((state) => state.category);
  const { cities } = useSelector((state) => state.city);

  useEffect(() => {
    dispatch(getSingleAuctionById(id));
  }, [id]);

  useEffect(() => {
    if (singleAuction) {
      setSingleAuctionData(singleAuction);
    }
  }, [singleAuction]);

  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getAllCities());
  }, []);

  useEffect(() => {
    if (isSuccess && isError) {
      toast.error(message, {
        autoClose: 500,
      });
      dispatch(reset());
    } else if (isSuccess && isError === undefined) {
      toast.success(message, {
        autoClose: 500,
      });
      dispatch(reset());

      setFormData({
        name: "",
        category: "",
        startTime: "",
        endTime: "",
        location: "",
        startingPrice: "",
        description: "",
        materialUsed: "",
      });
      setImgUrl("");
    }
    dispatch(reset());
  }, [isSuccess, isError, isLoading]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "",
    location: "",
    startingPrice: 0,
    imgUrl: "",
    materialUsed: "",
  });

  useEffect(() => {
    setFormData({
      name: singleAuctionData?.name,
      description: singleAuctionData?.description || "",
      startTime: singleAuctionData?.startTime
        ? new Date(singleAuctionData?.startTime).toISOString().slice(0, 16)
        : "",
      endTime: singleAuctionData?.endTime
        ? new Date(singleAuctionData?.endTime).toISOString().slice(0, 16)
        : "",
      category: singleAuctionData?.category?._id || "",
      location: singleAuctionData?.location?._id || "",
      startingPrice: parseFloat(singleAuctionData?.startingPrice) || 0,
      materialUsed: singleAuctionData?.materialUsed || "",
    });
    setImgUrl(singleAuctionData?.image || "");
  }, [singleAuctionData]);

  const handleProductUpload = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("startingPrice", formData.startingPrice);
    data.append("category", formData.category);
    data.append("startTime", formData.startTime);
    data.append("endTime", formData.endTime);
    data.append("location", formData.location);
    data.append("description", formData.description);
    data.append("materialUsed", formData.materialUsed);

    if (imgRef.current.files[0]) {
      data.append("image", imgRef.current.files[0]);
    } else {
      data.append("image", imgUrl);
    }

    dispatch(updateSingleAuction({ data: data, id: id }));
    dispatch(reset());
  };

  return (
    <div>
      <form
        className="flex flex-col lg:flex-row gap-8 justify-center md:w-[80%] lg:w-[100%] m-auto px-4 py-20"
        onSubmit={handleProductUpload}
      >
        <div className="text-white lg:w-[22%] lg:min-w-[350px] ">
          <h1 className="text-white text-2xl font-bold mb-4">Upload Item</h1>

          {imgUrl ? (
            <img
              src={imgUrl}
              alt="upload img"
              onClick={() => imgRef.current.click()}
              className="w-full h-80 
                    rounded-lg border-2 border-border-info-color p-2 object-contain cursor-pointer"
            />
          ) : (
            <div
              onClick={() => imgRef.current.click()}
              className="w-full h-80
              rounded-xl border-2 border-dashed border-border-info-color 
                    flex items-center justify-center
                    cursor-pointer
                    "
            >
              <p className="text-white">Click to upload</p>
            </div>
          )}

          <input
            type="file"
            className="hidden"
            onChange={(e) => setImgUrl(URL.createObjectURL(e.target.files[0]))}
            ref={imgRef}
          />
        </div>

        <div className="flex flex-col gap-4 lg:w-[50%] inputs:outline-none p-8 inputs:px-4 inputs:py-3 inputs:rounded-xl select:px-4 select:py-3 select:rounded-xl select:cursor-pointer border border-border-info-color inputs:bg-theme-bg inputs:border inputs:border-border-info-color focus:inputs:border-theme-color select:border select:border-border-info-color inputs:placeholder-body-text-color text-slate-300 rounded-2xl [&_label]:mb-2 [&_label]:text-body-text-color [&_*]:transition-all">
          <div className="grid">
            <label htmlFor="product_name" className="text-white  mb-1">
              Product Name
            </label>
            <input
              required
              id="product_name"
              type="text"
              className="w-full py-3 mt-2 outline-none border-none rounded-lg"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              value={formData.name}
            />
          </div>

          <div className="grid">
            <label htmlFor="category" className="text-white">
              Category
            </label>
            <select
              required
              id="category"
              className="outline-none h-[50px] bg-theme-bg rounded-xl px-3 py-4 cursor-pointer focus:border-theme-color"
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              value={formData.category}
            >
              {categories.data &&
                categories.data.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mlg:grid-cols-1">
            <div className="grid">
              <label htmlFor="start_time" className="text-white">
                Start Time
              </label>
              <input
                required
                id="startTime"
                type="datetime-local"
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                value={formData.startTime}
              />
            </div>
            <div className="grid">
              <label htmlFor="end_time" className="text-white">
                End Time
              </label>
              <input
                required
                id="endTime"
                type="datetime-local"
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                value={formData.endTime}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mlg:grid-cols-1">
            <div className="grid">
              <label htmlFor="starting_price" className="text-white">
                Starting Price
              </label>
              <input
                required
                id="starting_price"
                type="number"
                onChange={(e) =>
                  setFormData({ ...formData, startingPrice: e.target.value })
                }
                onWheel={(e) => e.target.blur()}
                value={formData.startingPrice}
              />
            </div>
            <div className="grid">
              <label htmlFor="location" className="text-white">
                Area
              </label>
              <select
                required
                id="location"
                className="outline-none h-[50px] bg-theme-bg cursor-pointer focus:border-theme-color"
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                value={formData.location}
              >
                {cities.data &&
                  cities.data.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid">
            <label htmlFor="description">Description</label>
            <textarea
              required
              id="description"
              rows="7"
              className="outline-none bg-theme-bg rounded-xl px-3 py-4 border border-border-info-color focus:border-theme-color placeholder-body-text-color"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              value={formData.description}
            />
          </div>
          <div className="grid">
            <label htmlFor="material_used" className="text-white">
              Material Used
            </label>
            <input
              required
              id="material_used"
              type="text"
              className="w-full py-3 mt-2 outline-none border-none rounded-lg"
              onChange={(e) =>
                setFormData({ ...formData, materialUsed: e.target.value })
              }
              value={formData.materialUsed}
            />
          </div>

          <button
            type="submit"
            className="px-3 py-4 rounded-xl text-white cursor-pointer font-bold tracking-wide w-full bg-theme-color hover:bg-color-danger"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAuction;
