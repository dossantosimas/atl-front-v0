import axios from "axios";
import type {
  CompatibilityLevel,
  CreateCompatibilityLevelDto,
  UpdateCompatibilityLevelDto,
  ChemicalGroup,
  CreateChemicalGroupDto,
  UpdateChemicalGroupDto,
  ChemicalSubstance,
  CreateChemicalSubstanceDto,
  UpdateChemicalSubstanceDto,
  CompatibilityMatrix,
  CreateCompatibilityMatrixDto,
  UpdateCompatibilityMatrixDto,
  CompatibilityCheckResult,
  Pictogram,
  CreatePictogramDto,
  UpdatePictogramDto,
  AssignPictogramsToSubstanceDto,
} from "../types/chemical-substances";

// Re-export for convenience
export type { AssignPictogramsToSubstanceDto };
import { env } from "@/config/env";

// ==================== Compatibility Levels ====================

export async function getCompatibilityLevels(): Promise<CompatibilityLevel[]> {
  try {
    const response = await axios.get<CompatibilityLevel[]>(
      `${env.BASE_URL}/chemicals/compatibility-levels`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching compatibility levels:", error);
    throw error;
  }
}

export async function getCompatibilityLevelById(id: string): Promise<CompatibilityLevel> {
  try {
    const response = await axios.get<CompatibilityLevel>(
      `${env.BASE_URL}/chemicals/compatibility-levels/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching compatibility level by id:", error);
    throw error;
  }
}

export async function createCompatibilityLevel(
  data: CreateCompatibilityLevelDto
): Promise<CompatibilityLevel> {
  try {
    const response = await axios.post<CompatibilityLevel>(
      `${env.BASE_URL}/chemicals/compatibility-levels`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating compatibility level:", error);
    throw error;
  }
}

export async function updateCompatibilityLevel(
  id: string,
  data: UpdateCompatibilityLevelDto
): Promise<CompatibilityLevel> {
  try {
    const response = await axios.put<CompatibilityLevel>(
      `${env.BASE_URL}/chemicals/compatibility-levels/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating compatibility level:", error);
    throw error;
  }
}

export async function deleteCompatibilityLevel(id: string): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/chemicals/compatibility-levels/${id}`);
  } catch (error) {
    console.error("Error deleting compatibility level:", error);
    throw error;
  }
}

// ==================== Chemical Groups ====================

export async function getChemicalGroups(): Promise<ChemicalGroup[]> {
  try {
    const response = await axios.get<ChemicalGroup[]>(
      `${env.BASE_URL}/chemicals/groups`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching chemical groups:", error);
    throw error;
  }
}

export async function getChemicalGroupById(id: string): Promise<ChemicalGroup> {
  try {
    const response = await axios.get<ChemicalGroup>(
      `${env.BASE_URL}/chemicals/groups/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching chemical group by id:", error);
    throw error;
  }
}

