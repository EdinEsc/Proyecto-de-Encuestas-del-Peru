/*
  Generador de archivos .xlsx sin dependencias, con estilos.

  Un .xlsx es un ZIP con unos pocos XML dentro. Escribirlo a mano evita sumar
  una librería (y su peso) al panel solo para exportar una tabla de votos, y
  produce un archivo que Excel, LibreOffice y Google Sheets abren sin avisos
  de "el formato no coincide con la extensión" que sí aparecen con un CSV
  renombrado.

  La paleta de `styles.xml` replica los colores de marca del panel (brand/steel
  de tailwind.config.ts) para que el reporte se lea como parte del producto.
*/

export type CellValue = string | number | null | undefined;

/** Una celda: valor suelto, o valor + estilo tomado de `XS`. */
export type Cell = CellValue | { v: CellValue; s: number };

export type SheetData = {
  /** Nombre de la pestaña dentro del libro. */
  name: string;
  /** Filas; cada fila es un arreglo de celdas. Los números salen como números. */
  rows: Cell[][];
  /** Ancho de cada columna en caracteres. Opcional. */
  columnWidths?: number[];
  /** Alto de filas concretas, indexado desde 1. */
  rowHeights?: Record<number, number>;
  /** Rangos combinados, p. ej. ["A1:E1"]. */
  merges?: string[];
  /** Congela las primeras N filas al hacer scroll. */
  freezeRows?: number;
  /** Rango con filtro desplegable, p. ej. "A10:E20". */
  autoFilter?: string;
  /** Oculta la cuadrícula gris de fondo (los bordes propios lucen más). */
  hideGridLines?: boolean;
};

/* ---------------------------------------------------------------- */
/* Estilos disponibles                                               */
/* ---------------------------------------------------------------- */

/**
 * Índices de `cellXfs` en styles.xml. Se exponen con nombre para que el código
 * que arma el reporte se lea solo, sin números mágicos.
 */
