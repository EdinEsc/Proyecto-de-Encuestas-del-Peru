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
};

export type ResultItem = {
  candidate_id: string;
  name: string;
  image_url: string;
  votes: number;
};

export type Results = {
  election_title: string;
  total_votes: number;
  ranking: ResultItem[];
};


export type Comment = {
  id: string;
  candidate_id: string;
  content: string;
  ip_address: string;
  created_at: string;
};

/** Respuesta paginada de /candidates/:id/comments */
export type CommentPage = {
  items: Comment[];
  total: number;
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