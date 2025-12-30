import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import 'moment/dist/locale/fr';
import DashboardLayout from '../layouts/DashboardLayout';
import { ArrowLeft, Calendar, CreditCard, FileText, User, DollarSign, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import './DashboardEleveDetail.css';

moment.locale('fr');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Même palette de couleurs que le calendrier
const ELEVE_COLORS = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102, 126, 234, 0.3)' },
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', shadow: 'rgba(240, 147, 251, 0.3)' },
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', shadow: 'rgba(79, 172, 254, 0.3)' },
  { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', shadow: 'rgba(67, 233, 123, 0.3)' },
  { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', shadow: 'rgba(250, 112, 154, 0.3)' },
  { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', shadow: 'rgba(48, 207, 208, 0.3)' },
  { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', shadow: 'rgba(168, 237, 234, 0.3)' },
  { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', shadow: 'rgba(255, 154, 158, 0.3)' },
  { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', shadow: 'rgba(255, 236, 210, 0.3)' },
  { bg: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', shadow: 'rgba(255, 110, 127, 0.3)' },
];

const getEleveColor = (eleveId) => {
  const index = eleveId % ELEVE_COLORS.length;
  return ELEVE_COLORS[index];
};

const DashboardEleveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cours');
  const [eleve, setEleve] = useState(null);
  const [cours, setCours] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEleveDetails();
    fetchCours();
    fetchPaiements();
  }, [id]);

  const fetchEleveDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/eleves/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEleve(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const fetchCours = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching cours for eleve_id:', id);
      const response = await axios.get(`${API_URL}/api/calendrier/cours`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { eleve_id: id }
      });
      console.log('Cours received:', response.data);
      setCours(response.data);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchPaiements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/paiements/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaiements(response.data);
    } catch (error) {
      console.error('Erreur:', error);
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

  if (!eleve) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Élève non trouvé</p>
        </div>
      </DashboardLayout>
    );
  }

  const eleveColor = getEleveColor(parseInt(id));

  // Séparer les cours passés et à venir
  const now = moment();
  const coursAvenir = cours.filter(c => moment(c.date_debut).isAfter(now)).sort((a, b) => moment(a.date_debut).diff(moment(b.date_debut)));
  const coursPasses = cours.filter(c => moment(c.date_debut).isSameOrBefore(now)).sort((a, b) => moment(b.date_debut).diff(moment(a.date_debut)));

  return (
    <DashboardLayout>
      <div className="eleve-details">
        {/* Header */}
        <div className="details-header">
          <button onClick={() => navigate('/dashboard/eleves')} className="btn-back">
            <ArrowLeft size={20} />
            Retour
          </button>

          <div className="header-content">
            {eleve.avatar_url ? (
              <img
                src={eleve.avatar_url}
                alt={`${eleve.prenom} ${eleve.nom}`}
                className="eleve-avatar-large"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid white',
                  boxShadow: eleveColor.shadow + ' 0px 8px 24px'
                }}
              />
            ) : (
              <div
                className="eleve-avatar-large"
                style={{ background: eleveColor.bg }}
              >
                {eleve.prenom[0]}{eleve.nom[0]}
              </div>
            )}
            <div className="header-info">
              <h1>{eleve.prenom} {eleve.nom}</h1>
              <div className="header-meta">
                <span>{eleve.email}</span>
                {eleve.telephone && <span>• {eleve.telephone}</span>}
                <span className={`statut-badge ${eleve.statut}`}>
                  {eleve.statut === 'actif' ? '✅ Actif' : '⏸️ Inactif'}
                </span>
              </div>
            </div>
          </div>

          <div className="header-stats">
            <div className="stat-item">
              <Calendar size={20} />
              <div>
                <div className="stat-value">{cours.length}</div>
                <div className="stat-label">Cours</div>
              </div>
            </div>
            <div className="stat-item">
              <CreditCard size={20} />
              <div>
                <div className="stat-value">{paiements.length}</div>
                <div className="stat-label">Paiements</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'cours' ? 'active' : ''}`}
            onClick={() => setActiveTab('cours')}
          >
            <Calendar size={18} />
            Cours
          </button>
          <button
            className={`tab ${activeTab === 'paiements' ? 'active' : ''}`}
            onClick={() => setActiveTab('paiements')}
          >
            <CreditCard size={18} />
            Paiements
          </button>
          <button
            className={`tab ${activeTab === 'infos' ? 'active' : ''}`}
            onClick={() => setActiveTab('infos')}
          >
            <User size={18} />
            Informations
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'cours' && (
            <div className="cours-section">
              {cours.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={48} />
                  <h3>Aucun cours</h3>
                  <p>Cet élève n'a pas encore de cours planifiés</p>
                </div>
              ) : (
                <>
                  {/* Cours à venir */}
                  {coursAvenir.length > 0 && (
                    <div className="cours-group">
                      <h3 className="group-title">📅 Cours à venir ({coursAvenir.length})</h3>
                      <div className="cours-list">
                        {coursAvenir.map(c => (
                          <div
                            key={c.id}
                            className="cours-card"
                            style={{ borderLeft: `4px solid`, borderImage: eleveColor.bg + ' 1' }}
                          >
                            <div className="cours-date">
                              <div className="date-day">{moment(c.date_debut).format('DD')}</div>
                              <div className="date-month">{moment(c.date_debut).format('MMM')}</div>
                            </div>
                            <div className="cours-info">
                              <div className="cours-title">{c.titre}</div>
                              <div className="cours-meta">
                                <span>{moment(c.date_debut).format('dddd D MMMM YYYY')}</span>
                                <span>•</span>
                                <span>{moment(c.date_debut).format('HH:mm')} - {moment(c.date_fin).format('HH:mm')}</span>
                                {c.is_recurrent && <span className="recur-badge">🔁 Récurrent</span>}
                              </div>
                              {c.lien_visio && (
                                <a href={c.lien_visio} target="_blank" rel="noopener noreferrer" className="visio-btn">
                                  📹 Rejoindre le cours
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cours passés */}
                  {coursPasses.length > 0 && (
                    <div className="cours-group">
                      <h3 className="group-title">📚 Historique des cours ({coursPasses.length})</h3>
                      <div className="cours-list">
                        {coursPasses.map(c => (
                          <div
                            key={c.id}
                            className="cours-card past"
                            style={{ borderLeft: `4px solid`, borderImage: eleveColor.bg + ' 1', opacity: 0.7 }}
                          >
                            <div className="cours-date">
                              <div className="date-day">{moment(c.date_debut).format('DD')}</div>
                              <div className="date-month">{moment(c.date_debut).format('MMM')}</div>
                            </div>
                            <div className="cours-info">
                              <div className="cours-title">{c.titre}</div>
                              <div className="cours-meta">
                                <span>{moment(c.date_debut).format('dddd D MMMM YYYY')}</span>
                                <span>•</span>
                                <span>{moment(c.date_debut).format('HH:mm')} - {moment(c.date_fin).format('HH:mm')}</span>
                                {c.statut === 'termine' && <span className="status-badge success">✅ Terminé</span>}
                                {c.statut === 'annule' && <span className="status-badge danger">❌ Annulé</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'paiements' && (
            <div className="paiements-section">
              {paiements.length === 0 ? (
                <div className="empty-state">
                  <CreditCard size={48} />
                  <h3>Aucun paiement</h3>
                  <p>Aucun paiement enregistré pour cet élève</p>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Total Dû */}
                    <div style={{
                      background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(219 234 254))',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      border: '2px solid rgb(191 219 254)',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      transition: 'box-shadow 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgb(37 99 235)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Total Dû
                          </p>
                          <p style={{ fontSize: '2.25rem', fontWeight: 700, color: 'rgb(30 58 138)', marginTop: '0.5rem' }}>
                            {paiements.reduce((sum, p) => sum + (p.montant_du || 0), 0).toFixed(2)} €
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'rgb(29 78 216)', marginTop: '0.25rem' }}>
                            {paiements.length} {paiements.length === 1 ? 'paiement' : 'paiements'}
                          </p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgb(191 219 254)', borderRadius: '9999px' }}>
                          <DollarSign style={{ color: 'rgb(29 78 216)' }} size={28} />
                        </div>
                      </div>
                    </div>

                    {/* Total Payé */}
                    <div style={{
                      background: 'linear-gradient(to bottom right, rgb(240 253 244), rgb(220 252 231))',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      border: '2px solid rgb(187 247 208)',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      transition: 'box-shadow 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgb(22 163 74)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Total Payé
                          </p>
                          <p style={{ fontSize: '2.25rem', fontWeight: 700, color: 'rgb(20 83 45)', marginTop: '0.5rem' }}>
                            {paiements.reduce((sum, p) => sum + (p.montant_paye || 0), 0).toFixed(2)} €
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'rgb(21 128 61)', marginTop: '0.25rem' }}>
                            {paiements.filter(p => p.statut === 'paye').length} payé{paiements.filter(p => p.statut === 'paye').length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgb(187 247 208)', borderRadius: '9999px' }}>
                          <CheckCircle style={{ color: 'rgb(21 128 61)' }} size={28} />
                        </div>
                      </div>
                    </div>

                    {/* Reste à Payer */}
                    <div style={{
                      background: 'linear-gradient(to bottom right, rgb(254 242 242), rgb(254 226 226))',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      border: '2px solid rgb(254 202 202)',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      transition: 'box-shadow 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgb(220 38 38)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Reste à Payer
                          </p>
                          <p style={{ fontSize: '2.25rem', fontWeight: 700, color: 'rgb(127 29 29)', marginTop: '0.5rem' }}>
                            {paiements.reduce((sum, p) => sum + ((p.montant_du || 0) - (p.montant_paye || 0)), 0).toFixed(2)} €
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'rgb(185 28 28)', marginTop: '0.25rem' }}>
                            {paiements.filter(p => p.statut !== 'paye').length} en attente
                          </p>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgb(254 202 202)', borderRadius: '9999px' }}>
                          <AlertCircle style={{ color: 'rgb(185 28 28)' }} size={28} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern Table */}
                  <div style={{ background: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid rgb(229 231 235)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%' }}>
                        <thead>
                          <tr style={{ background: 'rgb(249 250 251)', borderBottom: '1px solid rgb(229 231 235)' }}>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'rgb(75 85 99)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Période
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'rgb(75 85 99)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Statut
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'rgb(75 85 99)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Montant Dû
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'rgb(75 85 99)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Payé
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'rgb(75 85 99)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Restant
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'rgb(75 85 99)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Échéance
                            </th>
                          </tr>
                        </thead>
                        <tbody style={{ borderTop: '1px solid rgb(243 244 246)' }}>
                          {paiements.map(p => {
                            const restant = (p.montant_du || 0) - (p.montant_paye || 0);
                            return (
                              <tr key={p.id} style={{ borderBottom: '1px solid rgb(243 244 246)', transition: 'background-color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(249 250 251)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                {/* Période */}
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgb(17 24 39)' }}>
                                    {moment().month(p.mois - 1).format('MMMM')} {p.annee}
                                  </div>
                                </td>

                                {/* Statut */}
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '0.25rem 0.625rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    border: '1px solid',
                                    ...(p.statut === 'paye' ? {
                                      backgroundColor: 'rgb(220 252 231)',
                                      color: 'rgb(21 128 61)',
                                      borderColor: 'rgb(187 247 208)'
                                    } : p.statut === 'partiel' ? {
                                      backgroundColor: 'rgb(254 249 195)',
                                      color: 'rgb(161 98 7)',
                                      borderColor: 'rgb(253 224 71)'
                                    } : p.statut === 'en_retard' ? {
                                      backgroundColor: 'rgb(254 226 226)',
                                      color: 'rgb(185 28 28)',
                                      borderColor: 'rgb(254 202 202)'
                                    } : {
                                      backgroundColor: 'rgb(243 244 246)',
                                      color: 'rgb(75 85 99)',
                                      borderColor: 'rgb(209 213 219)'
                                    })
                                  }}>
                                    {p.statut === 'paye' && '✅ Payé'}
                                    {p.statut === 'impaye' && '⏳ Impayé'}
                                    {p.statut === 'partiel' && '⚠️ Partiel'}
                                    {p.statut === 'en_retard' && '🔴 En retard'}
                                  </span>
                                </td>

                                {/* Montant Dû */}
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgb(17 24 39)' }}>
                                    {p.montant_du?.toFixed(2)} €
                                  </span>
                                </td>

                                {/* Payé */}
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgb(22 163 74)' }}>
                                    {p.montant_paye?.toFixed(2)} €
                                  </span>
                                </td>

                                {/* Restant */}
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', textAlign: 'right' }}>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: restant > 0 ? 'rgb(220 38 38)' : 'rgb(107 114 128)' }}>
                                    {restant.toFixed(2)} €
                                  </span>
                                </td>

                                {/* Échéance */}
                                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                                  {p.date_echeance ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'rgb(107 114 128)' }}>
                                      <Clock size={14} style={{ color: 'rgb(156 163 175)' }} />
                                      <span>{moment(p.date_echeance).format('DD/MM/YYYY')}</span>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '0.875rem', color: 'rgb(156 163 175)' }}>-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'infos' && (
            <div className="infos-section">
              <div className="info-grid">
                <div className="info-card">
                  <h3>📧 Contact</h3>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{eleve.email}</span>
                  </div>
                  {eleve.telephone && (
                    <div className="info-item">
                      <span className="info-label">Téléphone</span>
                      <span className="info-value">{eleve.telephone}</span>
                    </div>
                  )}
                </div>

                <div className="info-card">
                  <h3>👤 Informations personnelles</h3>
                  <div className="info-item">
                    <span className="info-label">Niveau</span>
                    <span className="info-value">{eleve.niveau || 'Non renseigné'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date d'inscription</span>
                    <span className="info-value">{moment(eleve.date_inscription).format('DD/MM/YYYY')}</span>
                  </div>
                </div>

                {eleve.notes && (
                  <div className="info-card full-width">
                    <h3>📝 Notes</h3>
                    <p className="notes-text">{eleve.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardEleveDetail;
