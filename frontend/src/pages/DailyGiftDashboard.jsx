import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { IoEyeOutline, IoTrashOutline } from "react-icons/io5";

const DailyGiftDashboard = () => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [images, setImages] = useState([]);

  // Fetch current images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/images");
        //// console.log("respones", response);
        setImages(response.data);
      } catch (error) {
        //console.error("Error fetching images:", error);
        toast.error("Failed to fetch images");
      }
    };

    fetchImages();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles) {
      toast.error("No files selected");
      return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append("images", file);
    });

    try {
      setUploadStatus("Uploading...");
      const response = await axios.post(
        "http://localhost:8000/api/v1/images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadStatus("Upload successful!");
      toast.success("Upload successful!");
      setImages((prev) => [...prev, ...response.data.uploadedImages]);
    } catch (error) {
      setUploadStatus("Upload failed");
      toast.error("Upload failed");
      //console.error(error);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/images/${imageId}`);
      setImages((prev) => prev.filter((img) => img._id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error) {
      //console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl">
      <h2 className="text-white text-center text-3xl my-12 font-bold border-b border-border-info-color pb-3 mb-5">
        Daily Gift Dashboard
      </h2>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="bg-theme-bg2 p-3 rounded-lg flex flex-col items-center"
          >
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => window.open(image.url, "_blank")}
                className="text-white bg-color-primary p-2 rounded-lg hover:bg-color-secondary"
              >
                <IoEyeOutline size={20} />
              </button>
              <button
                onClick={() => handleDelete(image._id)}
                className="text-white bg-color-danger p-2 rounded-lg hover:bg-red-700"
              >
                <IoTrashOutline size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      <div className="flex flex-col items-center gap-5">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="text-white bg-black bg-opacity-50 p-3 rounded-lg cursor-pointer focus:outline-none"
        />
        <button
          onClick={handleUpload}
          className="px-6 py-2 bg-color-primary text-white rounded-lg hover:bg-color-secondary transition-all"
        >
          Upload
        </button>
        <p
          className={`mt-2 text-body-text-color ${
            uploadStatus === "Uploading..."
              ? "text-yellow-500"
              : uploadStatus === "Upload successful!"
                ? "text-green-500"
                : "text-red-500"
          }`}
        >
          {uploadStatus}
        </p>
      </div>
    </div>
  );
};

export default DailyGiftDashboard;
