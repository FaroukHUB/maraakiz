import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/dist/locale/fr';
import DashboardLayout from '../layouts/DashboardLayout';
import { Search, FileText, Archive, Trash2, Filter, Clock, Users } from 'lucide-react';

moment.locale('fr');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MesCours = () => {
  const [activeTab, setActiveTab] = useState('a_venir');
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatiere, setFilterMatiere] = useState('all');
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

      if (activeTab === 'a_venir') {
        await axios.put(
          `${API_URL}/api/calendrier/cours/${selectedCours.id}`,
          { statut: 'termine' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

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

      const message = activeTab === 'a_venir'
        ? '✅ Cours marqué comme terminé et rapport enregistré avec succès!'
        : '✅ Rapport mis à jour avec succès!';

      alert(message);
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
      fetchCours();
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

  const getMatiereColor = (matiere) => {
    const colors = {
      coran: 'bg-green-100 text-green-700 border-green-200',
      arabe: 'bg-blue-100 text-blue-700 border-blue-200',
      tajwid: 'bg-purple-100 text-purple-700 border-purple-200',
      fiqh: 'bg-orange-100 text-orange-700 border-orange-200',
      aqida: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[matiere] || 'bg-gray-100 text-gray-700 border-gray-200';
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

  const filteredCours = cours.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      c.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.eleves.some((e) => e.prenom.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMatiere = filterMatiere === 'all' || c.matiere === filterMatiere;
    return matchesSearch && matchesMatiere;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Mes Cours</h1>
          <p className="text-gray-600">Gérez vos cours planifiés et terminés</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('a_venir')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'a_venir'
                ? 'bg-white text-[#437C8B] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📅 À venir
          </button>
          <button
            onClick={() => setActiveTab('termines')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'termines'
                ? 'bg-white text-[#437C8B] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✅ Terminés
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher un cours ou élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
              />
            </div>

            {/* Filter Matiere */}
            <div className="sm:w-48">
              <select
                value={filterMatiere}
                onChange={(e) => setFilterMatiere(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
              >
                <option value="all">Toutes les matières</option>
                <option value="coran">📗 Coran</option>
                <option value="arabe">📘 Arabe</option>
                <option value="tajwid">📕 Tajwid</option>
                <option value="fiqh">📙 Fiqh</option>
                <option value="aqida">📔 Aqida</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#437C8B]"></div>
          </div>
        ) : filteredCours.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">{activeTab === 'a_venir' ? '📅' : '✅'}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'a_venir' ? 'Aucun cours à venir' : 'Aucun cours terminé'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'a_venir'
                ? 'Créez vos cours depuis le calendrier'
                : 'Marquez vos cours comme terminés depuis le calendrier'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Élèves
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Matière
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Horaire
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCours.map((coursItem) => (
                    <tr
                      key={coursItem.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {moment(coursItem.date_debut).format('DD MMM')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {moment(coursItem.date_debut).format('YYYY')}
                        </div>
                      </td>

                      {/* Cours */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getMatiereIcon(coursItem.matiere)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {coursItem.titre}
                            </div>
                            {coursItem.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {coursItem.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Élèves */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Users size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {coursItem.eleves.map((e) => e.prenom).join(', ')}
                          </span>
                        </div>
                      </td>

                      {/* Matière */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMatiereColor(
                            coursItem.matiere
                          )}`}
                        >
                          {coursItem.matiere?.charAt(0).toUpperCase() +
                            coursItem.matiere?.slice(1)}
                        </span>
                      </td>

                      {/* Horaire */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          <span>
                            {moment(coursItem.date_debut).format('HH:mm')} -{' '}
                            {moment(coursItem.date_fin).format('HH:mm')}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {activeTab === 'a_venir' ? (
                            <button
                              onClick={() => handleOpenRapport(coursItem)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Marquer comme terminé"
                            >
                              <FileText size={18} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenRapport(coursItem)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Voir/Modifier le rapport"
                              >
                                <FileText size={18} />
                              </button>
                              <button
                                onClick={() => handleArchiveCours(coursItem.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Archiver"
                              >
                                <Archive size={18} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteCours(coursItem.id)}
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

        {/* Modal Rapport */}
        {showRapportModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRapportModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-gray-900">📝 Rapport de Cours</h2>
                <button
                  onClick={() => setShowRapportModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                  {uploadedFiles.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {uploadedFiles.length} nouveau(x) fichier(s) sélectionné(s)
                    </p>
                  )}

                  {existingFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Fichiers existants:
                      </p>
                      <div className="space-y-2">
                        {existingFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                          >
                            <span className="text-sm text-gray-700 truncate">{file.nom}</span>
                            <a
                              href={`${API_URL}${file.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline ml-4"
                            >
                              Télécharger
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowRapportModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#437C8B] to-[#5a99ab] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
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
