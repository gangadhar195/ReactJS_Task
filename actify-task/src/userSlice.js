// src/features/user/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  currentPage: 1,
  searchTerm: '',
  sortConfig: { key: null, direction: 'asc' },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSortConfig: (state, action) => {
      state.sortConfig = action.payload;
    },
  },
});

export const { setUsers, setCurrentPage, setSearchTerm, setSortConfig } = userSlice.actions;

export default userSlice.reducer;
