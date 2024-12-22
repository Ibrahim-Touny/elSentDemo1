import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String , required: true},
  category: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory", required: true},
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" },
  status: {
    type: String
  },
  location: {type:mongoose.Schema.Types.ObjectId, ref:"City" },
  image:{type:String,required:true},
  startingPrice: { type: Number, required: true },
  paid:{
    type:Boolean,
    default:false
  },
  height: { type: Number },
  width: { type: Number },
  materialUsed: { type: String },
  weight: { type: Number },
}, 
{
  timestamps: true,
});

const Auction = mongoose.model("Auction", auctionSchema);


export default Auction;