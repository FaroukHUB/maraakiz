import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/dist/locale/fr';
import DashboardLayout from '../layouts/DashboardLayout';
import { Search, FileText, Download, Calendar, Clock, Award, BookOpen } from 'lucide-react';

moment.locale('fr');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MesRapportsCours = () => {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatiere, setFilterMatiere] = useState('all');
  const [selectedRapport, setSelectedRapport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRapports();
  }, []);

  const fetchRapports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const response = await axios.get(`${API_URL}/api/notes-cours/eleve/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Get course details for each rapport
      const rapportsWithCours = await Promise.all(
        response.data.map(async (rapport) => {
          try {
            const coursResponse = await axios.get(
              `${API_URL}/api/calendrier/cours/${rapport.cours_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...rapport,
              cours: coursResponse.data
            };
          } catch (error) {
            console.error('Error fetching course:', error);
            return { ...rapport, cours: null };
          }
        })
      );

      setRapports(rapportsWithCours);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (rapport) => {
    setSelectedRapport(rapport);
    setShowDetailModal(true);
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

  const getProgressionColor = (pourcentage) => {
    if (pourcentage >= 80) return 'text-green-600';
    if (pourcentage >= 60) return 'text-blue-600';
    if (pourcentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredRapports = rapports.filter((r) => {
    const cours = r.cours;
    if (!cours) return false;

    const matchesSearch =
      searchTerm === '' ||
      cours.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.resume?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMatiere = filterMatiere === 'all' || cours.matiere === filterMatiere;
    return matchesSearch && matchesMatiere;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Mes Rapports de Cours</h1>
          <p className="text-gray-600">Consultez tous vos rapports et suivez votre progression</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Cours</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{rapports.length}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <BookOpen className="text-blue-700" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Progression Moyenne</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {rapports.length > 0
                    ? Math.round(
                        rapports.reduce((acc, r) => acc + (r.progression_pourcentage || 0), 0) /
                          rapports.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <Award className="text-green-700" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Fichiers Disponibles</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {rapports.reduce((acc, r) => acc + (r.fichiers?.length || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <FileText className="text-purple-700" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
              />
            </div>

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

        {/* Rapports List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#437C8B]"></div>
          </div>
        ) : filteredRapports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun rapport disponible</h3>
            <p className="text-gray-600">
              Vos rapports de cours apparaîtront ici une fois que votre professeur les aura créés
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRapports.map((rapport) => (
              <div
                key={rapport.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleOpenDetail(rapport)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{getMatiereIcon(rapport.cours?.matiere)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rapport.cours?.titre || 'Cours'}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>
                              {moment(rapport.cours?.date_debut).format('DD MMMM YYYY')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>
                              {moment(rapport.cours?.date_debut).format('HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    {rapport.resume && (
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{rapport.resume}</p>
                    )}

                    {/* Badges */}
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMatiereColor(
                          rapport.cours?.matiere
                        )}`}
                      >
                        {rapport.cours?.matiere?.charAt(0).toUpperCase() +
                          rapport.cours?.matiere?.slice(1)}
                      </span>

                      {rapport.note && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                          ⭐ {rapport.note}
                        </span>
                      )}

                      {rapport.fichiers && rapport.fichiers.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          📎 {rapport.fichiers.length} fichier(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Progression */}
                  <div className="ml-6 flex flex-col items-center">
                    <div
                      className={`text-3xl font-bold ${getProgressionColor(
                        rapport.progression_pourcentage || 0
                      )}`}
                    >
                      {rapport.progression_pourcentage || 0}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Progression</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedRapport && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getMatiereIcon(selectedRapport.cours?.matiere)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedRapport.cours?.titre}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {moment(selectedRapport.cours?.date_debut).format('DD MMMM YYYY à HH:mm')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-700 mb-1">Progression</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {selectedRapport.progression_pourcentage || 0}%
                    </p>
                  </div>
                  {selectedRapport.note && (
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-700 mb-1">Appréciation</p>
                      <p className="text-2xl font-bold text-yellow-900">{selectedRapport.note}</p>
                    </div>
                  )}
                </div>

                {/* Résumé */}
                {selectedRapport.resume && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Résumé du cours</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {selectedRapport.resume}
                    </p>
                  </div>
                )}

                {/* Vu en cours */}
                {selectedRapport.vu_en_cours && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ Vu en cours</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-line">
                      {selectedRapport.vu_en_cours}
                    </p>
                  </div>
                )}

                {/* Devoirs */}
                {selectedRapport.devoirs && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Devoirs donnés</h3>
                    <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200 whitespace-pre-line">
                      {selectedRapport.devoirs}
                    </p>
                  </div>
                )}

                {/* À revoir */}
                {selectedRapport.a_revoir && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">🔄 À revoir</h3>
                    <p className="text-gray-700 bg-orange-50 p-4 rounded-lg border border-orange-200 whitespace-pre-line">
                      {selectedRapport.a_revoir}
                    </p>
                  </div>
                )}

                {/* À voir prochaine fois */}
                {selectedRapport.a_voir_prochaine_fois && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      ➡️ À voir la prochaine fois
                    </h3>
                    <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200 whitespace-pre-line">
                      {selectedRapport.a_voir_prochaine_fois}
                    </p>
                  </div>
                )}

                {/* Commentaire prof */}
                {selectedRapport.commentaire_prof && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      💬 Commentaire du professeur
                    </h3>
                    <p className="text-gray-700 bg-purple-50 p-4 rounded-lg border border-purple-200 whitespace-pre-line">
                      {selectedRapport.commentaire_prof}
                    </p>
                  </div>
                )}

                {/* Fichiers */}
                {selectedRapport.fichiers && selectedRapport.fichiers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📎 Fichiers du cours
                    </h3>
                    <div className="space-y-2">
                      {selectedRapport.fichiers.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="text-gray-400" size={20} />
                            <span className="text-sm font-medium text-gray-900">{file.nom}</span>
                          </div>
                          <a
                            href={`${API_URL}${file.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={16} />
                            <span>Télécharger</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MesRapportsCours;
