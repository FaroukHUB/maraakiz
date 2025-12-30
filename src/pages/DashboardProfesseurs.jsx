import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Key,
  Copy
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const DashboardProfesseurs = () => {
  const navigate = useNavigate();
  const [professeurs, setProfesseurs] = useState([]);
  const [filteredProfesseurs, setFilteredProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [professeurToDelete, setProfesseurToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newProfesseur, setNewProfesseur] = useState({
    nom: "",
    email: "",
    telephone: "",
    genre: "homme"
  });
  const [createdPassword, setCreatedPassword] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProfesseurs();
  }, []);

  useEffect(() => {
    filterProfesseurs();
  }, [searchTerm, filterStatus, professeurs]);

  const fetchProfesseurs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/professeurs/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProfesseurs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des professeurs:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      setLoading(false);
    }
  };

  const filterProfesseurs = () => {
    let filtered = professeurs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (prof) =>
          prof.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prof.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "tous") {
      const isActive = filterStatus === "actif";
      filtered = filtered.filter((prof) => prof.is_active === isActive);
    }

    setFilteredProfesseurs(filtered);
  };

  const handleCreateProfesseur = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/professeurs/`,
        newProfesseur,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Show password modal with the temporary password
      setCreatedPassword(response.data.temp_password);
      setShowPasswordModal(true);
      setShowCreateModal(false);

      // Reset form
      setNewProfesseur({
        nom: "",
        email: "",
        telephone: "",
        genre: "homme"
      });

      // Refresh list
      fetchProfesseurs();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert(error.response?.data?.detail || "Erreur lors de la création du professeur");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!professeurToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/professeurs/${professeurToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh list
      fetchProfesseurs();
      setShowDeleteModal(false);
      setProfesseurToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du professeur");
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(createdPassword);
    alert("Mot de passe copié dans le presse-papiers !");
  };

  const getStatutBadge = (isActive) => {
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isActive ? "Actif" : "Inactif"}
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
            <h1 className="text-3xl font-bold text-gray-900">Mes professeurs</h1>
            <p className="text-gray-600 mt-1">
              {filteredProfesseurs.length} professeur{filteredProfesseurs.length > 1 ? "s" : ""} salarié{filteredProfesseurs.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-[#437C8B] text-white px-6 py-3 rounded-xl hover:bg-[#35626f] transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            <span className="font-medium">Ajouter un professeur</span>
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
                placeholder="Rechercher par nom ou email..."
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
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredProfesseurs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <UserX size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun professeur trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "tous"
                ? "Essayez de modifier vos filtres de recherche"
                : "Commencez par ajouter votre premier professeur salarié"}
            </p>
            {!searchTerm && filterStatus === "tous" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 bg-[#437C8B] text-white px-6 py-3 rounded-xl hover:bg-[#35626f] transition-all"
              >
                <Plus size={20} />
                <span>Ajouter un professeur</span>
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
                      Professeur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date création
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProfesseurs.map((prof) => (
                    <tr
                      key={prof.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            {prof.avatar_url ? (
                              <img
                                src={prof.avatar_url}
                                alt={prof.nom}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#437C8B] flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {prof.nom.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {prof.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {prof.genre === "homme" ? "👨‍🏫" : "👩‍🏫"} Professeur
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail size={14} className="mr-2 text-gray-400" />
                            {prof.email}
                          </div>
                          {prof.telephone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone size={14} className="mr-2 text-gray-400" />
                              {prof.telephone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatutBadge(prof.is_active)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(prof.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setProfesseurToDelete(prof);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ajouter un professeur salarié
            </h2>

            <form onSubmit={handleCreateProfesseur} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={newProfesseur.nom}
                  onChange={(e) =>
                    setNewProfesseur({ ...newProfesseur, nom: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  placeholder="Ex: Ahmed Benali"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newProfesseur.email}
                  onChange={(e) =>
                    setNewProfesseur({ ...newProfesseur, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  placeholder="professeur@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={newProfesseur.telephone}
                  onChange={(e) =>
                    setNewProfesseur({ ...newProfesseur, telephone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre *
                </label>
                <select
                  required
                  value={newProfesseur.genre}
                  onChange={(e) =>
                    setNewProfesseur({ ...newProfesseur, genre: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                >
                  <option value="homme">👨‍🏫 Homme</option>
                  <option value="femme">👩‍🏫 Femme</option>
                </select>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex">
                  <Key size={20} className="text-blue-400 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    Un mot de passe temporaire sera généré automatiquement et affiché après la création.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-[#437C8B] text-white rounded-xl hover:bg-[#35626f] transition-all font-medium disabled:opacity-50"
                >
                  {creating ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Professeur créé avec succès !
              </h2>
              <p className="text-gray-600 mb-6">
                Veuillez noter le mot de passe temporaire ci-dessous
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Mot de passe temporaire</p>
                <div className="flex items-center justify-between bg-white rounded-lg p-3 border-2 border-[#437C8B]">
                  <code className="text-lg font-mono font-bold text-[#437C8B]">
                    {createdPassword}
                  </code>
                  <button
                    onClick={copyPassword}
                    className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Copier"
                  >
                    <Copy size={18} className="text-[#437C8B]" />
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
                <p className="text-sm text-yellow-700">
                  ⚠️ Assurez-vous de partager ce mot de passe avec le professeur de manière sécurisée. Il ne pourra plus être récupéré.
                </p>
              </div>

              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-full px-6 py-3 bg-[#437C8B] text-white rounded-xl hover:bg-[#35626f] transition-all font-medium"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirmer la suppression
            </h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le professeur{" "}
              <strong>{professeurToDelete?.nom}</strong> ? Cette action est
              irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
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

export default DashboardProfesseurs;
