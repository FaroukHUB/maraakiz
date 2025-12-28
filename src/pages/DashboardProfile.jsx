import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { User, Upload, Trash2, AlertCircle, Camera, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DashboardProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    genre: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        genre: response.data.genre || ''
      });
      setShowWarning(response.data.avatar_type === 'custom');
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger le profil');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/profile/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setProfile(response.data);
      setSuccess('Profil mis à jour avec succès');
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

    // Check file size (max 5MB)
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

      // Refresh profile to get new avatar
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
    if (!confirm('Voulez-vous vraiment supprimer votre avatar personnalisé et revenir à l\'avatar par défaut?')) {
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
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Avatar Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Photo de Profil</h2>

          <div className="flex items-start space-x-6">
            {/* Avatar Display */}
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#437C8B] flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                  {profile?.full_name?.[0] || '?'}
                </div>
              )}
              {profile?.avatar_type === 'custom' && (
                <button
                  onClick={handleDeleteAvatar}
                  className="absolute bottom-0 right-0 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Supprimer l'avatar personnalisé"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <div className="mb-3">
                <label className="inline-flex items-center justify-center space-x-2 bg-[#437C8B] text-white px-6 py-3 rounded-xl hover:bg-[#35626f] transition-all shadow-md hover:shadow-lg cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Upload en cours...</span>
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      <span>
                        {profile?.avatar_type === 'custom' ? 'Changer la photo' : 'Télécharger une photo'}
                      </span>
                    </>
                  )}
                </label>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                Formats acceptés: JPG, PNG, WEBP (max 5MB)
              </p>

              {/* Warning for custom photos */}
              {showWarning && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mt-4">
                  <p className="text-red-700 font-semibold flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    ⚠️ Images de représentation d'âme interdite
                  </p>
                </div>
              )}

              {/* Default avatar info */}
              {profile?.avatar_type === 'default' && formData.genre && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-4">
                  <p className="text-blue-700 text-sm">
                    Vous utilisez l'avatar par défaut pour {formData.genre === 'homme' ? 'les hommes' : 'les femmes'}.
                    Vous pouvez télécharger une photo personnalisée ci-dessus.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informations personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
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
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de compte
                </label>
                <input
                  type="text"
                  value={profile?.user_type === 'prof' ? 'Professeur' : 'Élève'}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
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
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DashboardProfile;
