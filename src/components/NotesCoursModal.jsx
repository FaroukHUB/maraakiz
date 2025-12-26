import React, { useState } from "react";
import axios from "axios";
import { X, FileText, BookOpen, CheckCircle, AlertCircle, Upload } from "lucide-react";

const API_URL = "http://localhost:8000";

const NotesCoursModal = ({ cours, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    resume: "",
    vu_en_cours: "",
    devoirs: "",
    a_revoir: "",
    a_voir_prochaine_fois: "",
    commentaire_prof: "",
    progression_pourcentage: "",
    note: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const data = {
        cours_id: cours.id,
        ...formData,
        progression_pourcentage: formData.progression_pourcentage
          ? parseInt(formData.progression_pourcentage)
          : null
      };

      await axios.post(`${API_URL}/api/notes-cours`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout des notes:", error);
      alert("Erreur lors de l'ajout des notes de cours");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">📝 Notes de cours</h2>
              <p className="text-sm opacity-90">
                Cours du {new Date(cours.date_heure).toLocaleDateString('fr-FR')} - {cours.titre}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Résumé du cours */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText size={18} className="text-[#437C8B]" />
              <span>Résumé général du cours</span>
            </label>
            <textarea
              value={formData.resume}
              onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent resize-none"
              placeholder="Vue d'ensemble de ce qui a été fait pendant le cours..."
            />
          </div>

          {/* Vu en cours */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <BookOpen size={18} className="text-green-600" />
              <span>Ce qui a été étudié</span>
            </label>
            <textarea
              value={formData.vu_en_cours}
              onChange={(e) => setFormData({ ...formData, vu_en_cours: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent resize-none"
              placeholder="Points du programme vus pendant le cours..."
            />
          </div>

          {/* Devoirs */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <CheckCircle size={18} className="text-orange-600" />
              <span>Devoirs à faire</span>
            </label>
            <textarea
              value={formData.devoirs}
              onChange={(e) => setFormData({ ...formData, devoirs: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent resize-none"
              placeholder="Exercices, lectures, révisions à faire pour le prochain cours..."
            />
          </div>

          {/* À revoir */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <AlertCircle size={18} className="text-red-600" />
              <span>Points à revoir / Difficultés rencontrées</span>
            </label>
            <textarea
              value={formData.a_revoir}
              onChange={(e) => setFormData({ ...formData, a_revoir: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent resize-none"
              placeholder="Points non maîtrisés, concepts à approfondir..."
            />
          </div>

          {/* Pour le prochain cours */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
              <BookOpen size={18} className="text-purple-600" />
              <span>À voir la prochaine fois</span>
            </label>
            <textarea
              value={formData.a_voir_prochaine_fois}
              onChange={(e) => setFormData({ ...formData, a_voir_prochaine_fois: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent resize-none"
              placeholder="Programme prévu pour la prochaine séance..."
            />
          </div>

          {/* Commentaire du professeur */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              💬 Commentaire du professeur
            </label>
            <textarea
              value={formData.commentaire_prof}
              onChange={(e) => setFormData({ ...formData, commentaire_prof: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent resize-none"
              placeholder="Remarques générales, encouragements, conseils..."
            />
          </div>

          {/* Progression et Note */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📊 Progression (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progression_pourcentage}
                onChange={(e) => setFormData({ ...formData, progression_pourcentage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                placeholder="0-100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⭐ Appréciation
              </label>
              <select
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                <option value="Excellent">Excellent</option>
                <option value="Très bien">Très bien</option>
                <option value="Bien">Bien</option>
                <option value="Passable">Passable</option>
                <option value="À améliorer">À améliorer</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Enregistrement..." : "✓ Enregistrer les notes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotesCoursModal;