export async function createChemicalGroup(
  data: CreateChemicalGroupDto
): Promise<ChemicalGroup> {
  try {
    const response = await axios.post<ChemicalGroup>(
      `${env.BASE_URL}/chemicals/groups`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating chemical group:", error);
    throw error;
  }
}

export async function updateChemicalGroup(
  id: string,
  data: UpdateChemicalGroupDto
): Promise<ChemicalGroup> {
  try {
    const response = await axios.put<ChemicalGroup>(
      `${env.BASE_URL}/chemicals/groups/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating chemical group:", error);
    throw error;
  }
}

export async function deleteChemicalGroup(id: string): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/chemicals/groups/${id}`);
  } catch (error) {
    console.error("Error deleting chemical group:", error);
    throw error;
  }
}

// ==================== Chemical Substances ====================

export async function getChemicalSubstances(): Promise<ChemicalSubstance[]> {
  try {
    const response = await axios.get<ChemicalSubstance[]>(
      `${env.BASE_URL}/chemicals/substances`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching chemical substances:", error);
    throw error;
  }
}

export async function getChemicalSubstanceById(id: string): Promise<ChemicalSubstance> {
  try {
    const response = await axios.get<ChemicalSubstance>(
      `${env.BASE_URL}/chemicals/substances/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching chemical substance by id:", error);
    throw error;
  }
}

export async function createChemicalSubstance(
  data: CreateChemicalSubstanceDto
): Promise<ChemicalSubstance> {
  try {
    const response = await axios.post<ChemicalSubstance>(
      `${env.BASE_URL}/chemicals/substances`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating chemical substance:", error);
    throw error;
  }
}

export async function updateChemicalSubstance(
  id: string,
  data: UpdateChemicalSubstanceDto
): Promise<ChemicalSubstance> {
  try {
    const response = await axios.put<ChemicalSubstance>(
      `${env.BASE_URL}/chemicals/substances/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating chemical substance:", error);
    throw error;
  }
}

export async function deleteChemicalSubstance(id: string): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/chemicals/substances/${id}`);
  } catch (error) {
    console.error("Error deleting chemical substance:", error);
    throw error;
  }
}

// ==================== Compatibility Matrix ====================

export async function getCompatibilityMatrix(): Promise<CompatibilityMatrix[]> {
  try {
    const response = await axios.get<CompatibilityMatrix[]>(
      `${env.BASE_URL}/chemicals/compatibility-matrix`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching compatibility matrix:", error);
    throw error;
  }
}

export async function getCompatibilityMatrixById(id: string): Promise<CompatibilityMatrix> {
  try {
    const response = await axios.get<CompatibilityMatrix>(
      `${env.BASE_URL}/chemicals/compatibility-matrix/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching compatibility matrix by id:", error);
    throw error;
  }
}

export async function checkCompatibility(
  chemicalAId: string,
  chemicalBId: string
): Promise<CompatibilityCheckResult> {
  try {
    const response = await axios.get<CompatibilityMatrix | null>(
      `${env.BASE_URL}/chemicals/compatibility-matrix/check/${chemicalAId}/${chemicalBId}`
    );
    return {
      compatibility: response.data,
      exists: response.data !== null,
    };
  } catch (error) {
    console.error("Error checking compatibility:", error);
    throw error;
  }
}

export async function createCompatibilityMatrixEntry(
  data: CreateCompatibilityMatrixDto
): Promise<CompatibilityMatrix> {
  try {
    const response = await axios.post<CompatibilityMatrix>(
      `${env.BASE_URL}/chemicals/compatibility-matrix`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating compatibility matrix entry:", error);
    throw error;
  }
}

export async function updateCompatibilityMatrixEntry(
  id: string,
  data: UpdateCompatibilityMatrixDto
): Promise<CompatibilityMatrix> {
  try {
    const response = await axios.put<CompatibilityMatrix>(
      `${env.BASE_URL}/chemicals/compatibility-matrix/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating compatibility matrix entry:", error);
    throw error;
  }
}

export async function deleteCompatibilityMatrixEntry(id: string): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/chemicals/compatibility-matrix/${id}`);
  } catch (error) {
    console.error("Error deleting compatibility matrix entry:", error);
    throw error;
  }
}

// ==================== Matrix Data (Optimized) ====================

export interface MatrixDataResponse {
  substances: ChemicalSubstance[];
  compatibilityLevels: CompatibilityLevel[];
  matrix: CompatibilityMatrix[];
}

export async function getMatrixData(): Promise<MatrixDataResponse> {
  try {
    const response = await axios.get<MatrixDataResponse>(
      `${env.BASE_URL}/chemicals/matrix-data`,
      {
        // Agregar headers para evitar caché
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching matrix data:", error);
    throw error;
  }
}

/**
 * Busca una relación de compatibilidad entre dos sustancias en la matriz.
 * Considera ambas direcciones (A->B y B->A) ya que la compatibilidad es bidireccional.
 */
export function findCompatibility(
  substanceAId: string,
  substanceBId: string,
  matrix: CompatibilityMatrix[]
): CompatibilityMatrix | null {
  return (
    matrix.find(
      (rel) =>
        (rel.chemicalAId === substanceAId && rel.chemicalBId === substanceBId) ||
        (rel.chemicalAId === substanceBId && rel.chemicalBId === substanceAId)
    ) || null
  );
}

// ==================== Pictograms ====================

export async function getPictograms(): Promise<Pictogram[]> {
  try {
    const response = await axios.get<Pictogram[]>(
      `${env.BASE_URL}/chemicals/pictograms`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pictograms:", error);
    throw error;
  }
}

export async function getPictogramById(id: string): Promise<Pictogram> {
  try {
    const response = await axios.get<Pictogram>(
      `${env.BASE_URL}/chemicals/pictograms/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pictogram by id:", error);
    throw error;
  }
}

export async function createPictogram(data: CreatePictogramDto): Promise<Pictogram> {
  try {
    const response = await axios.post<Pictogram>(
      `${env.BASE_URL}/chemicals/pictograms`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error creating pictogram:", error);
    throw error;
  }
}

export async function updatePictogram(
  id: string,
  data: UpdatePictogramDto
): Promise<Pictogram> {
  try {
    const response = await axios.put<Pictogram>(
      `${env.BASE_URL}/chemicals/pictograms/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating pictogram:", error);
    throw error;
  }
}

export async function deletePictogram(id: string): Promise<void> {
  try {
    await axios.delete(`${env.BASE_URL}/chemicals/pictograms/${id}`);
  } catch (error) {
    console.error("Error deleting pictogram:", error);
    throw error;
  }
}

export async function assignPictogramsToSubstance(
  substanceId: string,
  data: AssignPictogramsToSubstanceDto
): Promise<void> {
  try {
    await axios.post(
      `${env.BASE_URL}/chemicals/substances/${substanceId}/pictograms`,
      data
    );
  } catch (error) {
    console.error("Error assigning pictograms to substance:", error);
    throw error;
  }
}

export async function removePictogramsFromSubstance(
  substanceId: string,
  data: AssignPictogramsToSubstanceDto
): Promise<void> {
  try {
    await axios.delete(
      `${env.BASE_URL}/chemicals/substances/${substanceId}/pictograms`,
      { data }
    );
  } catch (error) {
    console.error("Error removing pictograms from substance:", error);
    throw error;
  }
}

export async function getSubstancePictograms(substanceId: string): Promise<Pictogram[]> {
  try {
    const response = await axios.get<Pictogram[]>(
      `${env.BASE_URL}/chemicals/substances/${substanceId}/pictograms`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching substance pictograms:", error);
    throw error;
  }
}

