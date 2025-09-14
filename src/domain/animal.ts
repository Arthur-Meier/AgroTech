/**
 * Animal domain model (Cadastro)
 * - Campos alinhados ao seu "Cadastro" + alguns auxiliares de ciclo de vida.
 * - Datas em ISO (YYYY-MM-DD para datas simples; timestamps completos quando preciso).
 */
export type AnimalId = string;
export type Sex = 'M' | 'F'; // Macho/Fêmea
export type AnimalType = 'BEZERRO' | 'NOVILHO' | 'MATRIZ' | 'ENGORDA';

export interface Animal {
  id: AnimalId;

  // Cadastro básico
  tag: string;                 // Nº Brinco
  type: AnimalType;            // Bezerro | Novilho | Matriz | Engorda (para abate)
  sex: Sex;                    // M | F
  breed?: string;              // Raça
  origin?: string;             // Origem (ex.: Compra, Nascimento, Transferência)
  lot?: string;                // Lote
  pasture?: string;            // Pasto
  purchaseDate?: string;       // Data da Compra (YYYY-MM-DD)
  birthDate?: string;          // Data de Nascimento (YYYY-MM-DD)
  weightKg?: number;           // Peso (kg)
  priceValue?: number;         // Valor (R$)
  supplier?: string;           // Fornecedor
  weaningDate?: string;        // Data Desmama
  saleDate?: string;           // Data de Venda
  buyer?: string;              // Comprador
  sireTag?: string;            // Brinco Pai
  damTag?: string;             // Brinco Mãe
  causeMortis?: string;        // Causa Mortis
  notes?: string;              // Observação

  // Auxiliares de regra/etapas (opcionais – para futuras automações)
  pastureStartDate?: string;       // quando virou Novilho (inicio do pasto)
  confinementStartDate?: string;   // quando entrou no confinamento (100 dias)

  // Sistema
  updatedAt: string;   // timestamp ISO (UTC recomendado)
  version: number;     // controle otimista
}
