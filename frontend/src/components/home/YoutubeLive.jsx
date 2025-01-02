import React, { useState, useEffect } from "react";
import axios from "axios";

const YoutubeLive = () => {
  const [liveStreamLink, setLiveStreamLink] = useState(""); // State to store live stream link
  const [isLiveAvailable, setIsLiveAvailable] = useState(true); // State to track if live is available

  useEffect(() => {
    // Fetch live stream link from backend when the component mounts
    axios
      .get("http://localhost:8000/api/v1/live")
      .then((response) => {
        const link = response.data.link.link;
        //// console.log(link);
        if (link) {
          setLiveStreamLink(link); // If link exists, set it to state
          setIsLiveAvailable(true); // Mark live as available
        } else {
          setIsLiveAvailable(false); // If no link, show 'Not available'
        }
      })
      .catch((error) => {
        //console.error("Error fetching live stream link:", error);
        setIsLiveAvailable(false); // In case of error, mark as not available
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-5">
        Live Stream Auction Awarding
      </h2>
      <div className="flex justify-center">
        {isLiveAvailable ? (
          <iframe
            width="914"
            height="514"
            src={liveStreamLink}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="text-white">Live show is not available.</div>
        )}
      </div>
    </div>
  );
};

export default YoutubeLive;
