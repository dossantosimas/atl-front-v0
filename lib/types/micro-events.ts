export interface MicroEventElement {
  id: number;
  name: string;
}

export interface MicroEvent {
  id: number;
  element: MicroEventElement;
  typeId?: string;
  streamstardate: string;
  value: string;
  samplestart: string;
  sampleend: string;
  sampleconfirm: string | null;
  sampleresponsable: string | null;
  analysisresponsable: string | null;
  description: string | null;
  charecterization: string | null;
  month: string;
  year: number;
  codeCount: number;
  code: string;
  week: number;
  selector: boolean;
  delete: boolean;
  analysisCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MicroEventsSearchParams {
  typeId: string;
  month: string;
  week?: string;
  year?: number;
  page?: number;
  limit?: number;
  selector?: boolean;
}

export interface MicroEventsSearchResponse {
  data: MicroEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

