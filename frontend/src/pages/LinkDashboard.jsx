// AdminPanel.js

import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminPanel = () => {
  const [link, setLink] = useState("");

  const updateLink = async () => {
    //// console.log("ss", link);
    try {
      await axios.put("http://localhost:8000/api/v1/live", { link });
      toast.success("Live stream link updated successfully!");
      setLink(""); // Clear the input field after success
    } catch (error) {
      //console.error("Error updating live link:", error);
      toast.error("Failed to update the live stream link. Please try again.");
    }
  };

  return (
    <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl">
      <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
        Admin Panel
      </h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter live stream link"
          className="inputs:outline-none inputs:px-3 inputs:py-4 inputs:rounded-xl inputs:bg-theme-bg2 inputs:border inputs:border-border-info-color focus:inputs:border-theme-color select:border select:border-border-info-color inputs:placeholder-body-text-color transition-all"
        />
        <button
          onClick={updateLink}
          className="text-white bg-color-secondary p-2 rounded-xl hover:bg-[#917E62] transition-all"
        >
          Update Link
        </button>
      </div>

      {/* Toastify Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminPanel;
