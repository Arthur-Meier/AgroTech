/**
 * Domain model for the AgroTec animal registry.
 *
 * Dates are stored as ISO calendar strings (`YYYY-MM-DD`) and `updatedAt`
 * uses full ISO datetime.
 */
export type AnimalId = string;

export type Sex = 'M' | 'F';
export type AnimalType = 'BEZERRO' | 'NOVILHO' | 'MATRIZ' | 'ENGORDA';

export const ANIMAL_ORIGIN_VALUES = ['BIRTH', 'PURCHASE', 'TRANSFER'] as const;
export type AnimalOrigin = (typeof ANIMAL_ORIGIN_VALUES)[number];

export interface Animal {
  id: AnimalId;

  // Base registry
  tag: string;
  type: AnimalType;
  sex: Sex;
  breed?: string;
  origin?: AnimalOrigin | string;
  lot?: string;
  pasture?: string;
  purchaseDate?: string;
  birthDate?: string;
  weightKg?: number;
  priceValue?: number;
  supplier?: string;
  weaningDate?: string;
  saleDate?: string;
  buyer?: string;

  // Parent references
  sireTag?: string;
  damTag?: string;

  // Optional lifecycle fields
  causeMortis?: string;
  notes?: string;
  pastureStartDate?: string;
  confinementStartDate?: string;

  // System metadata
  updatedAt: string;
  version: number;
}
