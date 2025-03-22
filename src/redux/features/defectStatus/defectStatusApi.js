import { api } from '../../api';
import { setDefectStatusOptions, setLoading } from './defectStatusSlice';

export const defectStatusApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDefectStatus: builder.query({
      query: () => ({
        url: `/api/defect-status`,
        method: 'GET',
      }),
      async onCacheEntryAdded(arg, { cacheDataLoaded, dispatch }) {
        // Set loading to true when starting to fetch data
        dispatch(setLoading(true));

        try {
          // Wait for the data to load
          const { data } = await cacheDataLoaded;

          // Dispatch to store data in defectStatus slice
          dispatch(setDefectStatusOptions(data));
        } catch (error) {
          console.error('Failed to load defect status data:', error);
        } finally {
          // Set loading to false when fetching is complete
          dispatch(setLoading(false));
        }
      },
    }),
  }),
});

export const { useGetDefectStatusQuery } = defectStatusApi;
