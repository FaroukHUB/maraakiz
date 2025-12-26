import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import axios from "axios";
import {
  Edit,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Clock,
  Euro,
  User,
  FileText,
  AlertCircle
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const DashboardEleveDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [eleve, setEleve] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    montant_du: "",
    montant_paye: "",
    date_echeance: "",
    methode_paiement: "",
    notes: ""
  });

  useEffect(() => {
    fetchEleve();
    fetchPayments();
  }, [id]);

  const fetchEleve = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/eleves/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEleve(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement de l'élève:", error);
      if (error.response?.status === 404) {
        navigate("/dashboard/eleves");
      }
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/paiements/student/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPayments(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des paiements:", error);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/paiements`, {
        eleve_id: parseInt(id),
        ...newPayment,
        montant_du: parseFloat(newPayment.montant_du),
        montant_paye: parseFloat(newPayment.montant_paye || 0)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowPaymentModal(false);
      setNewPayment({
        mois: new Date().getMonth() + 1,
        annee: new Date().getFullYear(),
        montant_du: "",
        montant_paye: "",
        date_echeance: "",
        methode_paiement: "",
        notes: ""
      });
      fetchPayments();
    } catch (error) {
      console.error("Erreur lors de l'ajout du paiement:", error);
      alert("Erreur lors de l'ajout du paiement");
    }
  };

  const handleMarkAsPaid = async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/paiements/${paymentId}/mark-paid`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchPayments();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement:", error);
      alert("Erreur lors de la mise à jour du paiement");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/eleves/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      navigate("/dashboard/eleves");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de l'élève");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getStatutBadge = (statut) => {
    const styles = {
      actif: "bg-green-100 text-green-800",
      inactif: "bg-gray-100 text-gray-800",
      suspendu: "bg-red-100 text-red-800"
    };

    return (
      <span
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          styles[statut] || styles.actif
        }`}
      >
        {statut.charAt(0).toUpperCase() + statut.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (statut) => {
    const styles = {
      paye: "bg-green-100 text-green-800",
      partiel: "bg-yellow-100 text-yellow-800",
      impaye: "bg-gray-100 text-gray-800",
      en_retard: "bg-red-100 text-red-800"
    };

    const labels = {
      paye: "Payé",
      partiel: "Partiel",
      impaye: "Impayé",
      en_retard: "En retard"
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          styles[statut] || styles.impaye
        }`}
      >
        {labels[statut] || statut}
      </span>
    );
  };

  const getMoisLabel = (mois) => {
    const moisLabels = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return moisLabels[mois - 1] || mois;
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
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">
            Élève non trouvé
          </h3>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard/eleves")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {eleve.prenom} {eleve.nom}
              </h1>
              <div className="flex items-center space-x-3 mt-2">
                {getStatutBadge(eleve.statut)}
                <span className="text-gray-500 capitalize">{eleve.genre}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/dashboard/eleves/${id}/modifier`)}
              className="flex items-center space-x-2 bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700 transition-all shadow-md"
            >
              <Edit size={18} />
              <span>Modifier</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700 transition-all shadow-md"
            >
              <Trash2 size={18} />
              <span>Supprimer</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-3">
                {eleve.email && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Mail className="text-[#437C8B]" size={20} />
                    <a
                      href={`mailto:${eleve.email}`}
                      className="hover:text-[#437C8B]"
                    >
                      {eleve.email}
                    </a>
                  </div>
                )}
                {eleve.telephone && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Phone className="text-[#437C8B]" size={20} />
                    <a
                      href={`tel:${eleve.telephone}`}
                      className="hover:text-[#437C8B]"
                    >
                      {eleve.telephone}
                    </a>
                  </div>
                )}
                {eleve.date_naissance && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Calendar className="text-[#437C8B]" size={20} />
                    <span>Né(e) le {formatDate(eleve.date_naissance)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact parent */}
            {(eleve.nom_parent || eleve.telephone_parent || eleve.email_parent) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Contact parent/tuteur
                </h2>
                <div className="space-y-3">
                  {eleve.nom_parent && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <User className="text-[#437C8B]" size={20} />
                      <span>{eleve.nom_parent}</span>
                    </div>
                  )}
                  {eleve.email_parent && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Mail className="text-[#437C8B]" size={20} />
                      <a
                        href={`mailto:${eleve.email_parent}`}
                        className="hover:text-[#437C8B]"
                      >
                        {eleve.email_parent}
                      </a>
                    </div>
                  )}
                  {eleve.telephone_parent && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Phone className="text-[#437C8B]" size={20} />
                      <a
                        href={`tel:${eleve.telephone_parent}`}
                        className="hover:text-[#437C8B]"
                      >
                        {eleve.telephone_parent}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informations académiques */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Informations académiques
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Niveau</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {eleve.niveau || "Non défini"}
                  </p>
                </div>
                {eleve.matieres && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Matières</p>
                    <p className="font-medium text-gray-900">{eleve.matieres}</p>
                  </div>
                )}
                {eleve.objectifs && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Objectifs</p>
                    <p className="text-gray-900">{eleve.objectifs}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes et commentaires */}
            {(eleve.notes || eleve.commentaire_general) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText size={24} />
                  <span>Notes et commentaires</span>
                </h2>
                <div className="space-y-4">
                  {eleve.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Notes personnelles
                      </p>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {eleve.notes}
                      </p>
                    </div>
                  )}
                  {eleve.commentaire_general && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Commentaire général
                      </p>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {eleve.commentaire_general}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Paiements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Euro size={24} />
                  <span>Paiements</span>
                </h2>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-[#437C8B] text-white rounded-lg hover:bg-[#35626f] transition-colors text-sm font-medium"
                >
                  + Ajouter un paiement
                </button>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Euro size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Aucun paiement enregistré</p>
                  <p className="text-sm">Ajoutez le premier paiement pour cet élève</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">
                            {getMoisLabel(payment.mois)} {payment.annee}
                          </h3>
                          {getPaymentStatusBadge(payment.statut)}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">
                            {payment.montant_paye}€ / {payment.montant_du}€
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="text-gray-500">Échéance:</span>{" "}
                          <span className="font-medium">
                            {formatDate(payment.date_echeance)}
                          </span>
                        </div>
                        {payment.date_paiement && (
                          <div>
                            <span className="text-gray-500">Payé le:</span>{" "}
                            <span className="font-medium">
                              {formatDate(payment.date_paiement)}
                            </span>
                          </div>
                        )}
                        {payment.methode_paiement && (
                          <div>
                            <span className="text-gray-500">Méthode:</span>{" "}
                            <span className="font-medium capitalize">
                              {payment.methode_paiement}
                            </span>
                          </div>
                        )}
                      </div>

                      {payment.notes && (
                        <p className="text-sm text-gray-600 mb-3 italic border-l-2 border-gray-300 pl-3">
                          {payment.notes}
                        </p>
                      )}

                      {payment.statut !== "paye" && (
                        <button
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          ✓ Marquer comme payé
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column - Stats & Course info */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Statistiques
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="text-blue-600" size={20} />
                    <span className="text-gray-700">Cours suivis</span>
                  </div>
                  <span className="font-bold text-blue-600">
                    {eleve.nombre_cours_suivis}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="text-red-600" size={20} />
                    <span className="text-gray-700">Absences</span>
                  </div>
                  <span className="font-bold text-red-600">
                    {eleve.nombre_absences}
                  </span>
                </div>

                {eleve.date_dernier_cours && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Dernier cours</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(eleve.date_dernier_cours)}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Inscription</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(eleve.date_inscription)}
                  </p>
                </div>
              </div>
            </div>

            {/* Course info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Informations de cours
              </h2>
              <div className="space-y-3">
                {eleve.type_cours && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Type de cours</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {eleve.type_cours.replace("-", " ")}
                    </p>
                  </div>
                )}
                {eleve.frequence_cours && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fréquence</p>
                    <p className="font-medium text-gray-900">
                      {eleve.frequence_cours}
                    </p>
                  </div>
                )}
                {eleve.duree_cours && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Clock className="text-purple-600" size={20} />
                      <span className="text-gray-700">Durée</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {eleve.duree_cours} min
                    </span>
                  </div>
                )}
                {eleve.tarif_heure && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Euro className="text-green-600" size={20} />
                      <span className="text-gray-700">Tarif/h</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {eleve.tarif_heure}€
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Supprimer l'élève
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-semibold">
                {eleve.prenom} {eleve.nom}
              </span>{" "}
              ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Ajouter un paiement
            </h3>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mois
                  </label>
                  <select
                    value={newPayment.mois}
                    onChange={(e) => setNewPayment({ ...newPayment, mois: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                    required
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
                      <option key={m} value={m}>{getMoisLabel(m)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année
                  </label>
                  <input
                    type="number"
                    value={newPayment.annee}
                    onChange={(e) => setNewPayment({ ...newPayment, annee: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant dû (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPayment.montant_du}
                    onChange={(e) => setNewPayment({ ...newPayment, montant_du: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant payé (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPayment.montant_paye}
                    onChange={(e) => setNewPayment({ ...newPayment, montant_paye: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={newPayment.date_echeance}
                  onChange={(e) => setNewPayment({ ...newPayment, date_echeance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement
                </label>
                <select
                  value={newPayment.methode_paiement}
                  onChange={(e) => setNewPayment({ ...newPayment, methode_paiement: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  <option value="especes">Espèces</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  placeholder="Notes supplémentaires..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#437C8B] text-white rounded-xl hover:bg-[#35626f] transition-colors font-medium"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardEleveDetail;
