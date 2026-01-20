// Tipos para Niveles de Compatibilidad
export interface CompatibilityLevel {
  id: string;
  code: "COMPATIBLE" | "INCOMPATIBLE" | "CONDITIONAL";
  color: string;
  description: string;
}

export interface CreateCompatibilityLevelDto {
  code: "COMPATIBLE" | "INCOMPATIBLE" | "CONDITIONAL";
  color: string;
  description: string;
}

export interface UpdateCompatibilityLevelDto extends Partial<CreateCompatibilityLevelDto> {}

// Tipos para Grupos Químicos
export interface ChemicalGroup {
  id: string;
  name: string;
  description: string;
}

export interface CreateChemicalGroupDto {
  name: string;
  description: string;
}

export interface UpdateChemicalGroupDto extends Partial<CreateChemicalGroupDto> {}

// Tipos para Sustancias Químicas
export interface ChemicalSubstance {
  id: string;
  name: string;
  casNumber: string;
  chemicalGroupId: string;
  chemicalGroup?: ChemicalGroup;
  physicalState: "liquid" | "solid" | "gas" | "powder";
  phMin?: number;
  phMax?: number;
  ghsClass: string;
  nfpaHealth: number;
  nfpaFlammability: number;
  nfpaReactivity: number;
  isActive: boolean;
  pictograms?: Pictogram[];
}

export interface CreateChemicalSubstanceDto {
  name: string;
  casNumber: string;
  chemicalGroupId: string;
  physicalState: "liquid" | "solid" | "gas" | "powder";
  phMin?: number;
  phMax?: number;
  ghsClass: string;
  nfpaHealth: number;
  nfpaFlammability: number;
  nfpaReactivity: number;
  isActive: boolean;
}

export interface UpdateChemicalSubstanceDto extends Partial<CreateChemicalSubstanceDto> {}

// Tipos para Matriz de Compatibilidad
export interface CompatibilityMatrix {
  id: string;
  chemicalAId: string;
  chemicalBId: string;
  chemicalA?: ChemicalSubstance;
  chemicalB?: ChemicalSubstance;
  compatibilityLevelId?: string;
  compatibilityLevel?: CompatibilityLevel;
  riskDescription: string;
  reactionType: string;
  requiredControls: string;
  sourceReference?: string;
  validatedBy?: string;
  lastReviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompatibilityMatrixDto {
  chemicalAId: string;
  chemicalBId: string;
  compatibilityLevelId: string;
  riskDescription: string;
  reactionType: string;
  requiredControls: string;
  sourceReference?: string;
  validatedBy?: string;
}

export interface UpdateCompatibilityMatrixDto extends Partial<CreateCompatibilityMatrixDto> {}

export interface CompatibilityCheckResult {
  compatibility: CompatibilityMatrix | null;
  exists: boolean;
}

// Tipos para Pictogramas
export interface Pictogram {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface CreatePictogramDto {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdatePictogramDto extends Partial<CreatePictogramDto> {}

export interface AssignPictogramsToSubstanceDto {
  pictogramIds: string[];
}

