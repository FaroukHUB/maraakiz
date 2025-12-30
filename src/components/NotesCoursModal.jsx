import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, FileText, BookOpen, CheckCircle, AlertCircle, Upload, File, Trash2 } from "lucide-react";

const API_URL = "http://localhost:8000";

const NotesCoursModal = ({ cours, existingNotes, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [notesId, setNotesId] = useState(existingNotes?.id || null);
  const [fichiers, setFichiers] = useState(existingNotes?.fichiers || []);
  const [formData, setFormData] = useState({
    resume: existingNotes?.resume || "",
    vu_en_cours: existingNotes?.vu_en_cours || "",
    devoirs: existingNotes?.devoirs || "",
    a_revoir: existingNotes?.a_revoir || "",
    a_voir_prochaine_fois: existingNotes?.a_voir_prochaine_fois || "",
    commentaire_prof: existingNotes?.commentaire_prof || "",
    progression_pourcentage: existingNotes?.progression_pourcentage || "",
    note: existingNotes?.note || ""
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

      let response;
      if (notesId) {
        // Update existing notes
        response = await axios.put(`${API_URL}/api/notes-cours/${notesId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new notes
        response = await axios.post(`${API_URL}/api/notes-cours`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotesId(response.data.id);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des notes:", error);
      alert("Erreur lors de l'enregistrement des notes de cours");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if notes exist first
    if (!notesId) {
      alert("Veuillez d'abord enregistrer les notes avant d'ajouter des fichiers");
      return;
    }

    setUploadingFile(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_URL}/api/notes-cours/${notesId}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setFichiers(response.data.fichiers || []);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload du fichier");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (index) => {
    if (!window.confirm("Supprimer ce fichier ?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/api/notes-cours/${notesId}/files/${index}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFichiers(response.data.fichiers || []);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du fichier");
    }
  };

  const getFileIcon = (type) => {
    if (type?.includes("pdf")) return "📄";
    if (type?.includes("image")) return "🖼️";
    if (type?.includes("audio")) return "🔊";
    if (type?.includes("video")) return "🎬";
    return "📎";
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

          {/* File Upload Section */}
          <div className="border-t pt-6">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
              <Upload size={18} className="text-[#437C8B]" />
              <span>Fichiers joints (PDF, images, audio, vidéo)</span>
            </label>

            {notesId ? (
              <div>
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-[#437C8B] rounded-xl cursor-pointer hover:bg-[#437C8B]/5 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.mp3,.wav,.mp4,.webm"
                    className="hidden"
                  />
                  <div className="flex items-center space-x-2 text-[#437C8B]">
                    <Upload size={20} />
                    <span className="font-medium">
                      {uploadingFile ? "Upload en cours..." : "📎 Ajouter un fichier"}
                    </span>
                  </div>
                </label>

                {/* Display uploaded files */}
                {fichiers && fichiers.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {fichiers.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getFileIcon(file.type)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.nom}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(file.uploaded_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#437C8B] hover:bg-[#437C8B]/10 rounded-lg transition-colors"
                          >
                            <File size={18} />
                          </a>
                          <button
                            onClick={() => handleDeleteFile(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                💡 Enregistrez d'abord les notes pour pouvoir ajouter des fichiers
              </div>
            )}
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
