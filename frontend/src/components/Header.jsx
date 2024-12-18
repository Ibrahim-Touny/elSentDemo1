import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, reset } from "../store/auth/authSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoIosNotificationsOutline } from "react-icons/io";
import { BsCart3 } from "react-icons/bs";
import { FaBars, FaTimes } from "react-icons/fa";
import socket from "../socket";
import { getNotificationForUser } from "../store/notification/notificationSlice";

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false); // To track scroll state
  const [isArabic, setIsArabic] = useState(false); // Track if the website is in Arabic
  const [translations, setTranslations] = useState({
    home: "Home",
    liveAuctions: "Live Auctions",
    about: "About",
    contact: "Contact",
    privacyPolicy: "Privacy Policy",
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.notification);
  let navigate = useNavigate();

  const logInUser = JSON.parse(localStorage.getItem("user"));

  const unReadNotifications = notifications.filter(
    (notification) => notification.isRead === false
  );

  useEffect(() => {
    if (logInUser) {
      dispatch(getNotificationForUser());
    }
    socket.on("newBidNotification", (data) => {
      socket.emit("joinAuction", logInUser?._id);
      dispatch(getNotificationForUser());
    });
  }, []);

  // Scroll event to detect when the user scrolls
  const handleScroll = () => {
    if (window.scrollY > 0) {
      setScrolling(true); // Activate blur effect when scrolled
    } else {
      setScrolling(false); // Remove blur when at the top
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll); // Add event listener
    return () => {
      window.removeEventListener("scroll", handleScroll); // Cleanup on unmount
    };
  }, []);

  const logoutHandle = () => {
    dispatch(logout());
    toast.success("Logout Successfully!");
    setSidebarOpen(false);
    dispatch(reset());
    navigate("/login");
  };

  // Function to translate text
  const translateText = async (text) => {
    const response = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: "ar",
      }),
    });

    const data = await response.json();
    return data.translatedText;
  };

  // Function to handle translation to Arabic
  const handleTranslateToArabic = async () => {
    const translatedHome = await translateText("Home");
    const translatedLiveAuctions = await translateText("Live Auctions");
    const translatedAbout = await translateText("About");
    const translatedContact = await translateText("Contact");
    const translatedPrivacyPolicy = await translateText("Privacy Policy");

    setTranslations({
      home: translatedHome,
      liveAuctions: translatedLiveAuctions,
      about: translatedAbout,
      contact: translatedContact,
      privacyPolicy: translatedPrivacyPolicy,
    });

    setIsArabic(true);
  };

  // Function to reset translation back to English
  const switchToEnglish = () => {
    setTranslations({
      home: "Home",
      liveAuctions: "Live Auctions",
      about: "About",
      contact: "Contact",
      privacyPolicy: "Privacy Policy",
    });
    setIsArabic(false);
  };

  return (
    <div
      className={`sticky top-0 z-50 flex justify-between items-center px-2 sm:px-14 py-2 border-b-4 border-heading-color transition-all duration-300 ${
        scrolling ? "backdrop-blur-lg bg-dark shadow-md" : "bg-body-bg"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center px-1 z-[1]">
        <Link to="/dashboard" className="no-underline">
          <h1 className="text-3xl font-bold text-white font-Roboto">
            <span className="uppercase text-theme-color">E</span>l
            <span className="uppercase text-theme-color">S</span>ent
          </h1>
        </Link>
      </div>

      {/* Links (Home, Contact, About) */}
      <div className="hidden sm:block">
        <Link
          to="/"
          className="text-white font-Roboto text-lg mx-3 hover:text-color-primary transition-all tracking-wide"
        >
          {isArabic ? translations.home : "Home"}
        </Link>
        <Link
          to="/privacy-policy"
          className="text-white font-Roboto text-lg mx-3 hover:text-color-primary transition-all tracking-wide"
        >
          {isArabic ? translations.liveAuctions : "Live Auctions"}
        </Link>
        <Link
          to="/about-us"
          className="text-white font-Roboto text-lg mx-3 hover:text-color-primary transition-all tracking-wide"
        >
          {isArabic ? translations.about : "About"}
        </Link>
        <Link
          to="/contact-us"
          className="text-white font-Roboto text-lg mx-3 hover:text-color-primary transition-all tracking-wide"
        >
          {isArabic ? translations.contact : "Contact"}
        </Link>
        <Link
          to="/privacy-policy"
          className="text-white font-Roboto text-lg mx-3 hover:text-color-primary transition-all tracking-wide"
        >
          {isArabic ? translations.privacyPolicy : "Privacy Policy"}
        </Link>
      </div>

      {/* Translate Button */}
      <div className="flex items-center cursor-pointer z-[1]">
        <button
          onClick={isArabic ? switchToEnglish : handleTranslateToArabic}
          className="text-white font-Roboto text-lg mx-3 hover:text-color-primary transition-all tracking-wide"
        >
          {isArabic ? "Switch to English" : "Translate to Arabic"}
        </button>
        {user ? (
          <div className="flex justify-center items-center">
            <Link
              to="/user-profile/cart"
              className="text-white font-Roboto text-lg mx-3"
            >
              <BsCart3 className="text-white hover:text-theme-color transition-all" />
            </Link>
            <img
              src={user?.profilePicture}
              key={user.profilePicture}
              alt="user image"
              className="w-10 h-10 rounded-full order-2 cursor-pointer active:scale-[0.95] transition-all"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
            <Link to="/user-profile/notifications" className="mr-2 relative">
              {unReadNotifications.length > 0 ? (
                <span className="absolute right-0 top-0 w-[18px] h-[18px] flex items-center justify-center bg-theme-color rounded-full text-white text-xs font-bold">
                  {unReadNotifications.length}
                </span>
              ) : null}
              <IoIosNotificationsOutline
                size={37}
                className="text-white text-xl cursor-pointer bg-theme-bg hover:text-theme-color rounded-full p-2 transition-all"
              />
            </Link>
            <Link
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="text-white font-Roboto sm:hidden text-lg mx-3 order-3"
            >
              {navbarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </Link>
          </div>
        ) : (
          <div>
            <Link
              to="/register"
              className="bg-color no-underline font-Roboto text-base hover:text-hover transition-all duration-150 text-white py-1 sm:py-2 sm:px-3 px-2 rounded-md text-md font-semibold"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="bg-color-secondary no-underline font-Roboto text-base hover:bg-hover transition-all duration-150 text-white py-1 sm:py-2 sm:px-3 px-2 rounded-md text-md font-semibold"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;