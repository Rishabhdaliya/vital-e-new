import { api } from '../../api';
import { setConfiguration } from './configurationSlice';

export const configurationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConfiguration: builder.query({
      query: () => ({ url: `/api/configuration`, method: 'GET' }),
      async onCacheEntryAdded(arg, { cacheDataLoaded, dispatch, getState }) {
        try {
          const isLoaded = getState().configuration.loaded;
          if (!isLoaded) {
            const { data } = await cacheDataLoaded;
            dispatch(setConfiguration(data));
          }
        } catch (error) {
          console.error('Failed to load configuration cache entry', error);
        }
      },
    }),
  }),
});

export const { useGetConfigurationQuery } = configurationApi;
