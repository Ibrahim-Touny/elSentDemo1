import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import metalsService from "./metalsService";

export const getAllMetals = createAsyncThunk("metals/getAllMetals", async (_, thunkAPI) => {
    try {
        const response = await metalsService.getAllMetals();
        //// console.log('API Response:', response);
        return response;
    } catch (error) {
        const message = (error.response && error.response.data.message) || error.message;
        //console.error('Error in thunk:', message);
        return thunkAPI.rejectWithValue({ message, isError: true });
    }
});

const initialState = {
    metals: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
};

const metalsSlice = createSlice({
    name:"metal",
    initialState,
    reducers:{
        reset:(state)=>{
            state.isError=false;
            state.isSuccess=false;
            state.isLoading=false;
            state.message="";
        }
    },
    extraReducers:(builder) =>{
        builder
        .addCase(getAllMetals.pending,(state)=>{
            state.isLoading=true;
            state.isError=false;
            state.isSuccess=false;
            state.message="";
        })
        .addCase(getAllMetals.fulfilled,(state,action)=>{
            state.isLoading=false;
            state.isSuccess=true;
            state.isError=false;
            state.metals=action.payload;
            state.message="";
        })
        .addCase(getAllMetals.rejected,(state,action)=>{
            state.isLoading=false;
            state.isError=true;
            state.isSuccess=false;
            state.message=action.payload.message;
        })
    }
});

export const { reset } = metalsSlice.actions;
export default metalsSlice.reducer;