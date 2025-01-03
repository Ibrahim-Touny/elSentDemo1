import HeroHome from "../components/home/HeroHome";
import LiveHome from "../components/home/LiveHome";
import ProcessHome from "../components/home/ProcessHome";
import UpcommingHome from "../components/home/UpcommingHome";
import MetalPrices from "../components/home/MetalPrices";
import YoutubeLive from "../components/home/YoutubeLive";
import { register } from "swiper/element/bundle";
import Dashboard from "./Dashboard";
import DailyGifts from "../components/home/DailyGifts";
register();

const Home = () => {
  return (
    <>
      <HeroHome />
      <div className="px-5 lg:px-15 flex flex-col gap-20">
      <MetalPrices />
      <DailyGifts />
      <Dashboard />
      <YoutubeLive /> 
      <ProcessHome />
      <div className="text-white flex flex-col gap-8">
        </div>
      </div>
    </>
  );
};

export default Home;
