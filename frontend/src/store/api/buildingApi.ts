import { baseApi } from './baseApi';
import type { Building, Floor, OccupancyStats } from '@/types/building';

export interface FloorInput {
  floorNumber: number | string;
  name: string;
  totalUnits: number;
}

export interface CreateBuildingInput {
  name: string;
  type: string;
  totalUnits: number;
  location: {
    address: string; city: string; state: string; pincode: string;
    landmark?: string; country: string; latitude?: number; longitude?: number;
  };
  floors: Record<string, number>; // { "0": 4, "1": 6 } floorNumber -> totalUnits
  sqft?: number;
  lift?: boolean;
  helipad?: boolean;
  nearAirport?: string;
  nearRailwayStation?: string;
  nearBusStand?: string;
  nearPark?: string;
  amenities?: string[];
  images?: string[];
  description?: string;
  yearOfBuild?: string;
  isPublished?: boolean;
}

export const buildingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOccupancyStats: builder.query<{ data: OccupancyStats }, void>({
      query: () => '/buildings/stats/occupancy',
      providesTags: ['Building'],
    }),
    getBuildings: builder.query<{ data: Building[] }, { status?: string; type?: string } | void>({
      query: (params) => ({ url: '/buildings', params: params ?? undefined }),
      providesTags: (result) =>
        result ? [...result.data.map((b) => ({ type: 'Building' as const, id: b._id })), { type: 'Building' as const, id: 'LIST' }] : [{ type: 'Building' as const, id: 'LIST' }],
    }),
    getBuildingById: builder.query<{ data: Building }, string>({
      query: (id) => `/buildings/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Building', id }],
    }),
    createBuilding: builder.mutation<{ data: Building; message?: string }, CreateBuildingInput>({
      query: (body) => ({ url: '/buildings', method: 'POST', body }),
      invalidatesTags: [{ type: 'Building', id: 'LIST' }],
    }),
    updateBuilding: builder.mutation<{ data: Building; message?: string }, { id: string; body: Partial<CreateBuildingInput> & { status?: string; managerId?: string | null } }>({
      query: ({ id, body }) => ({ url: `/buildings/${id}/update`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Building', id }, { type: 'Building', id: 'LIST' }],
    }),
    deleteBuilding: builder.mutation<{ message?: string }, string>({
      query: (id) => ({ url: `/buildings/${id}/delete`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Building', id: 'LIST' }],
    }),

    // ── Floors ──────────────────────────────────────────────────────────────
    getFloorsByBuilding: builder.query<{ data: Floor[] }, string>({
      query: (buildingId) => `/buildings/${buildingId}/floors`,
      providesTags: (result, _e, buildingId) =>
        result ? [...result.data.map((f) => ({ type: 'Floor' as const, id: f._id })), { type: 'Floor' as const, id: `LIST-${buildingId}` }] : [{ type: 'Floor' as const, id: `LIST-${buildingId}` }],
    }),
    createFloor: builder.mutation<{ data: Floor; message?: string }, { buildingId: string; body: FloorInput }>({
      query: ({ buildingId, body }) => ({ url: `/buildings/${buildingId}/floors`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { buildingId }) => [{ type: 'Floor', id: `LIST-${buildingId}` }, { type: 'Building', id: buildingId }, { type: 'Unit', id: 'LIST' }],
    }),
    updateFloor: builder.mutation<{ data: Floor; message?: string }, { id: string; buildingId: string; body: Partial<{ name: string; floorNumber: number; totalUnits: number; status: string; description: string }> }>({
      query: ({ id, body }) => ({ url: `/floors/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { buildingId }) => [{ type: 'Floor', id: `LIST-${buildingId}` }, { type: 'Building', id: buildingId }, { type: 'Unit', id: 'LIST' }],
    }),
    deleteFloor: builder.mutation<{ message?: string }, { id: string; buildingId: string }>({
      query: ({ id }) => ({ url: `/floors/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { buildingId }) => [{ type: 'Floor', id: `LIST-${buildingId}` }, { type: 'Building', id: buildingId }, { type: 'Unit', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetOccupancyStatsQuery,
  useGetBuildingsQuery,
  useGetBuildingByIdQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
  useDeleteBuildingMutation,
  useGetFloorsByBuildingQuery,
  useCreateFloorMutation,
  useUpdateFloorMutation,
  useDeleteFloorMutation,
} = buildingApi;
