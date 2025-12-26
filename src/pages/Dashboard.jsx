import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  FileText,
  Award
} from "lucide-react";

const API_URL = "http://localhost:8000";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [studentPayments, setStudentPayments] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchDashboardData(parsedUser, token);
  }, [navigate]);

  const fetchDashboardData = async (userData, token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (userData.type === "prof" || userData.type === "professeur") {
        // Fetch students count
        const elevesRes = await axios.get(`${API_URL}/api/eleves`, { headers });
        const elevesCount = elevesRes.data.length;

        // Fetch courses count
        const coursRes = await axios.get(`${API_URL}/api/cours`, { headers });
        const coursCount = coursRes.data.length;

        // Fetch payment stats
        const paymentRes = await axios.get(`${API_URL}/api/paiements/stats/overview`, { headers });
        setPaymentStats(paymentRes.data);

        // Fetch students with late payments
        const latePaymentsRes = await axios.get(`${API_URL}/api/paiements?statut=en_retard`, { headers });

        setStats({
          elevesCount,
          coursCount,
          latePaymentsCount: latePaymentsRes.data.length
        });
      } else if (userData.type === "eleve") {
        // Fetch student's course notes
        const notesRes = await axios.get(`${API_URL}/api/notes-cours/eleve/${userData.id}`, { headers });
        setRecentNotes(notesRes.data.slice(0, 3)); // Last 3 notes

        // Fetch student's payments
        const paymentsRes = await axios.get(`${API_URL}/api/paiements/student/${userData.id}`, { headers });
        setStudentPayments(paymentsRes.data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#437C8B]"></div>
      </div>
    );
  }

  // Stats for professors/institutes
  const professorStats = [
    {
      title: "Élèves actifs",
      value: stats?.elevesCount || "0",
      icon: Users,
      color: "bg-blue-500",
      description: stats?.elevesCount > 0 ? "Élèves inscrits" : "Aucun élève pour le moment"
    },
    {
      title: "Cours donnés",
      value: stats?.coursCount || "0",
      icon: BookOpen,
      color: "bg-green-500",
      description: "Total de cours"
    },
    {
      title: "Total à recevoir",
      value: paymentStats ? `${(paymentStats.total_restant || 0).toFixed(0)} €` : "0 €",
      icon: DollarSign,
      color: "bg-emerald-500",
      description: "Paiements en attente"
    },
    {
      title: "Paiements en retard",
      value: stats?.latePaymentsCount || "0",
      icon: AlertCircle,
      color: stats?.latePaymentsCount > 0 ? "bg-red-500" : "bg-orange-500",
      description: stats?.latePaymentsCount > 0 ? "Élèves en retard" : "Tous à jour"
    }
  ];

  // Stats for students
  const unpaidPayments = studentPayments?.filter(p => p.statut === "impaye" || p.statut === "en_retard") || [];
  const totalDue = unpaidPayments.reduce((sum, p) => sum + (p.montant_du - p.montant_paye), 0);

  const studentStats = [
    {
      title: "Notes de cours",
      value: recentNotes?.length || "0",
      icon: FileText,
      color: "bg-blue-500",
      description: "Résumés disponibles"
    },
    {
      title: "Progression",
      value: recentNotes?.length > 0 && recentNotes[0]?.progression_pourcentage
        ? `${recentNotes[0].progression_pourcentage}%`
        : "N/A",
      icon: Award,
      color: "bg-green-500",
      description: "Dernier cours"
    },
    {
      title: "Paiements dus",
      value: `${totalDue.toFixed(0)} €`,
      icon: DollarSign,
      color: totalDue > 0 ? "bg-orange-500" : "bg-emerald-500",
      description: totalDue > 0 ? "À régler" : "Tous payés"
    },
    {
      title: "Messages",
      value: "0",
      icon: MessageSquare,
      color: "bg-purple-500",
      description: "Non lus"
    }
  ];

  const dashboardStats = user?.type === "eleve" ? studentStats : professorStats;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {user?.nom} ! 👋
          </h1>
          <p className="text-gray-600">
            {user?.type === "eleve"
              ? "Voici un aperçu de votre progression et de vos cours."
              : "Voici un aperçu de votre activité et de vos élèves."}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Payment alerts for professors */}
        {(user?.type === "prof" || user?.type === "professeur") && stats?.latePaymentsCount > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mt-1 mr-3" size={24} />
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  ⚠️ Paiements en retard
                </h3>
                <p className="text-red-700">
                  Vous avez <strong>{stats.latePaymentsCount} élève(s)</strong> avec des paiements en retard.
                </p>
                <button
                  onClick={() => navigate("/dashboard/eleves")}
                  className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Voir les détails
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent course notes for students */}
        {user?.type === "eleve" && recentNotes?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📚 Mes derniers cours
            </h2>
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <div key={note.id} className="border-l-4 border-[#437C8B] bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Cours du {new Date(note.created_at).toLocaleDateString('fr-FR')}
                    </h3>
                    {note.note && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {note.note}
                      </span>
                    )}
                  </div>
                  {note.resume && (
                    <p className="text-gray-700 mb-2">
                      <strong>Résumé :</strong> {note.resume}
                    </p>
                  )}
                  {note.devoirs && (
                    <p className="text-orange-700">
                      <strong>📝 Devoirs :</strong> {note.devoirs}
                    </p>
                  )}
                  {note.progression_pourcentage && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progression</span>
                        <span className="font-semibold">{note.progression_pourcentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#437C8B] h-2 rounded-full transition-all"
                          style={{ width: `${note.progression_pourcentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.type === "eleve" ? (
              <>
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] hover:bg-[#437C8B]/5 transition-all"
                >
                  <Users className="text-[#437C8B]" size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      Trouver un professeur
                    </p>
                    <p className="text-sm text-gray-500">
                      Parcourir les profils
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/dashboard/mes-cours")}
                  className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] hover:bg-[#437C8B]/5 transition-all"
                >
                  <BookOpen className="text-[#437C8B]" size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Mes cours</p>
                    <p className="text-sm text-gray-500">Voir mon planning</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/dashboard/messages")}
                  className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] hover:bg-[#437C8B]/5 transition-all"
                >
                  <MessageSquare className="text-[#437C8B]" size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Messages</p>
                    <p className="text-sm text-gray-500">Contacter un prof</p>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/dashboard/eleves")}
                  className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] hover:bg-[#437C8B]/5 transition-all"
                >
                  <Users className="text-[#437C8B]" size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      Gérer mes élèves
                    </p>
                    <p className="text-sm text-gray-500">
                      Ajouter ou modifier
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/dashboard/calendrier")}
                  className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] hover:bg-[#437C8B]/5 transition-all"
                >
                  <Calendar className="text-[#437C8B]" size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      Planifier un cours
                    </p>
                    <p className="text-sm text-gray-500">Gérer le calendrier</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/dashboard/profil")}
                  className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] hover:bg-[#437C8B]/5 transition-all"
                >
                  <CheckCircle className="text-[#437C8B]" size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      Compléter mon profil
                    </p>
                    <p className="text-sm text-gray-500">
                      Être visible sur Maraakiz
                    </p>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Activité récente
          </h2>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Clock size={48} className="mb-4" />
            <p className="text-lg font-medium">Aucune activité récente</p>
            <p className="text-sm">
              {user?.type === "eleve"
                ? "Commencez par trouver un professeur"
                : "Commencez par ajouter vos premiers élèves"}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
