import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import NotesCoursModal from "../components/NotesCoursModal";
import axios from "axios";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  X,
  Save,
  Edit,
  Trash2,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const DashboardCalendrier = () => {
  const navigate = useNavigate();
  const [cours, setCours] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCours, setEditingCours] = useState(null);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedCoursForNotes, setSelectedCoursForNotes] = useState(null);

  const [formData, setFormData] = useState({
    eleve_id: "",
    titre: "",
    matiere: "",
    description: "",
    date_debut: "",
    heure_debut: "",
    duree: "60",
    type_cours: "en-ligne",
    lien_visio: "",
    tarif: "",
    devoirs: ""
  });

  useEffect(() => {
    fetchEleves();
    fetchCours();
  }, [currentDate]);

  const fetchEleves = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/eleves/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEleves(response.data);
    } catch (error) {
      console.error("Erreur chargement élèves:", error);
    }
  };

  const fetchCours = async () => {
    try {
      const token = localStorage.getItem("token");
      const mois = currentDate.getMonth() + 1;
      const annee = currentDate.getFullYear();

      const response = await axios.get(
        `${API_URL}/api/cours/?mois=${mois}&annee=${annee}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCours(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement cours:", error);
      setLoading(false);
    }
  };

  const handleOpenModal = (coursToEdit = null) => {
    if (coursToEdit) {
      const dateDebut = new Date(coursToEdit.date_debut);
      setFormData({
        eleve_id: coursToEdit.eleve_id,
        titre: coursToEdit.titre,
        matiere: coursToEdit.matiere || "",
        description: coursToEdit.description || "",
        date_debut: dateDebut.toISOString().split("T")[0],
        heure_debut: dateDebut.toTimeString().slice(0, 5),
        duree: coursToEdit.duree || "60",
        type_cours: coursToEdit.type_cours || "en-ligne",
        lien_visio: coursToEdit.lien_visio || "",
        tarif: coursToEdit.tarif || "",
        devoirs: coursToEdit.devoirs || ""
      });
      setEditingCours(coursToEdit);
    } else {
      setFormData({
        eleve_id: "",
        titre: "",
        matiere: "",
        description: "",
        date_debut: "",
        heure_debut: "",
        duree: "60",
        type_cours: "en-ligne",
        lien_visio: "",
        tarif: "",
        devoirs: ""
      });
      setEditingCours(null);
    }
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCours(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.eleve_id || !formData.titre || !formData.date_debut || !formData.heure_debut) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Combine date and time
      const dateDebut = new Date(`${formData.date_debut}T${formData.heure_debut}`);
      const dateFin = new Date(dateDebut.getTime() + parseInt(formData.duree) * 60000);

      const dataToSend = {
        eleve_id: parseInt(formData.eleve_id),
        titre: formData.titre,
        matiere: formData.matiere || null,
        description: formData.description || null,
        date_debut: dateDebut.toISOString(),
        date_fin: dateFin.toISOString(),
        duree: parseInt(formData.duree),
        type_cours: formData.type_cours,
        lien_visio: formData.lien_visio || null,
        tarif: formData.tarif ? parseInt(formData.tarif) : null,
        devoirs: formData.devoirs || null
      };

      if (editingCours) {
        await axios.put(`${API_URL}/api/cours/${editingCours.id}`, dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } else {
        await axios.post(`${API_URL}/api/cours/`, dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }

      fetchCours();
      handleCloseModal();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      setError(error.response?.data?.detail || "Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce cours ?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/cours/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCours();
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleUpdateStatus = async (id, statut, presente = null) => {
    try {
      const token = localStorage.getItem("token");
      const updates = { statut };
      if (presente !== null) updates.presente = presente;

      await axios.put(`${API_URL}/api/cours/${id}`, updates, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      fetchCours();
    } catch (error) {
      console.error("Erreur mise à jour:", error);
    }
  };

  const getEleveNom = (eleveId) => {
    const eleve = eleves.find((e) => e.id === eleveId);
    return eleve ? `${eleve.prenom} ${eleve.nom}` : "Élève inconnu";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatutBadge = (statut) => {
    const styles = {
      planifie: "bg-blue-100 text-blue-800",
      termine: "bg-green-100 text-green-800",
      annule: "bg-red-100 text-red-800",
      reporte: "bg-orange-100 text-orange-800"
    };

    const labels = {
      planifie: "Planifié",
      termine: "Terminé",
      annule: "Annulé",
      reporte: "Reporté"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[statut] || styles.planifie}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const handleOpenNotesModal = (cours) => {
    setSelectedCoursForNotes(cours);
    setShowNotesModal(true);
  };

  const handleCloseNotesModal = () => {
    setShowNotesModal(false);
    setSelectedCoursForNotes(null);
  };

  const handleNotesSuccess = () => {
    fetchCours();
  };

  const groupedCours = cours.reduce((acc, c) => {
    const date = new Date(c.date_debut).toLocaleDateString("fr-FR");
    if (!acc[date]) acc[date] = [];
    acc[date].push(c);
    return acc;
  }, {});

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendrier</h1>
            <p className="text-gray-600 mt-1">{cours.length} cours ce mois-ci</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-[#437C8B] text-white px-6 py-3 rounded-xl hover:bg-[#35626f] transition-all shadow-md"
          >
            <Plus size={20} />
            <span>Planifier un cours</span>
          </button>
        </div>

        {/* Month navigation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Cours list */}
        {Object.keys(groupedCours).length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun cours ce mois-ci
            </h3>
            <p className="text-gray-600 mb-6">
              Planifiez votre premier cours avec un élève
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center space-x-2 bg-[#437C8B] text-white px-6 py-3 rounded-xl hover:bg-[#35626f] transition-all"
            >
              <Plus size={20} />
              <span>Planifier un cours</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedCours).map(([date, coursList]) => (
              <div key={date} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 capitalize">{date}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {coursList.map((c) => (
                    <div key={c.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Clock size={18} className="text-[#437C8B]" />
                            <span className="font-semibold text-gray-900">
                              {formatTime(c.date_debut)} - {formatTime(c.date_fin)}
                            </span>
                            {getStatutBadge(c.statut)}
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{c.titre}</h4>
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <User size={16} />
                            <span>{getEleveNom(c.eleve_id)}</span>
                          </div>
                          {c.matiere && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Matière:</span> {c.matiere}
                            </p>
                          )}
                          {c.type_cours === "en-ligne" && c.lien_visio && (
                            <a
                              href={c.lien_visio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[#437C8B] hover:underline text-sm"
                            >
                              <Video size={16} />
                              Rejoindre le cours
                            </a>
                          )}
                          {c.type_cours === "presentiel" && (
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <MapPin size={16} />
                              <span>Cours en présentiel</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {c.statut === "planifie" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(c.id, "termine", true)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Marquer comme terminé"
                              >
                                <CheckCircle size={20} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(c.id, "annule")}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Annuler"
                              >
                                <XCircle size={20} />
                              </button>
                            </>
                          )}
                          {c.statut === "termine" && (
                            <button
                              onClick={() => handleOpenNotesModal(c)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Ajouter des notes de cours"
                            >
                              <FileText size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(c)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingCours ? "Modifier le cours" : "Planifier un cours"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Élève <span className="text-red-500">*</span>
                </label>
                <select
                  name="eleve_id"
                  value={formData.eleve_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                >
                  <option value="">Sélectionner un élève</option>
                  {eleves.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.prenom} {e.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Cours de Coran"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matière
                </label>
                <input
                  type="text"
                  name="matiere"
                  value={formData.matiere}
                  onChange={handleChange}
                  placeholder="Coran, Arabe, Tajwid..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date_debut"
                    value={formData.date_debut}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="heure_debut"
                    value={formData.heure_debut}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  name="duree"
                  value={formData.duree}
                  onChange={handleChange}
                  min="15"
                  step="15"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de cours
                </label>
                <select
                  name="type_cours"
                  value={formData.type_cours}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                >
                  <option value="en-ligne">En ligne</option>
                  <option value="presentiel">Présentiel</option>
                  <option value="en-differe">En différé</option>
                </select>
              </div>

              {formData.type_cours === "en-ligne" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lien visio
                  </label>
                  <input
                    type="url"
                    name="lien_visio"
                    value={formData.lien_visio}
                    onChange={handleChange}
                    placeholder="https://zoom.us/..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarif (€)
                </label>
                <input
                  type="number"
                  name="tarif"
                  value={formData.tarif}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description / Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-[#437C8B] text-white px-4 py-3 rounded-xl hover:bg-[#35626f] transition-all font-medium"
                >
                  <Save size={20} />
                  <span>{editingCours ? "Modifier" : "Planifier"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedCoursForNotes && (
        <NotesCoursModal
          cours={selectedCoursForNotes}
          onClose={handleCloseNotesModal}
          onSuccess={handleNotesSuccess}
        />
      )}
    </DashboardLayout>
  );
};

export default DashboardCalendrier;
