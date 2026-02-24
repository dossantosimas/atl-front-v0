export interface MicroIndexWeekAnalysisType {
  typeId: string;
  typeName: string;
  analysisCount: number;
  averageWeighted: number;
  compliantCount: number;
  nonCompliantCount: number;
}

export interface MicroIndexWeekGroup {
  microIndexGroup: string;
  analysisTypes: MicroIndexWeekAnalysisType[];
}

export interface MicroIndexWeekDay {
  date: string;
  microIndexGroups: MicroIndexWeekGroup[];
}

