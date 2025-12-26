import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios";
import { Save, AlertCircle, CheckCircle } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const DashboardProfil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    cursus: "",
    presentation_institut: "",
    nombre_professeurs: 0,
    nombre_secretaires: 0,
    nombre_superviseurs: 0,
    nombre_responsables_pedagogiques: 0,
    nombre_gestionnaires: 0,
    programme: "",
    livres: "",
    methodologie: "",
    presentation_video_url: "",
    image_url: "",
    matieres: [],
    formats: [],
    type_classe: [],
    niveaux: [],
    langues: [],
    public_cible: [],
    prix_min: "",
    prix_max: "",
    premier_cours_gratuit: false,
    ville: "",
    pays: "France",
    adresse: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/merkez/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setFormData({
        ...response.data,
        matieres: response.data.matieres || [],
        formats: response.data.formats || [],
        type_classe: response.data.type_classe || [],
        niveaux: response.data.niveaux || [],
        langues: response.data.langues || [],
        public_cible: response.data.public_cible || [],
        prix_min: response.data.prix_min || "",
        prix_max: response.data.prix_max || ""
      });
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setError("");
    setSuccess(false);
  };

  const handleArrayChange = (name, value) => {
    setFormData((prev) => {
      const currentArray = prev[name] || [];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [name]: currentArray.filter((item) => item !== value)
        };
      } else {
        return {
          ...prev,
          [name]: [...currentArray, value]
        };
      }
    });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      // Prepare data
      const dataToSend = {
        ...formData,
        prix_min: formData.prix_min ? parseFloat(formData.prix_min) : null,
        prix_max: formData.prix_max ? parseFloat(formData.prix_max) : null,
        nombre_professeurs: formData.nombre_professeurs ? parseInt(formData.nombre_professeurs) : 0,
        nombre_secretaires: formData.nombre_secretaires ? parseInt(formData.nombre_secretaires) : 0,
        nombre_superviseurs: formData.nombre_superviseurs ? parseInt(formData.nombre_superviseurs) : 0,
        nombre_responsables_pedagogiques: formData.nombre_responsables_pedagogiques ? parseInt(formData.nombre_responsables_pedagogiques) : 0,
        nombre_gestionnaires: formData.nombre_gestionnaires ? parseInt(formData.nombre_gestionnaires) : 0
      };

      await axios.put(`${API_URL}/api/merkez/me`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      setSuccess(true);
      setSaving(false);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setError(
        error.response?.data?.detail ||
          "Une erreur est survenue lors de l'enregistrement"
      );
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isProfesseur = user?.type === "professeur";
  const isInstitut = user?.type === "institut";

  const matieresOptions = [
    { value: "coran", label: "Coran" },
    { value: "arabe", label: "Arabe" },
    { value: "tajwid", label: "Tajwid" },
    { value: "tafsir", label: "Tafsir" },
    { value: "fiqh", label: "Fiqh" },
    { value: "hadith", label: "Hadith" },
    { value: "aqida", label: "Aqida" },
    { value: "sira", label: "Sira" }
  ];

  const formatsOptions = [
    { value: "en-ligne", label: "En ligne" },
    { value: "presentiel", label: "Présentiel" },
    { value: "en-differe", label: "En différé" }
  ];

  const typeClasseOptions = [
    { value: "seul", label: "Cours individuels" },
    { value: "binome", label: "Binôme" },
    { value: "groupes", label: "Groupes" }
  ];

  const niveauxOptions = [
    { value: "debutant", label: "Débutant" },
    { value: "intermediaire", label: "Intermédiaire" },
    { value: "avance", label: "Avancé" }
  ];

  const languesOptions = [
    { value: "francais", label: "Français" },
    { value: "arabe", label: "Arabe" },
    { value: "anglais", label: "Anglais" }
  ];

  const publicCibleOptions = [
    { value: "hommes", label: "Hommes" },
    { value: "femmes", label: "Femmes" },
    { value: "garcons", label: "Garçons" },
    { value: "filles", label: "Filles" }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-600 mt-1">
            Complétez votre profil pour être visible sur Maraakiz
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-start space-x-3">
            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-700">Profil mis à jour avec succès !</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informations générales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom {isProfesseur ? "du professeur" : "de l'institut"}
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
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
            </div>
          </div>

          {/* Présentation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isProfesseur ? "Cursus" : "Présentation"}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isProfesseur
                  ? "Parcours académique et professionnel"
                  : "Présentation de l'institut"}
              </label>
              <textarea
                name={isProfesseur ? "cursus" : "presentation_institut"}
                value={isProfesseur ? formData.cursus : formData.presentation_institut}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                placeholder={isProfesseur
                  ? "Décrivez votre parcours, vos diplômes, vos expériences..."
                  : "Présentez votre institut, son histoire, sa mission..."}
              ></textarea>
            </div>
          </div>

          {/* Infrastructure (Institut uniquement) */}
          {isInstitut && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Infrastructure
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professeurs
                  </label>
                  <input
                    type="number"
                    name="nombre_professeurs"
                    value={formData.nombre_professeurs}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secrétaires
                  </label>
                  <input
                    type="number"
                    name="nombre_secretaires"
                    value={formData.nombre_secretaires}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Superviseurs
                  </label>
                  <input
                    type="number"
                    name="nombre_superviseurs"
                    value={formData.nombre_superviseurs}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsables pédagogiques
                  </label>
                  <input
                    type="number"
                    name="nombre_responsables_pedagogiques"
                    value={formData.nombre_responsables_pedagogiques}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gestionnaires
                  </label>
                  <input
                    type="number"
                    name="nombre_gestionnaires"
                    value={formData.nombre_gestionnaires}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pédagogie */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pédagogie</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programme enseigné
                </label>
                <textarea
                  name="programme"
                  value={formData.programme}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  placeholder="Décrivez le programme de vos cours..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Livres et supports
                </label>
                <textarea
                  name="livres"
                  value={formData.livres}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  placeholder="Livres, manuels, supports pédagogiques utilisés..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthodologie
                </label>
                <textarea
                  name="methodologie"
                  value={formData.methodologie}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  placeholder="Votre approche pédagogique, vos méthodes d'enseignement..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Matières enseignées */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Matières enseignées
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {matieresOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.matieres.includes(option.value)}
                    onChange={() => handleArrayChange("matieres", option.value)}
                    className="w-5 h-5 text-[#437C8B] rounded focus:ring-[#437C8B]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Format de cours */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Format de cours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {formatsOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.formats.includes(option.value)}
                    onChange={() => handleArrayChange("formats", option.value)}
                    className="w-5 h-5 text-[#437C8B] rounded focus:ring-[#437C8B]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Type de classe */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Type de classe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {typeClasseOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.type_classe.includes(option.value)}
                    onChange={() => handleArrayChange("type_classe", option.value)}
                    className="w-5 h-5 text-[#437C8B] rounded focus:ring-[#437C8B]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Niveaux */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Niveaux acceptés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {niveauxOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.niveaux.includes(option.value)}
                    onChange={() => handleArrayChange("niveaux", option.value)}
                    className="w-5 h-5 text-[#437C8B] rounded focus:ring-[#437C8B]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Langues */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Langues d'enseignement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {languesOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.langues.includes(option.value)}
                    onChange={() => handleArrayChange("langues", option.value)}
                    className="w-5 h-5 text-[#437C8B] rounded focus:ring-[#437C8B]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Public cible */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Public cible
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {publicCibleOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl border-2 border-gray-200 hover:border-[#437C8B] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.public_cible.includes(option.value)}
                    onChange={() => handleArrayChange("public_cible", option.value)}
                    className="w-5 h-5 text-[#437C8B] rounded focus:ring-[#437C8B]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tarifs */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Tarification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix minimum (€/heure)
                </label>
                <input
                  type="number"
                  name="prix_min"
                  value={formData.prix_min}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix maximum (€/heure)
                </label>
                <input
                  type="number"
                  name="prix_max"
                  value={formData.prix_max}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="premier_cours_gratuit"
                    checked={formData.premier_cours_gratuit}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#437C8B] rounded focus:ring-[#437C8B]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Premier cours gratuit
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Localisation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  name="pays"
                  value={formData.pays}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse (si présentiel)
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Médias */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Médias
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la vidéo de présentation
                </label>
                <input
                  type="url"
                  name="presentation_video_url"
                  value={formData.presentation_video_url}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de votre photo de profil
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
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
                  <span>Enregistrer mon profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DashboardProfil;
