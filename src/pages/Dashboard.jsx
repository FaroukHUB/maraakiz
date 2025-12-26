import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    setLoading(false);
  }, [navigate]);

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
      value: "0",
      icon: Users,
      color: "bg-blue-500",
      description: "Aucun élève pour le moment"
    },
    {
      title: "Cours donnés",
      value: "0",
      icon: BookOpen,
      color: "bg-green-500",
      description: "Total de cours"
    },
    {
      title: "Prochains cours",
      value: "0",
      icon: Calendar,
      color: "bg-purple-500",
      description: "Cette semaine"
    },
    {
      title: "Messages",
      value: "0",
      icon: MessageSquare,
      color: "bg-orange-500",
      description: "Non lus"
    }
  ];

  // Stats for students
  const studentStats = [
    {
      title: "Mes professeurs",
      value: "0",
      icon: Users,
      color: "bg-blue-500",
      description: "Professeurs actifs"
    },
    {
      title: "Cours suivis",
      value: "0",
      icon: BookOpen,
      color: "bg-green-500",
      description: "Total de cours"
    },
    {
      title: "Prochains cours",
      value: "0",
      icon: Calendar,
      color: "bg-purple-500",
      description: "Cette semaine"
    },
    {
      title: "Messages",
      value: "0",
      icon: MessageSquare,
      color: "bg-orange-500",
      description: "Non lus"
    }
  ];

  const stats = user?.type === "eleve" ? studentStats : professorStats;

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
          {stats.map((stat, index) => {
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
