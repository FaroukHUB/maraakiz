import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/dist/locale/fr';
import './Paiements.css';

moment.locale('fr');

const Paiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatut, setSelectedStatut] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    eleve_id: '',
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    montant_du: '',
    montant_paye: 0,
    date_echeance: '',
    methode_paiement: '',
    notes: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [paymentsRes, elevesRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/paiements/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/eleves/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/paiements/stats/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPaiements(paymentsRes.data);
      setEleves(elevesRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des paiements:', err);
      setError('Impossible de charger les paiements');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaiement = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/paiements/`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowAddModal(false);
      setFormData({
        eleve_id: '',
        mois: new Date().getMonth() + 1,
        annee: new Date().getFullYear(),
        montant_du: '',
        montant_paye: 0,
        date_echeance: '',
        methode_paiement: '',
        notes: ''
      });
      fetchData();
    } catch (err) {
      console.error('Erreur lors de l\'ajout du paiement:', err);
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

      alert(`✅ Lien de paiement envoyé avec succès!\n\nLien: ${response.data.payment_url}`);
      fetchData();
    } catch (err) {
      console.error('Erreur lors de l\'envoi du lien:', err);
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
      console.error('Erreur:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (paiementId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/paiements/${paiementId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchData();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const getStatusColor = (statut) => {
    const colors = {
      paye: 'success',
      partiel: 'warning',
      impaye: 'pending',
      en_retard: 'danger'
    };
    return colors[statut] || 'pending';
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

  const getMoisNom = (mois) => {
    const moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNoms[mois - 1] || mois;
  };

  const filteredPaiements = paiements.filter(p => {
    const matchesStatus = selectedStatut === 'all' || p.statut === selectedStatut;
    const matchesSearch = searchTerm === '' ||
      p.eleve_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.eleve_prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="paiements-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paiements-container">
      {/* Header */}
      <div className="paiements-header">
        <div>
          <h1>💰 Gestion des Paiements</h1>
          <p className="header-subtitle">
            Gérez vos paiements, envoyez des liens et suivez vos revenus
          </p>
        </div>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          <span className="btn-icon">+</span>
          Nouveau paiement
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <div className="stat-label">Total à recevoir</div>
              <div className="stat-value">{stats.total_du?.toFixed(2)} €</div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">Total encaissé</div>
              <div className="stat-value">{stats.total_paye?.toFixed(2)} €</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-label">En attente</div>
              <div className="stat-value">{stats.total_restant?.toFixed(2)} €</div>
            </div>
          </div>

          <div className="stat-card danger">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-label">Impayés</div>
              <div className="stat-value">{stats.impaye_count}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filters">
          <button
            className={`filter-btn ${selectedStatut === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedStatut('all')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${selectedStatut === 'impaye' ? 'active' : ''}`}
            onClick={() => setSelectedStatut('impaye')}
          >
            Impayés
          </button>
          <button
            className={`filter-btn ${selectedStatut === 'en_retard' ? 'active' : ''}`}
            onClick={() => setSelectedStatut('en_retard')}
          >
            En retard
          </button>
          <button
            className={`filter-btn ${selectedStatut === 'partiel' ? 'active' : ''}`}
            onClick={() => setSelectedStatut('partiel')}
          >
            Partiels
          </button>
          <button
            className={`filter-btn ${selectedStatut === 'paye' ? 'active' : ''}`}
            onClick={() => setSelectedStatut('paye')}
          >
            Payés
          </button>
        </div>
      </div>

      {/* Paiements Table */}
      <div className="paiements-table-container">
        {filteredPaiements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Aucun paiement trouvé</h3>
            <p>Commencez par ajouter un nouveau paiement</p>
          </div>
        ) : (
          <table className="paiements-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Période</th>
                <th>Montant dû</th>
                <th>Payé</th>
                <th>Restant</th>
                <th>Statut</th>
                <th>Échéance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPaiements.map(paiement => (
                <tr key={paiement.id} className="paiement-row">
                  <td>
                    <div className="eleve-cell">
                      <div className="eleve-avatar">
                        {paiement.eleve_prenom?.[0]}{paiement.eleve_nom?.[0]}
                      </div>
                      <div>
                        <div className="eleve-nom">
                          {paiement.eleve_prenom} {paiement.eleve_nom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="periode-cell">
                      {getMoisNom(paiement.mois)} {paiement.annee}
                    </div>
                  </td>
                  <td>
                    <div className="montant-cell primary">
                      {paiement.montant_du?.toFixed(2)} €
                    </div>
                  </td>
                  <td>
                    <div className="montant-cell success">
                      {paiement.montant_paye?.toFixed(2)} €
                    </div>
                  </td>
                  <td>
                    <div className="montant-cell warning">
                      {(paiement.montant_du - paiement.montant_paye)?.toFixed(2)} €
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(paiement.statut)}`}>
                      {getStatusLabel(paiement.statut)}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      {moment(paiement.date_echeance).format('DD/MM/YYYY')}
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      {paiement.statut !== 'paye' && (
                        <>
                          <button
                            className="action-btn send"
                            onClick={() => handleSendLink(paiement.id)}
                            title="Envoyer un lien de paiement"
                          >
                            📧
                          </button>
                          <button
                            className="action-btn check"
                            onClick={() => handleMarkPaid(paiement.id)}
                            title="Marquer comme payé"
                          >
                            ✓
                          </button>
                        </>
                      )}
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(paiement.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💰 Nouveau Paiement</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleAddPaiement} className="payment-form">
              <div className="form-group">
                <label>Élève *</label>
                <select
                  value={formData.eleve_id}
                  onChange={(e) => setFormData({ ...formData, eleve_id: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un élève</option>
                  {eleves.map(eleve => (
                    <option key={eleve.id} value={eleve.id}>
                      {eleve.prenom} {eleve.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mois *</label>
                  <select
                    value={formData.mois}
                    onChange={(e) => setFormData({ ...formData, mois: parseInt(e.target.value) })}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <option key={m} value={m}>{getMoisNom(m)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Année *</label>
                  <input
                    type="number"
                    value={formData.annee}
                    onChange={(e) => setFormData({ ...formData, annee: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Montant dû (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.montant_du}
                  onChange={(e) => setFormData({ ...formData, montant_du: parseFloat(e.target.value) })}
                  placeholder="150.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date d'échéance *</label>
                <input
                  type="date"
                  value={formData.date_echeance}
                  onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes optionnelles..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-submit">
                  Créer le paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Paiements;