export const XS = {
  /** Sin formato. */
  none: 0,
  /** Banda de título: blanco sobre azul de marca, grande. */
  title: 1,
  /** Subtítulo bajo el título, gris. */
  subtitle: 2,
  /** Etiqueta de la ficha de datos (izquierda, fondo suave). */
  metaLabel: 3,
  /** Valor de la ficha de datos. */
  metaValue: 4,
  /** Valor numérico de la ficha de datos, con separador de miles. */
  metaValueNum: 5,
  /** Cabecera de la tabla: blanco sobre azul. */
  header: 6,
  /** Celda de texto de la tabla. */
  cell: 7,
  /** Celda de texto centrada (columna de posición). */
  cellCenter: 8,
  /** Entero con separador de miles. */
  cellNum: 9,
  /** Decimal con dos cifras (porcentajes). */
  cellPct: 10,
  /** Fila del líder: resaltada en ámbar. */
  leader: 11,
  leaderCenter: 12,
  leaderNum: 13,
  leaderPct: 14,
  /** Fila de "No sabe / No opina": gris, para distinguirla del ranking. */
  neutral: 15,
  neutralCenter: 16,
  neutralNum: 17,
  neutralPct: 18,
  /** Fila de totales: negrita sobre azul claro y borde superior grueso. */
  total: 19,
  totalCenter: 20,
  totalNum: 21,
  totalPct: 22,
  /** Nota al pie, gris y pequeña. */
  note: 23,
} as const;

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="7">
<font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FF0B132B"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FF1D4FD7"/><name val="Calibri"/><family val="2"/></font>
<font><sz val="10"/><color rgb="FF64748B"/><name val="Calibri"/><family val="2"/></font>
<font><i/><sz val="9"/><color rgb="FF94A3B8"/><name val="Calibri"/><family val="2"/></font>
</fonts>
<fills count="8">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF1D4FD7"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF2563EB"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFF4CC"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFDBE6FE"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="4">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>
<border><left style="thin"><color rgb="FF1D4FD7"/></left><right style="thin"><color rgb="FF1D4FD7"/></right><top style="medium"><color rgb="FF1D4FD7"/></top><bottom style="thin"><color rgb="FF1D4FD7"/></bottom><diagonal/></border>
<border><left/><right/><top/><bottom style="medium"><color rgb="FF1D4FD7"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="24">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
<xf numFmtId="0" fontId="5" fillId="0" borderId="3" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="1" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="3" fontId="4" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="2" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="1" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="1" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="3" fontId="1" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="2" fontId="1" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="5" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="5" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="3" fontId="5" fillId="6" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="2" fontId="5" fillId="6" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="4" fillId="7" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="4" fillId="7" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="3" fontId="4" fillId="7" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="2" fontId="4" fillId="7" borderId="2" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="6" fillId="0" borderId="0" xfId="0" applyFont="1"/>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
<dxfs count="0"/>
<tableStyles count="0" defaultTableStyle="TableStyleMedium2"/>
</styleSheet>`;

/* ---------------------------------------------------------------- */
/* ZIP (método "stored": sin compresión, suficiente para estos XML)  */
/* ---------------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

type ZipEntry = { name: string; data: Uint8Array };

function zip(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true); // firma
    localView.setUint16(4, 20, true); // versión mínima
    localView.setUint16(6, 0x0800, true); // nombres en UTF-8
    localView.setUint16(8, 0, true); // método: stored
    localView.setUint16(10, 0, true); // hora
    localView.setUint16(12, 0, true); // fecha
    localView.setUint32(14, crc, true);
    localView.setUint32(18, size, true);
    localView.setUint32(22, size, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true); // sin campo extra
    local.set(nameBytes, 30);

    localParts.push(local, entry.data);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, size, true);
    centralView.setUint32(24, size, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    central.set(nameBytes, 46);

    centralParts.push(central);
    offset += local.length + size;
  }

  const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  // El cast evita el choque entre `Uint8Array<ArrayBufferLike>` (lo que devuelve
  // TextEncoder) y el `BlobPart` más estricto de las libs de TypeScript nuevas.
  return new Blob([...localParts, ...centralParts, end] as BlobPart[], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/* ---------------------------------------------------------------- */
/* XML del libro                                                     */
/* ---------------------------------------------------------------- */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Excel rechaza los caracteres de control salvo tab, LF y CR.
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

/** Índice de columna (0) → referencia de Excel ("A", "B", …, "AA"). */
function columnName(index: number): string {
  let name = "";
  let n = index;
  do {
    name = String.fromCharCode(65 + (n % 26)) + name;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return name;
}

function splitCell(cell: Cell): { value: CellValue; style: number } {
  if (cell !== null && typeof cell === "object") return { value: cell.v, style: cell.s };
  return { value: cell, style: 0 };
}

function sheetXml(sheet: SheetData): string {
  // El orden de los elementos dentro de <worksheet> lo fija el esquema OOXML:
  // sheetViews → cols → sheetData → autoFilter → mergeCells. Excel rechaza el
  // archivo si se altera.
  const pane = sheet.freezeRows
    ? `<pane ySplit="${sheet.freezeRows}" topLeftCell="A${sheet.freezeRows + 1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/>`
    : "";
  const views = `<sheetViews><sheetView workbookViewId="0"${sheet.hideGridLines ? ' showGridLines="0"' : ""}>${pane}</sheetView></sheetViews>`;

  const cols = sheet.columnWidths?.length
    ? `<cols>${sheet.columnWidths
        .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
        .join("")}</cols>`
    : "";

  const rows = sheet.rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cells = row
        .map((cell, colIndex) => {
          const { value, style } = splitCell(cell);
          const empty = value === null || value === undefined || value === "";
          // Una celda vacía pero con estilo sí se escribe: es lo que pinta el
          // fondo y el borde de las columnas sin dato.
          if (empty && !style) return "";
          const ref = `${columnName(colIndex)}${rowNumber}`;
          const s = style ? ` s="${style}"` : "";
          if (empty) return `<c r="${ref}"${s}/>`;
          if (typeof value === "number" && Number.isFinite(value)) {
            return `<c r="${ref}"${s}><v>${value}</v></c>`;
          }
          // `t="inlineStr"` evita mantener la tabla de cadenas compartidas.
          return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`;
        })
        .join("");
      const height = sheet.rowHeights?.[rowNumber];
      const heightAttr = height ? ` ht="${height}" customHeight="1"` : "";
      return `<row r="${rowNumber}"${heightAttr}>${cells}</row>`;
    })
    .join("");

  const autoFilter = sheet.autoFilter ? `<autoFilter ref="${sheet.autoFilter}"/>` : "";
  const merges = sheet.merges?.length
    ? `<mergeCells count="${sheet.merges.length}">${sheet.merges.map(r => `<mergeCell ref="${r}"/>`).join("")}</mergeCells>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${views}${cols}<sheetData>${rows}</sheetData>${autoFilter}${merges}</worksheet>`;
}

/** Excel limita el nombre de pestaña a 31 caracteres y prohíbe : \ / ? * [ ] */
function safeSheetName(name: string): string {
  const clean = name.replace(/[:\\/?*[\]]/g, " ").trim();
  return (clean || "Hoja1").slice(0, 31);
}

export function buildXlsx(sheet: SheetData): Blob {
  const encoder = new TextEncoder();
  const name = safeSheetName(sheet.name);

  const files: Record<string, string> = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,

    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,

    "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(name)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,

    "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,

    "xl/styles.xml": STYLES_XML,

    "xl/worksheets/sheet1.xml": sheetXml(sheet),
  };

  return zip(Object.entries(files).map(([path, xml]) => ({ name: path, data: encoder.encode(xml) })));
}

/** Construye el libro y dispara la descarga en el navegador. */
export function downloadXlsx(filename: string, sheet: SheetData): void {
  const url = URL.createObjectURL(buildXlsx(sheet));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Nombre de archivo seguro a partir del título de un proceso. */
export function slugForFile(text: string): string {
  return (
    text
      .normalize("NFD")
      // Quita las tildes que NFD separó en marcas de combinación (U+0300–U+036F).
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "reporte"
  );
}
