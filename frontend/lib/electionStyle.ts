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
  presidencial: "bg-brand-600",
  regional: "bg-plum-500",
  distrital: "bg-accent-500",
  provincial: "bg-neon-500",
  otro: "bg-steel-400",
};

/** Color del texto/icono al pasar el mouse por la tarjeta. */
export const toneText: Record<ElectionTone, string> = {
  presidencial: "group-hover:text-brand-600 dark:group-hover:text-brand-400",
  regional: "group-hover:text-plum-600 dark:group-hover:text-plum-400",
  distrital: "group-hover:text-accent-600 dark:group-hover:text-accent-400",
  provincial: "group-hover:text-neon-700 dark:group-hover:text-neon-400",
  otro: "group-hover:text-steel-700 dark:group-hover:text-steel-300",
};

/** Botón circular de la derecha: se rellena con el color del tipo al hacer hover. */
export const toneButton: Record<ElectionTone, string> = {
  presidencial: "group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white",
  regional: "group-hover:border-plum-500 group-hover:bg-plum-500 group-hover:text-white",
  distrital: "group-hover:border-accent-500 group-hover:bg-accent-500 group-hover:text-white",
  provincial: "group-hover:border-neon-500 group-hover:bg-neon-500 group-hover:text-ink-900",
  otro: "group-hover:border-steel-500 group-hover:bg-steel-500 group-hover:text-white",
};
