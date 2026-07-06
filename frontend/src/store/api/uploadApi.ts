import { baseApi } from './baseApi';

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadSingleImage: builder.mutation<{ data: UploadedFile; message?: string }, { category: string; file: File }>({
      query: ({ category, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: `/uploads/${category}/single`, method: 'POST', body: formData };
      },
    }),
    uploadMultipleImages: builder.mutation<{ data: UploadedFile[]; message?: string }, { category: string; files: File[] }>({
      query: ({ category, files }) => {
        const formData = new FormData();
        files.forEach((f) => formData.append('files', f));
        return { url: `/uploads/${category}/multiple`, method: 'POST', body: formData };
      },
    }),
  }),
});

export const { useUploadSingleImageMutation, useUploadMultipleImagesMutation } = uploadApi;
