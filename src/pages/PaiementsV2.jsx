import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/dist/locale/fr';
import DashboardLayout from '../layouts/DashboardLayout';
import { ChevronLeft, ChevronRight, Archive, ArchiveRestore, Plus, Send, Check, Trash2, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

moment.locale('fr');

const PaiementsV2 = () => {
  // State pour la navigation mensuelle
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [paiements, setPaiements] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [archivedMonths, setArchivedMonths] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showArchivesModal, setShowArchivesModal] = useState(false);
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState(null);
  const [archiveDetails, setArchiveDetails] = useState([]);
  const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [partialMethode, setPartialMethode] = useState('especes');
  const [partialNotes, setPartialNotes] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    eleve_id: '',
    mois: currentMonth,
    annee: currentYear,
    montant_du: '',
    montant_paye: 0,
    date_echeance: '',
    date_paiement: '',
    methode_paiement: '',
    notes: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchArchivedMonths();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [paymentsRes, elevesRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/paiements/`, {
          params: { mois: currentMonth, annee: currentYear },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/eleves/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/paiements/stats/overview`, {
          params: { mois: currentMonth, annee: currentYear },
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPaiements(paymentsRes.data);
      setEleves(elevesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedMonths = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/paiements/archived-months`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArchivedMonths(response.data);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const fetchArchiveDetails = async (mois, annee) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/paiements/`, {
        params: { mois, annee, include_archived: true },
        headers: { Authorization: `Bearer ${token}` }
      });
      setArchiveDetails(response.data);
      setSelectedArchiveMonth({ mois, annee });
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors du chargement des détails');
    }
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleArchiveMonth = async () => {
    if (!confirm(`Voulez-vous archiver tous les paiements de ${getMoisNom(currentMonth)} ${currentYear}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/paiements/archive-month`,
        null,
        {
          params: { mois: currentMonth, annee: currentYear },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('✅ Mois archivé avec succès!');
      fetchData();
      fetchArchivedMonths();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de l\'archivage');
    }
  };

  const handleUnarchiveMonth = async (mois, annee) => {
    if (!confirm(`Voulez-vous désarchiver ${getMoisNom(mois)} ${annee}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/paiements/unarchive-month`,
        null,
        {
          params: { mois, annee },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('✅ Mois désarchivé avec succès!');
      fetchArchivedMonths();
      if (mois === currentMonth && annee === currentYear) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors du désarchivage');
    }
  };

  const handleAddPaiement = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      // Convert data to correct types
      const payload = {
        ...formData,
        eleve_id: parseInt(formData.eleve_id),
        mois: parseInt(formData.mois),
        annee: parseInt(formData.annee),
        montant_du: parseFloat(formData.montant_du),
        montant_paye: parseFloat(formData.montant_paye) || 0,
        date_paiement: formData.date_paiement || null
      };

      console.log('[DEBUG] Sending payment:', payload);

      const response = await axios.post(`${API_BASE_URL}/api/paiements/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('[DEBUG] Payment created:', response.data);

      // Navigate to the month of the created payment
      const createdMois = response.data.mois;
      const createdAnnee = response.data.annee;

      setShowAddModal(false);
      setFormData({
        eleve_id: '',
        mois: currentMonth,
        annee: currentYear,
        montant_du: '',
        montant_paye: 0,
        date_echeance: '',
        date_paiement: '',
        methode_paiement: '',
        notes: ''
      });

      // If payment was created for a different month, navigate to it
      if (createdMois !== currentMonth || createdAnnee !== currentYear) {
        setCurrentMonth(createdMois);
        setCurrentYear(createdAnnee);
        alert(`✅ Paiement créé avec succès pour ${getMoisNom(createdMois)} ${createdAnnee}!`);
      } else {
        alert('✅ Paiement créé avec succès!');
        console.log('[DEBUG] Fetching data after payment creation...');
        await fetchData();
        console.log('[DEBUG] Data fetched, paiements count:', paiements.length);
      }
    } catch (err) {
      console.error('Erreur complète:', err.response?.data);
      alert(err.response?.data?.detail || 'Erreur lors de l\'ajout du paiement');
    }
  };

  const handleSendLink = async (paiementId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/paiements/${paiementId}/send-link`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Lien de paiement envoyé!\n\n${response.data.payment_url}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de l\'envoi du lien');
    }
  };

  const handleMarkPaid = async (paiementId) => {
    if (!confirm('Marquer ce paiement comme payé?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/paiements/${paiementId}/mark-paid`,
        { methode_paiement: 'especes' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  const handleAddPartialPayment = async (e) => {
    e.preventDefault();

    if (!selectedPaiement) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/paiements/${selectedPaiement.id}/add-partial`,
        null,
        {
          params: {
            montant: parseFloat(partialAmount),
            methode_paiement: partialMethode,
            notes: partialNotes
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('✅ Paiement partiel ajouté avec succès!');
      setShowPartialPaymentModal(false);
      setSelectedPaiement(null);
      setPartialAmount('');
      setPartialMethode('especes');
      setPartialNotes('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de l\'ajout du paiement partiel');
    }
  };

  const handleDelete = async (paiementId) => {
    if (!confirm('Supprimer ce paiement?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/paiements/${paiementId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  const getMoisNom = (mois) => {
    const moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNoms[mois - 1] || mois;
  };

  const getStatusColor = (statut) => {
    const colors = {
      paye: 'bg-green-100 text-green-800 border-green-200',
      partiel: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      impaye: 'bg-gray-100 text-gray-800 border-gray-200',
      en_retard: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[statut] || colors.impaye;
  };

  const getStatusLabel = (statut) => {
    const labels = {
      paye: 'Payé',
      partiel: 'Partiel',
      impaye: 'Impayé',
      en_retard: 'En retard'
    };
    return labels[statut] || statut;
  };

  const filteredPaiements = paiements.filter(p => {
    const matchesStatus = selectedStatut === 'all' || p.statut === selectedStatut;
    const matchesSearch = searchTerm === '' ||
      p.eleve_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.eleve_prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const isCurrentMonth = currentMonth === new Date().getMonth() + 1 && currentYear === new Date().getFullYear();

  if (loading && !stats) {
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
      <div className="max-w-7xl mx-auto">
        {/* Header avec navigation mensuelle */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 Paiements</h1>
              <p className="text-gray-600">Gérez vos paiements mensuels</p>
            </div>
            <button
              onClick={() => {
                setFormData({ ...formData, mois: currentMonth, annee: currentYear });
                setShowAddModal(true);
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#437C8B] to-[#5a99ab] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <Plus size={20} />
              <span>Nouveau paiement</span>
            </button>
          </div>

          {/* Navigation mensuelle */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousMonth}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>

              <div className="text-center">
                <div className="flex items-center space-x-3">
                  <Calendar size={24} className="text-[#437C8B]" />
                  <h2 className="text-3xl font-bold text-gray-900">
                    {getMoisNom(currentMonth)} {currentYear}
                  </h2>
                  {isCurrentMonth && (
                    <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                      En cours
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowArchivesModal(true)}
                  className="flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium text-gray-700"
                >
                  <Archive size={20} />
                  <span>Archives ({archivedMonths.length})</span>
                </button>

                <button
                  onClick={handleNextMonth}
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ChevronRight size={24} className="text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.total_du?.toFixed(2)} €
              </div>
              <div className="text-sm text-gray-600">Total à recevoir</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Check className="text-green-600" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.total_paye?.toFixed(2)} €
              </div>
              <div className="text-sm text-gray-600">Total encaissé</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-yellow-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <AlertCircle className="text-yellow-600" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.total_restant?.toFixed(2)} €
              </div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-red-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Archive className="text-red-600" size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.impaye_count}
              </div>
              <div className="text-sm text-gray-600">Impayés</div>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="🔍 Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent w-80"
              />

              <div className="flex space-x-2">
                {['all', 'impaye', 'en_retard', 'partiel', 'paye'].map(status => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatut(status)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedStatut === status
                        ? 'bg-[#437C8B] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'Tous' : getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {paiements.length > 0 && (
              <button
                onClick={handleArchiveMonth}
                className="flex items-center space-x-2 px-4 py-3 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl transition-colors font-medium"
              >
                <Archive size={20} />
                <span>Archiver ce mois</span>
              </button>
            )}
          </div>
        </div>

        {/* Table paiements */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {filteredPaiements.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun paiement</h3>
              <p className="text-gray-600">
                {paiements.length === 0
                  ? `Aucun paiement pour ${getMoisNom(currentMonth)} ${currentYear}`
                  : 'Aucun paiement ne correspond aux filtres'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Élève</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Montant dû</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Payé</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Restant</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Échéance</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPaiements.map(paiement => (
                    <tr key={paiement.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#437C8B] to-[#5a99ab] flex items-center justify-center text-white font-semibold">
                            {paiement.eleve_prenom?.[0]}{paiement.eleve_nom?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {paiement.eleve_prenom} {paiement.eleve_nom}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">
                          {paiement.montant_du?.toFixed(2)} €
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600">
                          {paiement.montant_paye?.toFixed(2)} €
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-yellow-600">
                          {(paiement.montant_du - paiement.montant_paye)?.toFixed(2)} €
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border-2 ${getStatusColor(paiement.statut)}`}>
                          {getStatusLabel(paiement.statut)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {moment(paiement.date_echeance).format('DD/MM/YYYY')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {paiement.statut !== 'paye' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedPaiement(paiement);
                                  setShowPartialPaymentModal(true);
                                }}
                                className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                                title="Ajouter un paiement partiel"
                              >
                                <Plus size={18} className="text-yellow-600" />
                              </button>
                              <button
                                onClick={() => handleSendLink(paiement.id)}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Envoyer un lien"
                              >
                                <Send size={18} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleMarkPaid(paiement.id)}
                                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                title="Marquer comme payé"
                              >
                                <Check size={18} className="text-green-600" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(paiement.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Ajout Paiement */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">💰 Nouveau Paiement</h2>
              </div>

              <form onSubmit={handleAddPaiement} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Élève *</label>
                  <select
                    value={formData.eleve_id}
                    onChange={(e) => setFormData({ ...formData, eleve_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  >
                    <option value="">Sélectionner un élève</option>
                    {eleves.map(eleve => (
                      <option key={eleve.id} value={eleve.id}>
                        {eleve.prenom} {eleve.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mois *</label>
                    <select
                      value={formData.mois}
                      onChange={(e) => setFormData({ ...formData, mois: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                        <option key={m} value={m}>{getMoisNom(m)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Année *</label>
                    <input
                      type="number"
                      value={formData.annee}
                      onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Montant dû (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.montant_du}
                    onChange={(e) => setFormData({ ...formData, montant_du: e.target.value })}
                    placeholder="150.00"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date d'échéance *</label>
                    <input
                      type="date"
                      value={formData.date_echeance}
                      onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date de paiement</label>
                    <input
                      type="date"
                      value={formData.date_paiement}
                      onChange={(e) => setFormData({ ...formData, date_paiement: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Si déjà payé</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Méthode de paiement</label>
                  <select
                    value={formData.methode_paiement}
                    onChange={(e) => setFormData({ ...formData, methode_paiement: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="especes">💵 Espèces</option>
                    <option value="virement">🏦 Virement</option>
                    <option value="cheque">📝 Chèque</option>
                    <option value="carte">💳 Carte bancaire</option>
                    <option value="paypal">💙 PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes optionnelles..."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#437C8B] to-[#5a99ab] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Créer le paiement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Archives */}
        {showArchivesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
            setShowArchivesModal(false);
            setSelectedArchiveMonth(null);
            setArchiveDetails([]);
          }}>
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
                {selectedArchiveMonth ? (
                  <>
                    <div>
                      <button
                        onClick={() => {
                          setSelectedArchiveMonth(null);
                          setArchiveDetails([]);
                        }}
                        className="text-sm text-[#437C8B] hover:underline mb-2 flex items-center"
                      >
                        ← Retour aux archives
                      </button>
                      <h2 className="text-2xl font-bold text-gray-900">
                        📦 {getMoisNom(selectedArchiveMonth.mois)} {selectedArchiveMonth.annee}
                      </h2>
                    </div>
                  </>
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">📦 Mois Archivés</h2>
                )}
              </div>

              <div className="p-6">
                {!selectedArchiveMonth ? (
                  // Liste des mois archivés
                  archivedMonths.length === 0 ? (
                    <div className="text-center py-12">
                      <Archive size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Aucun mois archivé</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {archivedMonths.map(month => (
                        <div key={`${month.mois}-${month.annee}`} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-[#437C8B] transition-colors cursor-pointer" onClick={() => fetchArchiveDetails(month.mois, month.annee)}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {getMoisNom(month.mois)} {month.annee}
                              </h3>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Paiements: </span>
                                  <span className="font-semibold">{month.count}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total dû: </span>
                                  <span className="font-semibold">{month.total_du?.toFixed(2)} €</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Encaissé: </span>
                                  <span className="font-semibold text-green-600">{month.total_paye?.toFixed(2)} €</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnarchiveMonth(month.mois, month.annee);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl transition-colors font-medium"
                              >
                                <ArchiveRestore size={20} />
                                <span>Désarchiver</span>
                              </button>
                              <ChevronRight size={24} className="text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  // Détails du mois archivé
                  <div className="space-y-4">
                    {archiveDetails.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">Aucun détail disponible</p>
                      </div>
                    ) : (
                      archiveDetails.map(paiement => (
                        <div key={paiement.id} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                          {/* En-tête élève */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#437C8B] to-[#5a99ab] flex items-center justify-center text-white font-semibold text-lg">
                                {paiement.eleve_prenom?.[0]}{paiement.eleve_nom?.[0]}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                  {paiement.eleve_prenom} {paiement.eleve_nom}
                                </h3>
                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(paiement.statut)}`}>
                                  {getStatusLabel(paiement.statut)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Informations financières */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Montant dû</p>
                              <p className="text-xl font-bold text-gray-900">{paiement.montant_du?.toFixed(2)} €</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Montant payé</p>
                              <p className="text-xl font-bold text-green-600">{paiement.montant_paye?.toFixed(2)} €</p>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Restant</p>
                              <p className="text-xl font-bold text-yellow-600">
                                {(paiement.montant_du - paiement.montant_paye)?.toFixed(2)} €
                              </p>
                            </div>
                          </div>

                          {/* Détails paiement */}
                          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                            <div>
                              <span className="text-gray-600">Date d'échéance: </span>
                              <span className="font-semibold">{moment(paiement.date_echeance).format('DD/MM/YYYY')}</span>
                            </div>
                            {paiement.date_paiement && (
                              <div>
                                <span className="text-gray-600">Date de paiement: </span>
                                <span className="font-semibold text-green-600">{moment(paiement.date_paiement).format('DD/MM/YYYY')}</span>
                              </div>
                            )}
                            {paiement.methode_paiement && (
                              <div>
                                <span className="text-gray-600">Méthode: </span>
                                <span className="font-semibold capitalize">{paiement.methode_paiement}</span>
                              </div>
                            )}
                          </div>

                          {/* Notes / Historique */}
                          {paiement.notes && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs font-semibold text-gray-700 mb-2">📝 Historique / Notes:</p>
                              <p className="text-sm text-gray-700 whitespace-pre-line">{paiement.notes}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t-2 border-gray-100">
                <button
                  onClick={() => {
                    setShowArchivesModal(false);
                    setSelectedArchiveMonth(null);
                    setArchiveDetails([]);
                  }}
                  className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Paiement Partiel */}
        {showPartialPaymentModal && selectedPaiement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPartialPaymentModal(false)}>
            <div className="bg-white rounded-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">💰 Paiement Partiel</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedPaiement.eleve_prenom} {selectedPaiement.eleve_nom}
                </p>
              </div>

              <form onSubmit={handleAddPartialPayment} className="p-6 space-y-6">
                {/* Récapitulatif */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total dû</p>
                      <p className="text-lg font-bold text-gray-900">{selectedPaiement.montant_du?.toFixed(2)} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Déjà payé</p>
                      <p className="text-lg font-bold text-green-600">{selectedPaiement.montant_paye?.toFixed(2)} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Reste à payer</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {(selectedPaiement.montant_du - selectedPaiement.montant_paye)?.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Montant du paiement (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    placeholder="Ex: 30.00"
                    max={selectedPaiement.montant_du - selectedPaiement.montant_paye}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {(selectedPaiement.montant_du - selectedPaiement.montant_paye)?.toFixed(2)} €
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Méthode de paiement</label>
                  <select
                    value={partialMethode}
                    onChange={(e) => setPartialMethode(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  >
                    <option value="especes">💵 Espèces</option>
                    <option value="virement">🏦 Virement</option>
                    <option value="cheque">📝 Chèque</option>
                    <option value="carte">💳 Carte bancaire</option>
                    <option value="paypal">💙 PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optionnel)</label>
                  <textarea
                    value={partialNotes}
                    onChange={(e) => setPartialNotes(e.target.value)}
                    placeholder="Ex: Premier versement, Acompte..."
                    rows="2"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPartialPaymentModal(false);
                      setSelectedPaiement(null);
                      setPartialAmount('');
                      setPartialNotes('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Ajouter le paiement
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

export default PaiementsV2;
