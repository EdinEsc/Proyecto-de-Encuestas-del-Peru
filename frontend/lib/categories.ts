/*
  Clasificación de procesos por categoría.

  Vive aquí porque el Header (para armar los desplegables) y la home (para
  filtrar la lista) necesitan exactamente el mismo criterio. Cuando estaba
  duplicado en ambos archivos las listas ya habían empezado a diferir.
*/

type Clasificable = {
  title: string;
  election_type?: string;
};

/*
  Los distritos del Callao llegan con tipo "distrital", igual que los de Lima;
  lo único que los distingue es el nombre. "Mi Perú" faltaba en la lista, así
  que aparecía dentro de "Distritos de Lima".
*/
const CALLAO = [
  "callao",
  "ventanilla",
  "la perla",
  "la punta",
  "bellavista",
  "carmen de la legua",
  "mi perú",
  "mi peru",
];

export function esCallao(e: Clasificable): boolean {
  const title = e.title.toLowerCase();
  return CALLAO.some((k) => title.includes(k));
}

export function matchesCategory(e: Clasificable, category: string): boolean {
  const title = e.title.toLowerCase();
  const type = (e.election_type || "").toLowerCase();

  switch (category) {
    case "all":
      return true;
    case "presidencial":
      return type.includes("presidencial") || title.includes("presidencial");
    case "regionales":
      return type.includes("regional") || title.includes("regional");
    case "lima":
      // Solo la alcaldía provincial. Antes bastaba con que el título dijera
      // "lima", así que arrastraba a todos los distritos.
      return title.includes("alcaldía de lima");
    case "lima_distritos":
      return type.includes("distrital") && !esCallao(e);
    case "callao":
      return esCallao(e);
    default:
      return true;
  }
}
