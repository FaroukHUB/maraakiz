import { useEffect, useState, useMemo } from "react";
import { fetchJSON, MERKEZ_ID, ENDPOINTS } from "../lib/api";

export default function CRM() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // KPI
  const [elevesCount, setElevesCount] = useState(0);
  const [messagesNonLus, setMessagesNonLus] = useState(0);
  const [prochainCours, setProchainCours] = useState(null);
  const [abonnement, setAbonnement] = useState(null);

  // Agenda
  const [planning, setPlanning] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [elevesStat, msgsStat, planStat, abo] = await Promise.all([
          fetchJSON(ENDPOINTS.statsEleves(MERKEZ_ID)).catch(() => ({})),
          fetchJSON(ENDPOINTS.statsMessages(MERKEZ_ID)).catch(() => ({})),
          fetchJSON(ENDPOINTS.statsPlanning(MERKEZ_ID)).catch(() => ({})),
          fetchJSON(ENDPOINTS.aboGetByMerkez(MERKEZ_ID)).catch(() => null),
        ]);

        const planList = await fetchJSON(ENDPOINTS.planning).catch(() => []);

        if (!mounted) return;

        setElevesCount(elevesStat.total_eleves ?? elevesStat.total ?? elevesStat.count ?? 0);
        setMessagesNonLus(msgsStat.total_non_lus ?? msgsStat.unread ?? msgsStat.count_non_lus ?? 0);
        setProchainCours(planStat.prochain ?? planStat.next ?? null);
        setAbonnement(abo);
        setPlanning(Array.isArray(planList) ? planList : []);
        setLoading(false);
      } catch (e) {
        setErr(e.message || "Erreur inconnue");
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // fallback si la route stats ne renvoie pas le prochain cours
  const prochainCoursFallback = useMemo(() => {
    if (prochainCours) return prochainCours;
    const now = new Date();
    const futurs = planning
      .map(c => ({ ...c, _start: new Date(c.start) }))
      .filter(c => c._start > now)
      .sort((a, b) => a._start - b._start);
    return futurs[0] || null;
  }, [prochainCours, planning]);

  if (loading) return <div className="pt-28 px-4 max-w-6xl mx-auto">Chargement…</div>;
  if (err) return <div className="pt-28 px-4 max-w-6xl mx-auto text-red-600">Erreur : {err}</div>;

  return (
    <div className="pt-28 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "Trajan, serif" }}>
            CRM Professeur
          </h1>
          <p className="text-sm text-gray-500">Vue d’ensemble : élèves, agenda, messages, abonnement.</p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Élèves actifs" value={elevesCount} />
          <Card
            title="Prochain cours"
            value={
              prochainCoursFallback
                ? new Date(prochainCoursFallback.start).toLocaleString()
                : "Aucun"
            }
          />
          <Card title="Messages non lus" value={messagesNonLus} />
          <Card
            title="Abonnement"
            value={
              abonnement?.actif === true || abonnement?.active === true ? "Actif" : "Inactif"
            }
          />
        </div>

        {/* Agenda simple */}
        <section className="space-y-3">
          <h2 className="text-xl font-medium">Agenda (semaine)</h2>
          <div className="space-y-2">
            {planning.length === 0 && (
              <div className="text-sm text-gray-500">Aucun créneau.</div>
            )}
            {planning.slice(0, 10).map((item) => (
              <div key={item.id} className="rounded-2xl border p-4 shadow-sm">
                <div className="text-sm">
                  <b>{item.jour ?? "-"}</b> — {item.type_creneau ?? "?"}
                </div>
                <div className="text-sm">
                  {item.start ? new Date(item.start).toLocaleString() : "-"} →{" "}
                  {item.end ? new Date(item.end).toLocaleString() : "-"}
                </div>
                <div className="text-xs text-gray-500">
                  Matin: {String(item.matin)} · Après-midi: {String(item.apres_midi)} · Soir: {String(item.soir)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{String(value)}</div>
    </div>
  );
}
