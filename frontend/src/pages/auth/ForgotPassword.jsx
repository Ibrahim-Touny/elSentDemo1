import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { forgotPasswordSendMail, reset } from "../../store/auth/authSlice";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isSuccess, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess) {
      toast.success(message);
      dispatch(reset());
      navigate("/login")
    }
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }

    return () => {
      dispatch(reset());
    };
  }, [isSuccess, isError]);

  const handlePasswordReset = (e) => {
    e.preventDefault();
    //// console.log(email);
    if (email === "") {
      toast.error("Email is required");
      return false;
    }
    dispatch(forgotPasswordSendMail({ email }));
  
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-theme-bg2 text-[#7386a8]">
      <div className="flex w-[90%] flex-col items-center rounded-xl bg-body-bg py-8 sm:w-2/5 sm:px-6">
        <h1 className="text-3xl font-bold text-white">
        <span className="uppercase text-theme-color">M</span>z
        <span className="uppercase text-theme-color">B</span>id
        </h1>
        <p className="m-2 text-xl text-theme-color">Reset your account password</p>
        <p className="my-3 h-[1px] w-[80%] bg-[#747d9340]"></p>
        <form
          className="flex w-[90%] flex-col sm:w-[90%]"
          onSubmit={handlePasswordReset}
        >
          <label className="my-1 text-lg text-body-text-color">Email Address</label>
          <input
            type="email"
            placeholder="Your Email"
            className="focus:border-1 rounded text-white border-[1px] focus:border-[#00A3FF]  border-none focus:border-1 focus:border-solid bg-border-info-color px-5 py-3 outline-none  mb-2 placeholder-body-text-color"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="my-4 font-Roboto outline-none border-none w-full rounded bg-theme-bg px-4 py-3 font-bold hover:bg-color-danger  text-[#ffffff]"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
