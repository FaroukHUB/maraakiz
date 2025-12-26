import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios";
import { Save, X, AlertCircle } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const DashboardEleveForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    date_naissance: "",
    genre: "",
    nom_parent: "",
    telephone_parent: "",
    email_parent: "",
    niveau: "",
    matieres: "",
    objectifs: "",
    type_cours: "",
    frequence_cours: "",
    duree_cours: "",
    tarif_heure: "",
    notes: "",
    commentaire_general: ""
  });

  useEffect(() => {
    if (isEdit) {
      fetchEleve();
    }
  }, [id]);

  const fetchEleve = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/eleves/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Convert date format
      const eleveData = response.data;
      if (eleveData.date_naissance) {
        eleveData.date_naissance = eleveData.date_naissance.split("T")[0];
      }

      setFormData(eleveData);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement de l'élève:", error);
      setError("Impossible de charger les informations de l'élève");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Validation
    if (!formData.nom || !formData.prenom) {
      setError("Le nom et le prénom sont obligatoires");
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Prepare data (convert empty strings to null for numbers)
      const dataToSend = {
        ...formData,
        duree_cours: formData.duree_cours ? parseInt(formData.duree_cours) : null,
        tarif_heure: formData.tarif_heure ? parseInt(formData.tarif_heure) : null,
        date_naissance: formData.date_naissance || null
      };

      if (isEdit) {
        await axios.put(`${API_URL}/api/eleves/${id}`, dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } else {
        await axios.post(`${API_URL}/api/eleves/`, dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }

      navigate("/dashboard/eleves");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setError(
        error.response?.data?.detail ||
          "Une erreur est survenue lors de l'enregistrement"
      );
      setSaving(false);
    }
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
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Modifier l'élève" : "Ajouter un élève"}
          </h1>
          <p className="text-gray-600 mt-1">
            Remplissez les informations de l'élève
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informations personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                  <option value="garcon">Garçon</option>
                  <option value="fille">Fille</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact parent */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Contact parent/tuteur (si mineur)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du parent/tuteur
                </label>
                <input
                  type="text"
                  name="nom_parent"
                  value={formData.nom_parent}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone parent
                </label>
                <input
                  type="tel"
                  name="telephone_parent"
                  value={formData.telephone_parent}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email parent
                </label>
                <input
                  type="email"
                  name="email_parent"
                  value={formData.email_parent}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Informations académiques */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informations académiques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau
                </label>
                <select
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matières (séparées par des virgules)
                </label>
                <input
                  type="text"
                  name="matieres"
                  value={formData.matieres}
                  onChange={handleChange}
                  placeholder="Coran, Arabe, Tajwid"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectifs d'apprentissage
                </label>
                <textarea
                  name="objectifs"
                  value={formData.objectifs}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Informations de cours */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informations de cours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de cours
                </label>
                <select
                  name="type_cours"
                  value={formData.type_cours}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="en-ligne">En ligne</option>
                  <option value="presentiel">Présentiel</option>
                  <option value="en-differe">En différé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence des cours
                </label>
                <input
                  type="text"
                  name="frequence_cours"
                  value={formData.frequence_cours}
                  onChange={handleChange}
                  placeholder="2x/semaine"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée du cours (minutes)
                </label>
                <input
                  type="number"
                  name="duree_cours"
                  value={formData.duree_cours}
                  onChange={handleChange}
                  placeholder="60"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarif horaire (€)
                </label>
                <input
                  type="number"
                  name="tarif_heure"
                  value={formData.tarif_heure}
                  onChange={handleChange}
                  placeholder="20"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes et commentaires */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Notes et commentaires
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes personnelles
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire général
                </label>
                <textarea
                  name="commentaire_general"
                  value={formData.commentaire_general}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/eleves")}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              <X size={20} />
              <span>Annuler</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center space-x-2 bg-[#437C8B] text-white px-6 py-3 rounded-xl hover:bg-[#35626f] transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>{isEdit ? "Enregistrer" : "Ajouter l'élève"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DashboardEleveForm;
