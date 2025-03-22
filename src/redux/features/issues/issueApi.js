import { api } from '../../api';

export const issuesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllIssues: builder.query({
      query: () => ({ url: `/api/jira`, method: 'GET' }),
      providesTags: (result) =>
        Array.isArray(result)
          ? result.map(({ id }) => ({ type: 'Issue', id }))
          : [{ type: 'Issue', id: 'LIST' }], // Fallback tag for the list
    }),
    updateIssue: builder.mutation({
      query: ({ issueId, updatedIssueBodyPayload }) => ({
        url: `/api/jira/${issueId}`,
        method: 'PUT',
        body: JSON.stringify(updatedIssueBodyPayload),
      }),
      async onQueryStarted(
        { issueId, updatedIssueBodyPayload },
        { dispatch, queryFulfilled }
      ) {
        // Optimistic update
        const patchResult = dispatch(
          issuesApi.util.updateQueryData('getAllIssues', undefined, (draft) => {
            const issue = draft.find((issue) => issue.id === issueId);
            if (issue) {
              // Merge fields from updatedIssueBodyPayload into the existing issue data
              Object.assign(issue, updatedIssueBodyPayload);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert in case of failure
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { issueId }) => [
        { type: 'Issue', id: issueId },
        { type: 'Issue', id: 'LIST' }, // Also refresh the list if needed
      ],
    }),
  }),
  overrideExisting: true, // Allow overriding existing endpoints
});

export const { useGetAllIssuesQuery, useUpdateIssueMutation } = issuesApi;
