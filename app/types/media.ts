// types/media.ts
export interface MediaItemResponse {
  id: string;
  name: string;
  type: "IMAGE" | "VIDEO" | "FONT";
  url: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaUploadRequest {
  name: string;
  type: "IMAGE" | "VIDEO" | "FONT";
  url: string;
}
