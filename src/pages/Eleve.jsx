import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchJSON, postJSON, ENDPOINTS, MERKEZ_ID } from "../lib/api";

export default function Eleve() {
  const { id } = useParams();
  const [tab, setTab] = useState("aperçu"); // "aperçu" | "séances" | "messages" | "paiements"

  const [eleve, setEleve] = useState(null);
  const [planning, setPlanning] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pay, setPay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPay, setLoadingPay] = useState(true);
  const [err, setErr] = useState(null);

  // Rappel paiements
  const [autoRemind, setAutoRemind] = useState(true);
  const [remindDelay, setRemindDelay] = useState(3); // jours avant échéance

  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);

useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      const [e, plan, allMsgs] = await Promise.all([
        fetchJSON(ENDPOINTS.eleveById(id)),
        fetchJSON(ENDPOINTS.planning).catch(() => []),
        fetchJSON(ENDPOINTS.messages).catch(() => []),
      ]);

      // Paiements — ne JAMAIS appeler un endpoint absent
      let payments = null;
      try {
        const url = ENDPOINTS?.elevePayments ? ENDPOINTS.elevePayments(id) : null;
        payments = url ? await fetchJSON(url) : null;
      } catch {}
      if (!payments) {
        payments = { amount: 25, lastPaid: null, nextDue: null };
      }

      if (!mounted) return;

      setEleve(e);
      setPlanning(Array.isArray(plan) ? plan.filter(c => String(c.eleve_id) === String(id)) : []);
      setMessages(
        Array.isArray(allMsgs)
          ? allMsgs.filter(m =>
              (String(m.sender_id) === String(id) && m.sender_type === "eleve") ||
              (String(m.receiver_id) === String(id) && m.receiver_type === "eleve")
            )
          : []
      );
      setPay(payments);
      setLoading(false);
      setLoadingPay(false);
    } catch (e) {
      if (mounted) { setErr(e.message); setLoading(false); setLoadingPay(false); }
    }
  })();
  return () => { mounted = false; };
}, [id]);


  async function sendMessage() {
    if (!msgText.trim()) return;
    setSending(true);
    try {
      await postJSON(ENDPOINTS.messages, {
        sender_id: MERKEZ_ID,
        receiver_id: Number(id),
        sender_type: "merkez",
        receiver_type: "eleve",
        content: msgText.trim(),
      });
      setMsgText("");
    } catch (e) { alert(e.message); }
    finally { setSending(false); }
  }

  async function sendPaymentReminder() {
    try {
      await postJSON(ENDPOINTS.messages, {
        sender_id: MERKEZ_ID,
        receiver_id: Number(id),
        sender_type: "merkez",
        receiver_type: "eleve",
        content: `Bonjour ${eleve?.prenom || ""},\nPetit rappel : votre prochain paiement de ${pay?.amount ?? "—"} € est attendu pour le ${pay?.nextDue ? new Date(pay.nextDue).toLocaleDateString() : "—"}. Merci 🙏`,
      });
      alert("Rappel envoyé !");
    } catch (e) {
      alert("Erreur lors de l’envoi du rappel : " + e.message);
    }
  }

  if (loading) return <div className="pt-28 px-4 max-w-4xl mx-auto">Chargement…</div>;
  if (err) return <div className="pt-28 px-4 max-w-4xl mx-auto text-red-600">Erreur : {err}</div>;
  if (!eleve) return <div className="pt-28 px-4 max-w-4xl mx-auto">Introuvable.</div>;

  return (
    <div className="pt-28 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "Trajan, serif" }}>Fiche élève #{id}</h1>
          <Link to="/crm/eleves" className="text-sm underline text-blue-600 hover:text-blue-800">← Retour à la liste</Link>
        </div>

        {/* Onglets */}
        <div className="flex gap-2">
          <TabButton active={tab==="aperçu"} onClick={()=>setTab("aperçu")}>Aperçu</TabButton>
          <TabButton active={tab==="séances"} onClick={()=>setTab("séances")}>Séances</TabButton>
          <TabButton active={tab==="messages"} onClick={()=>setTab("messages")}>Messages</TabButton>
          <TabButton active={tab==="paiements"} onClick={()=>setTab("paiements")}>Paiements</TabButton>
        </div>

        {tab==="aperçu" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Nom" value={eleve.nom} />
            <Info label="Prénom" value={eleve.prenom} />
            <Info label="Niveau" value={eleve.niveau} />
            <Info label="Statut" value={eleve.statut} />
            <Info label="Remarques" value={eleve.remarques || "-"} />
            <Info label="Lien visio" value={eleve.lien_visio || "-"} link />
          </div>
        )}

        {tab==="paiements" && (
          <div className="space-y-4">
            {loadingPay ? (
              <div className="text-sm text-gray-500">Chargement…</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Kpi title="Montant" value={`${pay?.amount ?? 0} €`} />
                  <Kpi title="Dernier paiement" value={pay?.lastPaid ? new Date(pay.lastPaid).toLocaleDateString() : "—"} />
                  <Kpi title="Prochain paiement" value={pay?.nextDue ? new Date(pay.nextDue).toLocaleDateString() : "—"} />
                </div>
                <div className="space-y-2">
                  <button onClick={sendPaymentReminder} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm">
                    Envoyer un rappel
                  </button>
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={autoRemind}
                      onChange={e=>setAutoRemind(e.target.checked)}
                    />
                    <span>Rappels automatiques activés</span>
                  </div>
                  {autoRemind && (
                    <div className="flex items-center gap-2 text-sm">
                      Envoyer {remindDelay} jours avant l’échéance
                      <input
                        type="number"
                        className="border rounded w-16 p-1"
                        value={remindDelay}
                        onChange={e=>setRemindDelay(Number(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, link }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      {link && value !== "-" ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-sm underline text-blue-600 hover:text-blue-800">{value}</a>
      ) : (
        <div className="text-sm">{value}</div>
      )}
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-full text-sm border ${active ? "bg-black text-white" : "bg-white"}`}>
      {children}
    </button>
  );
}
