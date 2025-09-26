// Tipos de vía más usados en CO
export const VIA_TIPOS = [
  "Calle",
  "Carrera",
  "Transversal",
  "Diagonal",
  "Avenida",
] as const;

export const ALFABETO_ES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "Ñ",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
] as const;

export const LETRA_OPTIONS = ["No aplica", ...ALFABETO_ES] as const;

export const COMP1_OPTIONS = [
  "No aplica",
  "Norte",
  "Sur",
  "Este",
  "Oeste",
] as const; // 4. Complemento
// export const COMP2_OPTIONS = ['No aplica', '#'] as const;        // 9. Complemento

// Helper para armar dirección final
export function buildAddress(parts: {
  viaTipo: string;
  viaNumero?: string;
  viaLetra?: string;
  viaComp?: string;
  numero?: string;
  letra?: string;
  viaComp2?: string;
  compNum?: string;
  comp2?: string;
  apto?: string;
}) {
  const p: (string | undefined)[] = [];
  p.push(parts.viaTipo);
  p.push(parts.viaNumero);
  if (parts.viaLetra && parts.viaLetra !== "No aplica") p.push(parts.viaLetra);
  if (parts.viaComp && parts.viaComp !== "No aplica") p.push(parts.viaComp);

  if (parts.numero) p.push("#" + parts.numero);
  if (parts.letra && parts.letra !== "No aplica") p.push(parts.letra);
  if (parts.viaComp2 && parts.viaComp2 !== "No aplica") p.push(parts.viaComp2);
  if (parts.compNum) p.push("-", parts.compNum);

  if (parts.comp2 && parts.comp2 !== "No aplica") p.push(parts.comp2);
  // if (parts.num2) p.push(parts.num2);

  if (parts.apto) p.push(",", parts.apto);

  return p.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
