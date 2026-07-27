/**
 * Color por tipo de proceso electoral. Un mismo tipo se ve siempre del mismo
 * color en toda la app: chip, franja lateral de la tarjeta y acentos.
 */
export type ElectionTone = "presidencial" | "regional" | "distrital" | "provincial" | "otro";

export function electionTone(type?: string): ElectionTone {
  const t = (type || "").toLowerCase();
  if (t.includes("presidencial")) return "presidencial";
  if (t.includes("regional")) return "regional";
  if (t.includes("provincial")) return "provincial";
  if (t.includes("distrital")) return "distrital";
  return "otro";
}

/**
 * Clase del chip. Va escrita completa (y no como `chip-${tone}`) porque
 * Tailwind purga las clases que no encuentra literales en el código.
 */
export const toneChip: Record<ElectionTone, string> = {
  presidencial: "chip-presidencial",
  regional: "chip-regional",
  distrital: "chip-distrital",
  provincial: "chip-provincial",
  otro: "chip-otro",
};

/** Franja vertical de color al borde izquierdo de la tarjeta. */
export const toneBar: Record<ElectionTone, string> = {
  presidencial: "bg-navy",
  regional: "bg-electric",
  distrital: "bg-steel-500",
  provincial: "bg-gold",
  otro: "bg-steel-300",
};

/** Color del texto/icono al pasar el mouse por la tarjeta. */
export const toneText: Record<ElectionTone, string> = {
  presidencial: "group-hover:text-navy dark:group-hover:text-white",
  regional: "group-hover:text-electric dark:group-hover:text-brand-400",
  distrital: "group-hover:text-steel-700 dark:group-hover:text-steel-300",
  provincial: "group-hover:text-gold-hover dark:group-hover:text-gold",
  otro: "group-hover:text-steel-600 dark:group-hover:text-steel-300",
};

/** Botón circular de la derecha: se rellena con el color del tipo al hacer hover. */
export const toneButton: Record<ElectionTone, string> = {
  presidencial: "group-hover:border-navy group-hover:bg-navy group-hover:text-white",
  regional: "group-hover:border-electric group-hover:bg-electric group-hover:text-white",
  distrital: "group-hover:border-steel-500 group-hover:bg-steel-500 group-hover:text-white",
  // Texto marino: sobre dorado el blanco no da contraste suficiente
  provincial: "group-hover:border-gold group-hover:bg-gold group-hover:text-navy",
  otro: "group-hover:border-steel-400 group-hover:bg-steel-400 group-hover:text-white",
};
