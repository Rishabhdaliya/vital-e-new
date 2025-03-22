import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedIssues: [],
  showHighligher: '',
};

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setSelectedIssues: (state, action) => {
      const { task, selected } = action.payload;
      if (selected) {
        state.selectedIssues.push(task);
      } else {
        state.selectedIssues = state.selectedIssues.filter(
          (issue) => issue.ticket !== task.ticket
        );
      }
    },
    setAllIssues: (state, action) => {
      state.selectedIssues = action.payload;
    },
    clearAllIssues: (state) => {
      state.selectedIssues = [];
    },
    setHiglighter: (state, action) => {
      state.showHighligher = action.payload;
    },
  },
});

export const {
  setSelectedIssues,
  setAllIssues,
  clearAllIssues,
  setHiglighter,
} = issueSlice.actions;
export default issueSlice.reducer;
