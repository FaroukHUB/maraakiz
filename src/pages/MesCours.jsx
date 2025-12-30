import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/dist/locale/fr';
import DashboardLayout from '../layouts/DashboardLayout';
import { Calendar, Clock, User, BookOpen, FileText, Archive, Trash2 } from 'lucide-react';

moment.locale('fr');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MesCours = () => {
  const [activeTab, setActiveTab] = useState('a_venir'); // 'a_venir' or 'termines'
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRapportModal, setShowRapportModal] = useState(false);
  const [selectedCours, setSelectedCours] = useState(null);
  const [rapportData, setRapportData] = useState({
    resume: '',
    vu_en_cours: '',
    devoirs: '',
    a_revoir: '',
    a_voir_prochaine_fois: '',
    commentaire_prof: '',
    progression_pourcentage: 0,
    note: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    fetchCours();
  }, [activeTab]);

  const fetchCours = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const statut = activeTab === 'a_venir' ? 'planifie' : 'termine';

      const response = await axios.get(`${API_URL}/api/calendrier/cours`, {
        params: { statut },
        headers: { Authorization: `Bearer ${token}` }
      });

      setCours(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRapport = async (coursItem) => {
    setSelectedCours(coursItem);

    // Try to fetch existing notes
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/notes-cours/cours/${coursItem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRapportData({
        resume: response.data.resume || '',
        vu_en_cours: response.data.vu_en_cours || '',
        devoirs: response.data.devoirs || '',
        a_revoir: response.data.a_revoir || '',
        a_voir_prochaine_fois: response.data.a_voir_prochaine_fois || '',
        commentaire_prof: response.data.commentaire_prof || '',
        progression_pourcentage: response.data.progression_pourcentage || 0,
        note: response.data.note || ''
      });

      setExistingFiles(response.data.fichiers || []);
    } catch (error) {
      // No notes yet, keep empty form
      setRapportData({
        resume: '',
        vu_en_cours: '',
        devoirs: '',
        a_revoir: '',
        a_voir_prochaine_fois: '',
        commentaire_prof: '',
        progression_pourcentage: 0,
        note: ''
      });
      setExistingFiles([]);
    }

    setShowRapportModal(true);
  };

  const handleRapportSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCours) return;

    try {
      const token = localStorage.getItem('token');

      // Try to create or update notes
      let notesId;
      try {
        const response = await axios.post(
          `${API_URL}/api/notes-cours/`,
          {
            cours_id: selectedCours.id,
            ...rapportData
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        notesId = response.data.id;
      } catch (error) {
        // Notes already exist, update them
        if (error.response?.status === 400) {
          const getResponse = await axios.get(
            `${API_URL}/api/notes-cours/cours/${selectedCours.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          notesId = getResponse.data.id;

          await axios.put(
            `${API_URL}/api/notes-cours/${notesId}`,
            rapportData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          throw error;
        }
      }

      // Upload files if any
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        await axios.post(
          `${API_URL}/api/notes-cours/${notesId}/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      alert('✅ Rapport enregistré avec succès!');
      setShowRapportModal(false);
      setRapportData({
        resume: '',
        vu_en_cours: '',
        devoirs: '',
        a_revoir: '',
        a_voir_prochaine_fois: '',
        commentaire_prof: '',
        progression_pourcentage: 0,
        note: ''
      });
      setUploadedFiles([]);
      setExistingFiles([]);
      setSelectedCours(null);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du rapport:', error);
      alert('Erreur lors de l\'enregistrement du rapport');
    }
  };

  const handleArchiveCours = async (coursId) => {
    if (!confirm('Voulez-vous archiver ce cours ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/calendrier/cours/${coursId}`,
        { statut: 'archive' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Cours archivé avec succès!');
      fetchCours();
    } catch (error) {
      console.error('Erreur lors de l\'archivage:', error);
      alert('Erreur lors de l\'archivage du cours');
    }
  };

  const handleDeleteCours = async (coursId) => {
    if (!confirm('Voulez-vous supprimer ce cours définitivement ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/calendrier/cours/${coursId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('✅ Cours supprimé avec succès!');
      fetchCours();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du cours');
    }
  };

  const getMatiereIcon = (matiere) => {
    const icons = {
      coran: '📗',
      arabe: '📘',
      tajwid: '📕',
      fiqh: '📙',
      aqida: '📔'
    };
    return icons[matiere] || '📚';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Mes Cours</h1>
          <p className="text-gray-600">Gérez vos cours à venir et terminés</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-2 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('a_venir')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'a_venir'
                  ? 'bg-gradient-to-r from-[#437C8B] to-[#5a99ab] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📅 Cours à venir
            </button>
            <button
              onClick={() => setActiveTab('termines')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                activeTab === 'termines'
                  ? 'bg-gradient-to-r from-[#437C8B] to-[#5a99ab] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ✅ Cours terminés
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#437C8B]"></div>
          </div>
        )}

        {/* Cours List */}
        {!loading && (
          <div className="space-y-4">
            {cours.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">
                  {activeTab === 'a_venir' ? '📅' : '✅'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {activeTab === 'a_venir' ? 'Aucun cours à venir' : 'Aucun cours terminé'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'a_venir'
                    ? 'Créez vos cours depuis le calendrier'
                    : 'Marquez vos cours comme terminés depuis le calendrier'}
                </p>
              </div>
            ) : (
              cours.map((coursItem) => (
                <div
                  key={coursItem.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    {/* Left: Course Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-3xl">{getMatiereIcon(coursItem.matiere)}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{coursItem.titre}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <Calendar size={16} />
                            <span>{moment(coursItem.date_debut).format('dddd D MMMM YYYY')}</span>
                            <Clock size={16} className="ml-2" />
                            <span>
                              {moment(coursItem.date_debut).format('HH:mm')} -{' '}
                              {moment(coursItem.date_fin).format('HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Students */}
                      <div className="flex items-center space-x-2 mb-2">
                        <User size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {coursItem.eleves.map((e) => e.prenom).join(', ')}
                        </span>
                      </div>

                      {/* Description */}
                      {coursItem.description && (
                        <p className="text-sm text-gray-600 mt-2">{coursItem.description}</p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {activeTab === 'termines' && (
                        <>
                          <button
                            onClick={() => handleOpenRapport(coursItem)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl transition-colors font-medium"
                            title="Voir/Modifier le rapport"
                          >
                            <FileText size={18} />
                            <span>Notes</span>
                          </button>
                          <button
                            onClick={() => handleArchiveCours(coursItem.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl transition-colors font-medium"
                            title="Archiver"
                          >
                            <Archive size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteCours(coursItem.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl transition-colors font-medium"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal Rapport de Cours */}
        {showRapportModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRapportModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">📝 Rapport de Cours</h2>
                <button
                  onClick={() => setShowRapportModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleRapportSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📋 Résumé du cours
                  </label>
                  <textarea
                    value={rapportData.resume}
                    onChange={(e) => setRapportData({ ...rapportData, resume: e.target.value })}
                    rows="3"
                    placeholder="Résumé général du cours..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ✅ Vu en cours
                  </label>
                  <textarea
                    value={rapportData.vu_en_cours}
                    onChange={(e) =>
                      setRapportData({ ...rapportData, vu_en_cours: e.target.value })
                    }
                    rows="3"
                    placeholder="Points abordés, chapitres traités..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📚 Devoirs donnés
                  </label>
                  <textarea
                    value={rapportData.devoirs}
                    onChange={(e) => setRapportData({ ...rapportData, devoirs: e.target.value })}
                    rows="2"
                    placeholder="Devoirs à faire pour le prochain cours..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔄 À revoir
                  </label>
                  <textarea
                    value={rapportData.a_revoir}
                    onChange={(e) => setRapportData({ ...rapportData, a_revoir: e.target.value })}
                    rows="2"
                    placeholder="Points à réviser..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ➡️ À voir la prochaine fois
                  </label>
                  <textarea
                    value={rapportData.a_voir_prochaine_fois}
                    onChange={(e) =>
                      setRapportData({ ...rapportData, a_voir_prochaine_fois: e.target.value })
                    }
                    rows="2"
                    placeholder="Programme du prochain cours..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💬 Commentaire du professeur
                  </label>
                  <textarea
                    value={rapportData.commentaire_prof}
                    onChange={(e) =>
                      setRapportData({ ...rapportData, commentaire_prof: e.target.value })
                    }
                    rows="2"
                    placeholder="Observations, remarques..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📊 Progression (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={rapportData.progression_pourcentage}
                      onChange={(e) =>
                        setRapportData({
                          ...rapportData,
                          progression_pourcentage: parseInt(e.target.value) || 0
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⭐ Note / Appréciation
                    </label>
                    <input
                      type="text"
                      value={rapportData.note}
                      onChange={(e) => setRapportData({ ...rapportData, note: e.target.value })}
                      placeholder="Ex: Très bien, Bon travail..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📎 Ajouter des fichiers (PDF, images, audio, vidéo)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.mp3,.wav,.mp4,.webm"
                    onChange={(e) => setUploadedFiles(Array.from(e.target.files))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                  {uploadedFiles.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {uploadedFiles.length} nouveau(x) fichier(s) sélectionné(s)
                    </p>
                  )}

                  {/* Existing files */}
                  {existingFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Fichiers existants:
                      </p>
                      <div className="space-y-2">
                        {existingFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                          >
                            <span className="text-sm text-gray-700">{file.nom}</span>
                            <a
                              href={`${API_URL}${file.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Télécharger
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowRapportModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#437C8B] to-[#5a99ab] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Enregistrer le rapport
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MesCours;
