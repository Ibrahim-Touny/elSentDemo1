import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: { type: 
        mongoose.Schema.Types.ObjectId, ref: "User" , required: true },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true
        }
        
       
    ],
});


const Cart = mongoose.model("Cart", cartSchema);
export default Cart;