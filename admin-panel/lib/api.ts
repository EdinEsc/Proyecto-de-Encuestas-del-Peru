const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || PUBLIC_API_URL;
const API_URL = typeof window === "undefined" ? INTERNAL_API_URL : PUBLIC_API_URL;

export type Election = {
  id: string;
  title: string;
  election_type?: string;
  region_name?: string;
  description?: string;
  banner_url?: string;
  is_active: boolean;
  end_date: string;
  created_at: string;
};

export type Candidate = {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  election_id: string;
  /** Opción "No sabe / No opina": se muestra siempre al final del ranking. */
  is_undecided?: boolean;
};

export type ResultItem = {
  candidate_id: string;
  name: string;
  image_url: string;
  votes: number;
  is_undecided?: boolean;
};

export type Results = {
  election_title: string;
  total_votes: number;
  ranking: ResultItem[];
};

/*
  El backend ya devuelve "No sabe / No opina" al final, pero el orden se vuelve a
  aplicar en el cliente para que la regla se cumpla aunque la respuesta venga de
  una caché previa a este cambio.
*/
export function sortRanking(ranking: ResultItem[] | null | undefined): ResultItem[] {
  return [...(ranking ?? [])].sort((a, b) => {
    if (!!a.is_undecided !== !!b.is_undecided) return a.is_undecided ? 1 : -1;
    return b.votes - a.votes;
  });
}

export type Region = {
  id: string;
  name: string;
  level: string;
  parent_id?: string | null;
};

export type ElectionType = {
  id: string;
  name: string;
};

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.error || `Error ${res.status}: Fallo en la petición`;
    console.error(`API Error [${path}]:`, errorMsg);
    throw new Error(errorMsg);
  }

  return data as T;
}

export function getImageUrl(path: string | undefined): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${PUBLIC_API_URL}${path}`;
}

export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : "";

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`
  };
}

export function getBrowserId() {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem("browser_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("browser_id", id);
    document.cookie = `browser_id=${id}; max-age=31536000; path=/; SameSite=Lax`;
  }

  return id;
}