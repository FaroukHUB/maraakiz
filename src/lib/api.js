export const API_URL = "http://127.0.0.1:3001";
export const MERKEZ_ID = 5;

// ENDPOINTS réels (depuis tes captures Swagger)
export const ENDPOINTS = {
  eleves: "/dashboard/dashboard/professeur/eleves",
  eleveById: (id) => `/dashboard/dashboard/professeur/eleves/${id}`,
  planning: "/dashboard/dashboard/professeur/planning",
  messages: "/dashboard/dashboard/messages",
  aboGetByMerkez: (id) => `/dashboard/dashboard/abonnement/${id}`,
  statsEleves: (id) => `/dashboard/dashboard/stats/eleves/${id}`,
  statsMessages: (id) => `/dashboard/dashboard/stats/messages/${id}`,
  statsPlanning: (id) => `/dashboard/dashboard/stats/planning/${id}`,
};

export async function postJSON(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}


export async function fetchJSON(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}
