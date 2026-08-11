import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface ProfileState {
  user: any | null;
  loading: boolean;
}

const initialState: ProfileState = {
  user: null,
  loading: false,
}

const profileSlice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
  },
})

export const { setUser, setLoading } = profileSlice.actions
export default profileSlice.reducer
