import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  UserCheck,
  UserX,
  Mail,
  Phone
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const DashboardEleves = () => {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState([]);
  const [filteredEleves, setFilteredEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eleveToDelete, setEleveToDelete] = useState(null);

  useEffect(() => {
    fetchEleves();
  }, []);

  useEffect(() => {
    filterEleves();
  }, [searchTerm, filterStatus, eleves]);

  const fetchEleves = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/eleves/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEleves(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des élèves:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      setLoading(false);
    }
  };

  const filterEleves = () => {
    let filtered = eleves;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (eleve) =>
          eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eleve.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "tous") {
      filtered = filtered.filter((eleve) => eleve.statut === filterStatus);
    }

    setFilteredEleves(filtered);
  };

  const handleDelete = async () => {
    if (!eleveToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/eleves/${eleveToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh list
      fetchEleves();
      setShowDeleteModal(false);
      setEleveToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de l'élève");
    }
  };

  const getStatutBadge = (statut) => {
    const styles = {
      actif: "bg-green-100 text-green-800",
      inactif: "bg-gray-100 text-gray-800",
      suspendu: "bg-red-100 text-red-800"
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          styles[statut] || styles.actif
        }`}
      >
        {statut.charAt(0).toUpperCase() + statut.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#437C8B]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes élèves</h1>
            <p className="text-gray-600 mt-1">
              {filteredEleves.length} élève{filteredEleves.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/eleves/nouveau")}
            className="flex items-center space-x-2 bg-[#437C8B] text-white px-6 py-3 rounded-xl hover:bg-[#35626f] transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            <span className="font-medium">Ajouter un élève</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
              >
                <option value="tous">Tous les statuts</option>
                <option value="actif">Actifs</option>
                <option value="inactif">Inactifs</option>
                <option value="suspendu">Suspendus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredEleves.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <UserX size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun élève trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "tous"
                ? "Essayez de modifier vos filtres de recherche"
                : "Commencez par ajouter votre premier élève"}
            </p>
            {!searchTerm && filterStatus === "tous" && (
              <button
                onClick={() => navigate("/dashboard/eleves/nouveau")}
                className="inline-flex items-center space-x-2 bg-[#437C8B] text-white px-6 py-3 rounded-xl hover:bg-[#35626f] transition-all"
              >
                <Plus size={20} />
                <span>Ajouter un élève</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Niveau
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cours
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEleves.map((eleve) => (
                    <tr
                      key={eleve.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-[#437C8B] flex items-center justify-center text-white font-semibold">
                            {eleve.prenom.charAt(0)}
                            {eleve.nom.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {eleve.prenom} {eleve.nom}
                            </p>
                            <p className="text-sm text-gray-500">
                              {eleve.genre || "Non spécifié"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {eleve.email && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Mail size={14} />
                              <span>{eleve.email}</span>
                            </div>
                          )}
                          {eleve.telephone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Phone size={14} />
                              <span>{eleve.telephone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 capitalize">
                          {eleve.niveau || "Non défini"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 font-medium">
                            {eleve.nombre_cours_suivis} cours
                          </p>
                          <p className="text-gray-500">
                            {eleve.nombre_absences} absence
                            {eleve.nombre_absences > 1 ? "s" : ""}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatutBadge(eleve.statut)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/eleves/${eleve.id}`)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/dashboard/eleves/${eleve.id}/modifier`)
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEleveToDelete(eleve);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Supprimer l'élève
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-semibold">
                {eleveToDelete?.prenom} {eleveToDelete?.nom}
              </span>{" "}
              ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setEleveToDelete(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardEleves;
