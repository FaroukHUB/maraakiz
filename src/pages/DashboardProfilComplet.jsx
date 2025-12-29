import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  User, Upload, Trash2, AlertCircle, Camera, Save,
  Globe, Phone, BookOpen, GraduationCap, Library,
  Target, Users, Calendar, MapPin, DollarSign,
  Facebook, Instagram, Linkedin, Twitter, Youtube
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DashboardProfilComplet = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const [formData, setFormData] = useState({
    // User fields
    full_name: '',
    genre: '',

    // Contact
    telephone: '',
    site_web: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    youtube: '',

    // Professional
    cursus: '',
    programme: '',
    livres: '',
    methodologie: '',
    presentation_institut: '',

    // Arrays
    matieres: [],
    formats: [],
    type_classe: [],
    niveaux: [],
    langues: [],
    public_cible: [],

    // Pricing
    prix_min: '',
    prix_max: '',
    premier_cours_gratuit: false,

    // Location
    ville: '',
    pays: 'France',
    adresse: ''
  });

  // Options for multi-select fields
  const matieresOptions = [
    { value: 'coran', label: '📖 Coran', emoji: '📖' },
    { value: 'arabe', label: '🔤 Arabe', emoji: '🔤' },
    { value: 'tajwid', label: '🎯 Tajwid', emoji: '🎯' },
    { value: 'aquida', label: '💫 Aquida', emoji: '💫' },
    { value: 'fiqh', label: '⚖️ Fiqh', emoji: '⚖️' },
    { value: 'hadith', label: '📚 Hadith', emoji: '📚' },
    { value: 'tafsir', label: '🔍 Tafsir', emoji: '🔍' }
  ];

  const formatsOptions = [
    { value: 'en-ligne', label: '💻 En ligne', emoji: '💻' },
    { value: 'presentiel', label: '🏢 Présentiel', emoji: '🏢' },
    { value: 'en-differe', label: '⏰ En différé', emoji: '⏰' }
  ];

  const typeClasseOptions = [
    { value: 'seul', label: '🔹 Cours individuel', emoji: '🔹' },
    { value: 'binome', label: '🔸 Binôme', emoji: '🔸' },
    { value: 'groupes', label: '💠 Groupes', emoji: '💠' }
  ];

  const niveauxOptions = [
    { value: 'debutant', label: '🌱 Débutant', emoji: '🌱' },
    { value: 'intermediaire', label: '🌿 Intermédiaire', emoji: '🌿' },
    { value: 'avance', label: '🌳 Avancé', emoji: '🌳' }
  ];

  const languesOptions = [
    { value: 'francais', label: '🇫🇷 Français', emoji: '🇫🇷' },
    { value: 'arabe', label: '🇸🇦 Arabe', emoji: '🇸🇦' },
    { value: 'anglais', label: '🇬🇧 Anglais', emoji: '🇬🇧' }
  ];

  const publicCibleOptions = [
    { value: 'homme', label: '🔵 Homme', emoji: '🔵' },
    { value: 'femme', label: '🟣 Femme', emoji: '🟣' },
    { value: 'garcon', label: '🔷 Garçon', emoji: '🔷' },
    { value: 'fille', label: '💜 Fille', emoji: '💜' }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/profile/complete`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      setProfile(data);

      setFormData({
        full_name: data.full_name || '',
        genre: data.genre || '',
        telephone: data.telephone || '',
        site_web: data.site_web || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        linkedin: data.linkedin || '',
        twitter: data.twitter || '',
        youtube: data.youtube || '',
        cursus: data.cursus || '',
        programme: data.programme || '',
        livres: data.livres || '',
        methodologie: data.methodologie || '',
        presentation_institut: data.presentation_institut || '',
        matieres: data.matieres || [],
        formats: data.formats || [],
        type_classe: data.type_classe || [],
        niveaux: data.niveaux || [],
        langues: data.langues || [],
        public_cible: data.public_cible || [],
        prix_min: data.prix_min || '',
        prix_max: data.prix_max || '',
        premier_cours_gratuit: data.premier_cours_gratuit || false,
        ville: data.ville || '',
        pays: data.pays || 'France',
        adresse: data.adresse || ''
      });

      setShowWarning(data.avatar_type === 'custom');
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger le profil');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      // Prepare data - convert empty strings to null for numbers
      const submitData = {
        ...formData,
        prix_min: formData.prix_min === '' ? null : parseFloat(formData.prix_min),
        prix_max: formData.prix_max === '' ? null : parseFloat(formData.prix_max)
      };

      const response = await axios.put(
        `${API_URL}/api/profile/complete`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setProfile(response.data);
      setSuccess('✅ Profil mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/api/profile/avatar/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      await fetchProfile();
      setSuccess(response.data.message);
      setShowWarning(true);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.detail || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Voulez-vous vraiment supprimer votre avatar personnalisé?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/profile/avatar`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchProfile();
      setSuccess(response.data.message);
      setShowWarning(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.detail || 'Erreur lors de la suppression');
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⚙️ Mon Profil Complet
          </h1>
          <p className="text-gray-600">Gérez toutes vos informations professionnelles</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-2xl p-4 flex items-start space-x-3">
            <AlertCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white rounded-2xl p-8 shadow-md border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Camera className="mr-3 text-[#437C8B]" size={28} />
              📸 Photo de Profil
            </h2>

            <div className="flex items-start space-x-8">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-40 h-40 rounded-full object-cover border-4 border-[#437C8B] shadow-lg"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#437C8B] to-[#5a99ab] flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-200 shadow-lg">
                    {profile?.full_name?.[0] || '?'}
                  </div>
                )}
                {profile?.avatar_type === 'custom' && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="absolute bottom-0 right-0 p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-xl hover:scale-110"
                    title="Supprimer l'avatar"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="flex-1">
                <label className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-[#437C8B] to-[#5a99ab] text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all cursor-pointer transform hover:scale-105">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="font-semibold">Upload en cours...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={22} />
                      <span className="font-semibold">
                        {profile?.avatar_type === 'custom' ? 'Changer la photo' : 'Télécharger une photo'}
                      </span>
                    </>
                  )}
                </label>

                <p className="text-sm text-gray-600 mt-4 mb-2">
                  📁 Formats: JPG, PNG, WEBP (max 5MB)
                </p>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mt-2 mb-4">
                  <p className="text-red-700 font-semibold flex items-center text-sm">
                    <AlertCircle size={18} className="mr-2" />
                    ⚠️ Photo d'âme interdite
                  </p>
                </div>

                {showWarning && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mt-4">
                    <p className="text-orange-700 font-semibold flex items-center text-sm">
                      <AlertCircle size={18} className="mr-2" />
                      ✅ Photo personnalisée uploadée
                    </p>
                  </div>
                )}

                {profile?.avatar_type === 'default' && formData.genre && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mt-4">
                    <p className="text-blue-700 text-sm">
                      ℹ️ Avatar par défaut {formData.genre === 'homme' ? 'masculin' : 'féminin'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-2xl p-8 shadow-md border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="mr-3 text-[#437C8B]" size={28} />
              ℹ️ Informations Personnelles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Genre *
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                >
                  <option value="">Sélectionner</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Non modifiable</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de compte
                </label>
                <input
                  type="text"
                  value={profile?.user_type === 'prof' ? 'Professeur' : 'Élève'}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Contact & Social Media */}
          <div className="bg-white rounded-2xl p-8 shadow-md border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Phone className="mr-3 text-[#437C8B]" size={28} />
              📞 Contact & Réseaux Sociaux
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📱 Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🌐 Site Web
                </label>
                <input
                  type="url"
                  name="site_web"
                  value={formData.site_web}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                  placeholder="https://votre-site.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Facebook size={16} className="mr-2 text-blue-600" />
                  Facebook
                </label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Instagram size={16} className="mr-2 text-pink-600" />
                  Instagram
                </label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Linkedin size={16} className="mr-2 text-blue-700" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Twitter size={16} className="mr-2 text-blue-400" />
                  Twitter
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Youtube size={16} className="mr-2 text-red-600" />
                  YouTube
                </label>
                <input
                  type="url"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          {profile?.user_type === 'prof' && (
            <>
              <div className="bg-white rounded-2xl p-8 shadow-md border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <GraduationCap className="mr-3 text-[#437C8B]" size={28} />
                  🎓 Informations Professionnelles
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📜 Cursus (Parcours académique et professionnel)
                    </label>
                    <textarea
                      name="cursus"
                      value={formData.cursus}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                      placeholder="Décrivez votre parcours académique et professionnel..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📋 Programme
                    </label>
                    <textarea
                      name="programme"
                      value={formData.programme}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                      placeholder="Décrivez votre programme d'enseignement..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📚 Livres et supports utilisés
                    </label>
                    <textarea
                      name="livres"
                      value={formData.livres}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                      placeholder="Listez les livres et supports que vous utilisez..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎯 Méthodologie
                    </label>
                    <textarea
                      name="methodologie"
                      value={formData.methodologie}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                      placeholder="Décrivez votre méthodologie pédagogique..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🏢 Présentation de l'institut
                    </label>
                    <textarea
                      name="presentation_institut"
                      value={formData.presentation_institut}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                      placeholder="Si vous représentez un institut, présentez-le ici..."
                    />
                  </div>
                </div>
              </div>

              {/* Teaching Details */}
              <div className="bg-white rounded-2xl p-8 shadow-md border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="mr-3 text-[#437C8B]" size={28} />
                  📖 Détails de l'Enseignement
                </h2>

                <div className="space-y-8">
                  {/* Matières */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Matières enseignées *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {matieresOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleArrayToggle('matieres', option.value)}
                          className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                            formData.matieres.includes(option.value)
                              ? 'bg-[#437C8B] border-[#437C8B] text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-[#437C8B]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Formats */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Format de cours *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {formatsOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleArrayToggle('formats', option.value)}
                          className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                            formData.formats.includes(option.value)
                              ? 'bg-[#437C8B] border-[#437C8B] text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-[#437C8B]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type de classe */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Type de classe
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {typeClasseOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleArrayToggle('type_classe', option.value)}
                          className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                            formData.type_classe.includes(option.value)
                              ? 'bg-[#437C8B] border-[#437C8B] text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-[#437C8B]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Niveaux */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Niveaux
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {niveauxOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleArrayToggle('niveaux', option.value)}
                          className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                            formData.niveaux.includes(option.value)
                              ? 'bg-[#437C8B] border-[#437C8B] text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-[#437C8B]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Langues */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Langues d'enseignement
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {languesOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleArrayToggle('langues', option.value)}
                          className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                            formData.langues.includes(option.value)
                              ? 'bg-[#437C8B] border-[#437C8B] text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-[#437C8B]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Public cible */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Public cible
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {publicCibleOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleArrayToggle('public_cible', option.value)}
                          className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                            formData.public_cible.includes(option.value)
                              ? 'bg-[#437C8B] border-[#437C8B] text-white shadow-md'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-[#437C8B]'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl p-8 shadow-md border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <DollarSign className="mr-3 text-[#437C8B]" size={28} />
                  💰 Tarification
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prix minimum (€/h)
                    </label>
                    <input
                      type="number"
                      name="prix_min"
                      value={formData.prix_min}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                      placeholder="15.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prix maximum (€/h)
                    </label>
                    <input
                      type="number"
                      name="prix_max"
                      value={formData.prix_max}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                      placeholder="50.00"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="premier_cours_gratuit"
                        checked={formData.premier_cours_gratuit}
                        onChange={handleChange}
                        className="w-6 h-6 text-[#437C8B] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#437C8B]"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        🎁 Premier cours gratuit
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl p-8 shadow-md border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="mr-3 text-[#437C8B]" size={28} />
                  📍 Localisation
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                      placeholder="Paris"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pays
                    </label>
                    <input
                      type="text"
                      name="pays"
                      value={formData.pays}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                      placeholder="France"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent transition-all"
                      placeholder="123 Rue de la République"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="sticky bottom-6 z-10">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-[#437C8B] to-[#5a99ab] text-white px-8 py-5 rounded-2xl hover:shadow-2xl transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Save size={24} />
                  <span>💾 Enregistrer toutes les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DashboardProfilComplet;
