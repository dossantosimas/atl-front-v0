export interface MicroIndexBudgetAnalysisType {
  analysis_type_id: string;
  analysis_type_name: string;
  weighted: number;
}

export interface MicroIndexBudgetGroup {
  micro_index_group: string;
  analysisTypes: MicroIndexBudgetAnalysisType[];
}

export interface MicroIndexWeekAnalysisType {
  typeId: string;
  typeName: string;
  analysisCount: number;
  averageWeighted: number;
  compliantCount: number;
  nonCompliantCount: number;
}

export interface NonCompliantDetail {
  analysisId: number;
  typeId: string;
  typeName: string;
  elementName: string;
  microTypeName: string;
  value: string;
}

export interface MicroIndexWeekGroup {
  microIndexGroup: string;
  analysisTypes: MicroIndexWeekAnalysisType[];
  nonCompliantDetails?: NonCompliantDetail[];
}

export interface MicroIndexWeekDay {
  date: string;
  microIndexGroups: MicroIndexWeekGroup[];
}

