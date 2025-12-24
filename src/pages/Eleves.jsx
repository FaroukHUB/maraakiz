import { useEffect, useState } from "react";
import { fetchJSON, MERKEZ_ID, ENDPOINTS } from "../lib/api";

export default function Eleves() {
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchJSON(ENDPOINTS.eleves); // "/dashboard/dashboard/professeur/eleves"
        if (mounted) {
          // si l'API ne filtre pas côté serveur :
          setEleves(Array.isArray(data) ? data.filter(e => e.merkez_id === MERKEZ_ID) : []);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setErr(e.message);
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (err) return <div className="p-6 text-red-600">Erreur : {err}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold" style={{ fontFamily: "Trajan, serif" }}>
        Mes Élèves
      </h1>

      {eleves.length === 0 ? (
        <div className="text-gray-500">Aucun élève pour l’instant.</div>
      ) : (
        <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm">
          <thead className="bg-[#3D4C66] text-white">
            <tr>
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Prénom</th>
              <th className="p-2 text-left">Niveau</th>
              <th className="p-2 text-left">Statut</th>
              <th className="p-2 text-left">Lien visio</th>
            </tr>
          </thead>
          <tbody>
            {eleves.map((e) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{e.nom}</td>
                <td className="p-2">{e.prenom}</td>
                <td className="p-2">{e.niveau}</td>
                <td className="p-2">{e.statut}</td>
                <td className="p-2">
                  {e.lien_visio ? (
                    <a
                      href={e.lien_visio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#437C8B] underline"
                    >
                      Ouvrir
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
