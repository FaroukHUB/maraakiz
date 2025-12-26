import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios";
import {
  Edit,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Clock,
  Euro,
  User,
  FileText,
  AlertCircle
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const DashboardEleveDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [eleve, setEleve] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchEleve();
  }, [id]);

  const fetchEleve = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/eleves/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEleve(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement de l'élève:", error);
      if (error.response?.status === 404) {
        navigate("/dashboard/eleves");
      }
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/eleves/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      navigate("/dashboard/eleves");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de l'élève");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getStatutBadge = (statut) => {
    const styles = {
      actif: "bg-green-100 text-green-800",
      inactif: "bg-gray-100 text-gray-800",
      suspendu: "bg-red-100 text-red-800"
    };

    return (
      <span
        className={`px-4 py-2 rounded-full text-sm font-medium ${
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

  if (!eleve) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">
            Élève non trouvé
          </h3>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard/eleves")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {eleve.prenom} {eleve.nom}
              </h1>
              <div className="flex items-center space-x-3 mt-2">
                {getStatutBadge(eleve.statut)}
                <span className="text-gray-500 capitalize">{eleve.genre}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/dashboard/eleves/${id}/modifier`)}
              className="flex items-center space-x-2 bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700 transition-all shadow-md"
            >
              <Edit size={18} />
              <span>Modifier</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700 transition-all shadow-md"
            >
              <Trash2 size={18} />
              <span>Supprimer</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-3">
                {eleve.email && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Mail className="text-[#437C8B]" size={20} />
                    <a
                      href={`mailto:${eleve.email}`}
                      className="hover:text-[#437C8B]"
                    >
                      {eleve.email}
                    </a>
                  </div>
                )}
                {eleve.telephone && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Phone className="text-[#437C8B]" size={20} />
                    <a
                      href={`tel:${eleve.telephone}`}
                      className="hover:text-[#437C8B]"
                    >
                      {eleve.telephone}
                    </a>
                  </div>
                )}
                {eleve.adresse && (
                  <div className="flex items-start space-x-3 text-gray-700">
                    <MapPin className="text-[#437C8B] flex-shrink-0" size={20} />
                    <div>
                      <p>{eleve.adresse}</p>
                      <p>
                        {eleve.code_postal} {eleve.ville}
                      </p>
                      <p>{eleve.pays}</p>
                    </div>
                  </div>
                )}
                {eleve.date_naissance && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Calendar className="text-[#437C8B]" size={20} />
                    <span>Né(e) le {formatDate(eleve.date_naissance)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact parent */}
            {(eleve.nom_parent || eleve.telephone_parent || eleve.email_parent) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Contact parent/tuteur
                </h2>
                <div className="space-y-3">
                  {eleve.nom_parent && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <User className="text-[#437C8B]" size={20} />
                      <span>{eleve.nom_parent}</span>
                    </div>
                  )}
                  {eleve.email_parent && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Mail className="text-[#437C8B]" size={20} />
                      <a
                        href={`mailto:${eleve.email_parent}`}
                        className="hover:text-[#437C8B]"
                      >
                        {eleve.email_parent}
                      </a>
                    </div>
                  )}
                  {eleve.telephone_parent && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Phone className="text-[#437C8B]" size={20} />
                      <a
                        href={`tel:${eleve.telephone_parent}`}
                        className="hover:text-[#437C8B]"
                      >
                        {eleve.telephone_parent}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informations académiques */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Informations académiques
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Niveau</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {eleve.niveau || "Non défini"}
                  </p>
                </div>
                {eleve.matieres && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Matières</p>
                    <p className="font-medium text-gray-900">{eleve.matieres}</p>
                  </div>
                )}
                {eleve.objectifs && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Objectifs</p>
                    <p className="text-gray-900">{eleve.objectifs}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes et commentaires */}
            {(eleve.notes || eleve.commentaire_general) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText size={24} />
                  <span>Notes et commentaires</span>
                </h2>
                <div className="space-y-4">
                  {eleve.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Notes personnelles
                      </p>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {eleve.notes}
                      </p>
                    </div>
                  )}
                  {eleve.commentaire_general && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Commentaire général
                      </p>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {eleve.commentaire_general}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Stats & Course info */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Statistiques
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="text-blue-600" size={20} />
                    <span className="text-gray-700">Cours suivis</span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {eleve.nombre_cours_suivis}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="text-red-600" size={20} />
                    <span className="text-gray-700">Absences</span>
                  </div>
                  <span className="font-bold text-red-600">
                    {eleve.nombre_absences}
                  </span>
                </div>

                {eleve.date_dernier_cours && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Dernier cours</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(eleve.date_dernier_cours)}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Inscription</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(eleve.date_inscription)}
                  </p>
                </div>
              </div>
            </div>

            {/* Course info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Informations de cours
              </h2>
              <div className="space-y-3">
                {eleve.type_cours && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Type de cours</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {eleve.type_cours.replace("-", " ")}
                    </p>
                  </div>
                )}
                {eleve.frequence_cours && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fréquence</p>
                    <p className="font-medium text-gray-900">
                      {eleve.frequence_cours}
                    </p>
                  </div>
                )}
                {eleve.duree_cours && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Clock className="text-purple-600" size={20} />
                      <span className="text-gray-700">Durée</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {eleve.duree_cours} min
                    </span>
                  </div>
                )}
                {eleve.tarif_heure && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Euro className="text-green-600" size={20} />
                      <span className="text-gray-700">Tarif/h</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {eleve.tarif_heure}€
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
                {eleve.prenom} {eleve.nom}
              </span>{" "}
              ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
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

export default DashboardEleveDetail;
