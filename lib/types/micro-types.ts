import type { AnalysisType } from "./micro-analysis";
import type { MicroElement } from "./micro-elements";

export interface MicroType {
  id: string;
  name: string;
  start: string;
  end: string;
  description: string;
  elements?: MicroElement[];
  analysisTypes?: AnalysisType[];
}

