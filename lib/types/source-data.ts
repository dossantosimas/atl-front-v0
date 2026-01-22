export interface SourceData {
  id: number;
  name: string;
  url?: string | null;
  user?: string | null;
  token?: string | null;
  bucket?: string | null;
  nameInfo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSourceDataDto {
  name: string;
  url?: string;
  user?: string;
  token?: string;
  bucket?: string;
  nameInfo?: string;
}

export interface UpdateSourceDataDto {
  name?: string;
  url?: string;
  user?: string;
  token?: string;
  bucket?: string;
  nameInfo?: string;
}

