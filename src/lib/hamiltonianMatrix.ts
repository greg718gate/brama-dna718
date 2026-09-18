import { CARRIER_FREQ, GAMMA, GATCA_POSITIONS, MTDNA_LENGTH } from "./gatca718Constants";

/**
 * Hermitowska (rzeczywista, symetryczna) macierz Hamiltonianu 18×18 matrycy GATCA-718.
 * Diagonala: energie bram skalowane pozycją rCRS w mtDNA.
 * Elementy pozadiagonalne: sprzężenie γ^|i−j| z fazą geometryczną odległości genomowej.
 */
export function buildHamiltonianMatrix(): number[][] {
  const size = GATCA_POSITIONS.length;
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      if (row === col) return CARRIER_FREQ * (1 + GATCA_POSITIONS[row] / MTDNA_LENGTH);
      const distance = Math.abs(row - col);
      return GAMMA ** distance * Math.cos(((GATCA_POSITIONS[row] - GATCA_POSITIONS[col]) / MTDNA_LENGTH) * Math.PI);
    }),
  );
}
