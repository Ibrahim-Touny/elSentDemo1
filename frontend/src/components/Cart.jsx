import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCartItems, reset } from "../store/cart/cartSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
const Cart = () => {
  const [cartItem, setCartItem] = useState();
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Add the useNavigate hook

  //// console.log(cartItem);

  useEffect(() => {
    dispatch(getCartItems());
  }, []);

  useEffect(() => {
    if (cartItems) {
      setCartItem(cartItems);
    }
  }, [cartItems]);

  const handlePayment = async (product) => {
    try {
      const requestData = {
        amount_cents: product.startingPrice * 100, // Convert price to cents
      };

      const response = await axios.post(
        "http://localhost:8000/api/v1/paymob", // Replace with your actual backend endpoint
        requestData,
        {
          withCredentials: true, // If cookies or auth are required
        }
      );

      if (response.data && response.data.payment_link) {
        toast.success("Redirecting to payment...");
        window.open(response.data.payment_link, "_blank"); // Open the payment link in a new tab
      } else {
        toast.error("Failed to get the payment link.");
      }
    } catch (error) {
      //console.error("Payment error:", error);
      toast.error("An error occurred while processing the payment.");
    }
  };

  return (
    <div className=" px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl ">
      <h2 className=" text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5 ">
        Your Cart
      </h2>
      {cartItem?.map((item) => (
        <div
          key={item._id}
          className="flex flex-col gap-2 border rounded-md p-4 border-border-info-color"
        >
          {item.products.map((product) => (
            <div
              key={product._id}
              className="flex flex-col justify-between gap-5 p-4 md:flex-row items-start md:items-center border-b border-border-info-color"
            >
              <div className="flex gap-4">
                <img
                  className="w-[85px] h-[85px] rounded-md"
                  src={product.images[0]}
                  alt={product.name}
                />
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl font-bold ">{product.name}</h3>
                  <p>{product.startingPrice}SAR</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Link
                  to={`/single-auction-detail/${product._id}`}
                  className="text-theme-color p-3 hover:bg-theme-bg2 hover border border-border-info-color rounded-lg "
                >
                  View Product
                </Link>
                <button
                  className="bg-theme-color  p-3 rounded-lg text-white font-bold"
                  onClick={() => handlePayment(product)}
                >
                  Go to Checkout
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Cart;
