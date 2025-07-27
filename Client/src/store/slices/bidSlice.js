// import { createSlice } from "@reduxjs/toolkit";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { getAuctionDetail } from "./auctionSlice";

// const bidSlice = createSlice({
//   name: "bid",
//   initialState: {
//     loading: false,
//   },
//   reducers: {
//     bidRequest(state, action) {
//       state.loading = true;
//     },
//     bidSuccess(state, action) {
//       state.loading = false;
//     },
//     bidFailed(state, action) {
//       state.loading = false;
//     },
//   },
// });

// export const placeBid = (id, data) => async (dispatch) => {
//   dispatch(bidSlice.actions.bidRequest());
//   try {
//     const response = await axios.post(`http://localhost:5000/api/v1/bid/place/${id}`, data, {
//       withCredentials: true,
//       headers: { "Content-Type": "application/json" },
//     });
//     dispatch(bidSlice.actions.bidSuccess());
//     toast.success(response.data.message);
//     dispatch(getAuctionDetail(id))
//   } catch (error) {
//     dispatch(bidSlice.actions.bidFailed());
//     toast.error(error.response.data.message);
//   }
// };

// export default bidSlice.reducer









import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuctionDetail } from "./auctionSlice";

const bidSlice = createSlice({
  name: "bid",
  initialState: {
    loading: false,
  },
  reducers: {
    bidRequest(state) {
      state.loading = true;
    },
    bidSuccess(state) {
      state.loading = false;
    },
    bidFailed(state) {
      state.loading = false;
    },
  },
});

// Thunk action to place a bid
export const placeBid = (id, data) => async (dispatch) => {
  dispatch(bidSlice.actions.bidRequest());
  try {
    const response = await axios.post(
      `http://localhost:5000/api/v1/bid/place/${id}`,
      data,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    dispatch(bidSlice.actions.bidSuccess());
    toast.success(response.data.message || "Bid placed successfully!");
    dispatch(getAuctionDetail(id)); // Refresh auction details
  } catch (error) {
    dispatch(bidSlice.actions.bidFailed());
    toast.error(
      error?.response?.data?.message || "Failed to place bid. Please try again."
    );
  }
};

export default bidSlice.reducer;
