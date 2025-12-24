export const API_URL = "http://127.0.0.1:8000";

export const ENDPOINTS = {
  // Routes publiques (pour la page d'accueil)
  publicMerkez: "/api/public/merkez",
  publicMerkezById: (id) => `/api/public/merkez/${id}`,
  
  // Routes privées (pour le CRM - Phase 2)
  eleves: "/api/eleves",
  eleveById: (id) => `/api/eleves/${id}`,
  planning: "/api/planning",
  messages: "/api/messages",
  stats: "/api/stats",
};

export async function fetchJSON(path, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${path}${queryString ? `?${queryString}` : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}

export async function postJSON(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}

// Fonction spécifique pour récupérer les merkez avec filtres
export async function fetchPublicMerkez(filters = {}) {
  return fetchJSON(ENDPOINTS.publicMerkez, filters);
}

// Fonction pour récupérer un merkez par ID
export async function fetchPublicMerkezById(id) {
  return fetchJSON(ENDPOINTS.publicMerkezById(id));
}
