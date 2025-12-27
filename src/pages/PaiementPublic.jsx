import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PaiementPublic.css';

const PaiementPublic = () => {
  const { token } = useParams();
  const [paiement, setPaiement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('virement');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchPaymentInfo();
  }, [token]);

  const fetchPaymentInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/paiements/pay/${token}`);
      setPaiement(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.detail || 'Lien de paiement invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirm('Confirmer le paiement? Cette action informera votre professeur.')) return;

    try {
      await axios.post(`${API_BASE_URL}/api/paiements/pay/${token}/confirm`, {
        methode_paiement: selectedMethod
      });
      setPaymentConfirmed(true);
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.response?.data?.detail || 'Erreur lors de la confirmation');
    }
  };

  const getMoisNom = (mois) => {
    const moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNoms[mois - 1] || mois;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="payment-public-container">
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Chargement des informations de paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-public-container">
        <div className="error-card">
          <div className="error-icon">❌</div>
          <h2>Lien invalide</h2>
          <p>{error}</p>
          <p className="error-hint">
            Si vous pensez qu'il s'agit d'une erreur, contactez votre professeur.
          </p>
        </div>
      </div>
    );
  }

  if (paymentConfirmed) {
    return (
      <div className="payment-public-container">
        <div className="success-card">
          <div className="success-animation">
            <div className="checkmark-circle">
              <div className="checkmark"></div>
            </div>
          </div>
          <h2>Paiement confirmé!</h2>
          <p>
            Votre professeur a été informé de votre paiement de <strong>{paiement.montant_du}€</strong>.
          </p>
          <p className="success-hint">
            Vous pouvez fermer cette page en toute sécurité.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-public-container">
      <div className="payment-card">
        {/* Header */}
        <div className="payment-header">
          <div className="header-icon">💰</div>
          <h1>Demande de paiement</h1>
          <p className="header-subtitle">{paiement.merkez_nom}</p>
        </div>

        {/* Amount Display */}
        <div className="amount-display">
          <div className="amount-label">Montant à payer</div>
          <div className="amount-value">{paiement.montant_restant?.toFixed(2)} €</div>
          {paiement.montant_paye > 0 && (
            <div className="amount-note">
              ({paiement.montant_paye}€ déjà payé sur {paiement.montant_du}€)
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="payment-details">
          <h3>📋 Détails</h3>

          <div className="detail-row">
            <span className="detail-label">Élève</span>
            <span className="detail-value">{paiement.eleve_nom}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Période</span>
            <span className="detail-value">
              {getMoisNom(paiement.mois)} {paiement.annee}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Date d'échéance</span>
            <span className="detail-value highlight">
              {formatDate(paiement.date_echeance)}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Professeur</span>
            <span className="detail-value">{paiement.merkez_nom}</span>
          </div>

          {paiement.merkez_telephone && (
            <div className="detail-row">
              <span className="detail-label">Téléphone</span>
              <span className="detail-value">{paiement.merkez_telephone}</span>
            </div>
          )}
        </div>

        {/* Payment Status */}
        {paiement.statut === 'paye' ? (
          <div className="already-paid-banner">
            <span className="banner-icon">✅</span>
            <div>
              <strong>Déjà payé</strong>
              <p>Ce paiement a déjà été effectué.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Payment Instructions */}
            <div className="payment-instructions">
              <h3>💳 Modes de paiement acceptés</h3>

              <div className="payment-methods">
                <label className={`method-card ${selectedMethod === 'virement' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="virement"
                    checked={selectedMethod === 'virement'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  />
                  <div className="method-content">
                    <div className="method-icon">🏦</div>
                    <div>
                      <div className="method-name">Virement bancaire</div>
                      <div className="method-desc">Effectuez un virement à votre professeur</div>
                    </div>
                  </div>
                </label>

                <label className={`method-card ${selectedMethod === 'especes' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="especes"
                    checked={selectedMethod === 'especes'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  />
                  <div className="method-content">
                    <div className="method-icon">💵</div>
                    <div>
                      <div className="method-name">Espèces</div>
                      <div className="method-desc">Payez en espèces lors du prochain cours</div>
                    </div>
                  </div>
                </label>

                <label className={`method-card ${selectedMethod === 'cheque' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="cheque"
                    checked={selectedMethod === 'cheque'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  />
                  <div className="method-content">
                    <div className="method-icon">📝</div>
                    <div>
                      <div className="method-name">Chèque</div>
                      <div className="method-desc">Remettez un chèque à votre professeur</div>
                    </div>
                  </div>
                </label>

                <label className={`method-card ${selectedMethod === 'carte' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="carte"
                    checked={selectedMethod === 'carte'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  />
                  <div className="method-content">
                    <div className="method-icon">💳</div>
                    <div>
                      <div className="method-name">Carte bancaire</div>
                      <div className="method-desc">Paiement par carte</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Instructions */}
            <div className="instructions-box">
              <h4>📌 Instructions</h4>
              <ol>
                <li>Effectuez le paiement via la méthode de votre choix</li>
                <li>Cliquez sur le bouton "Confirmer le paiement" ci-dessous</li>
                <li>Votre professeur sera automatiquement notifié</li>
              </ol>
              <p className="instructions-note">
                ⚠️ Ce bouton ne traite pas le paiement, il sert uniquement à informer votre professeur
                que vous avez effectué le paiement.
              </p>
            </div>

            {/* Confirm Button */}
            <button className="btn-confirm-payment" onClick={handleConfirmPayment}>
              <span className="btn-icon">✓</span>
              Confirmer le paiement
            </button>
          </>
        )}

        {/* Footer */}
        <div className="payment-footer">
          <p>Maraakiz - Plateforme de gestion des cours</p>
          <p className="footer-note">
            Pour toute question, contactez directement votre professeur
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaiementPublic;
