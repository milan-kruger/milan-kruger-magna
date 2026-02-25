import { contentStoreBaseSplitApi as api } from "./contentStoreBaseApi";
export const addTagTypes = ["Info"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getAbout: build.query<GetAboutApiResponse, GetAboutApiArg>({
        query: () => ({ url: `/info/about` }),
        providesTags: ["Info"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as contentStoreApi };
export type GetAboutApiResponse = /** status 200 OK */ Info;
export type GetAboutApiArg = void;
export type Info = {
  applicationName?: string;
  applicationVersion?: string;
  gitBuildVersion?: string;
  gitBranch?: string;
  gitCommitId?: string;
  gitTimeStamp?: string;
};
export const { useGetAboutQuery } = injectedRtkApi;
