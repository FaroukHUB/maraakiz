import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, File, Video, Music, Image, FileText, Trash2, Eye, Download, FolderOpen, Lock, Unlock, Users } from "lucide-react";

const API_URL = "http://localhost:8000";

const DashboardBibliotheque = () => {
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    acces_type: "prive",
    dossier: ""
  });
  const [eleves, setEleves] = useState([]);
  const [selectedEleves, setSelectedEleves] = useState([]);
  const [filterCategorie, setFilterCategorie] = useState("");
  const [filterDossier, setFilterDossier] = useState("");

  useEffect(() => {
    fetchRessources();
    fetchEleves();
  }, [filterCategorie, filterDossier]);

  const fetchRessources = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filterCategorie) params.append("categorie", filterCategorie);
      if (filterDossier) params.append("dossier", filterDossier);

      const response = await axios.get(`${API_URL}/api/bibliotheque?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRessources(response.data);
    } catch (error) {
      console.error("Erreur chargement ressources:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEleves = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/eleves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEleves(response.data);
    } catch (error) {
      console.error("Erreur chargement élèves:", error);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Veuillez sélectionner un fichier");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const uploadData = new FormData();
      uploadData.append("file", selectedFile);
      uploadData.append("titre", formData.titre);
      uploadData.append("description", formData.description);
      uploadData.append("acces_type", formData.acces_type);
      uploadData.append("dossier", formData.dossier);

      if (formData.acces_type === "specifique") {
        uploadData.append("eleves_autorises", JSON.stringify(selectedEleves));
      }

      await axios.post(`${API_URL}/api/bibliotheque/upload`, uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Fichier uploadé avec succès");
      setSelectedFile(null);
      setFormData({ titre: "", description: "", acces_type: "prive", dossier: "" });
      setSelectedEleves([]);
      fetchRessources();
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette ressource ?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/bibliotheque/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRessources();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const getFileIcon = (categorie) => {
    switch (categorie) {
      case "video": return <Video size={24} className="text-red-500" />;
      case "audio": return <Music size={24} className="text-purple-500" />;
      case "image": return <Image size={24} className="text-blue-500" />;
      case "document": return <FileText size={24} className="text-green-500" />;
      default: return <File size={24} className="text-gray-500" />;
    }
  };

  const getAccesIcon = (acces_type) => {
    switch (acces_type) {
      case "public": return <Unlock size={18} className="text-green-600" />;
      case "eleves": return <Users size={18} className="text-blue-600" />;
      case "specifique": return <Lock size={18} className="text-orange-600" />;
      default: return <Lock size={18} className="text-gray-600" />;
    }
  };

  const getAccesLabel = (acces_type) => {
    switch (acces_type) {
      case "public": return "Public";
      case "eleves": return "Tous les élèves";
      case "specifique": return "Élèves spécifiques";
      default: return "Privé";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Bibliothèque</h1>
        <p className="text-gray-600">Gérez vos ressources pédagogiques</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Upload size={24} className="mr-2 text-[#437C8B]" />
          Uploader un fichier
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dossier (optionnel)
              </label>
              <input
                type="text"
                value={formData.dossier}
                onChange={(e) => setFormData({ ...formData, dossier: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
                placeholder="Ex: Niveau 1, Coran..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contrôle d'accès
            </label>
            <select
              value={formData.acces_type}
              onChange={(e) => setFormData({ ...formData, acces_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
            >
              <option value="prive">🔒 Privé</option>
              <option value="public">🌍 Public</option>
              <option value="eleves">👥 Tous mes élèves</option>
              <option value="specifique">🎯 Élèves spécifiques</option>
            </select>
          </div>

          {formData.acces_type === "specifique" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sélectionner les élèves
              </label>
              <div className="border border-gray-300 rounded-xl p-4 max-h-40 overflow-y-auto">
                {eleves.map((eleve) => (
                  <label key={eleve.id} className="flex items-center space-x-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedEleves.includes(eleve.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEleves([...selectedEleves, eleve.id]);
                        } else {
                          setSelectedEleves(selectedEleves.filter(id => id !== eleve.id));
                        }
                      }}
                      className="rounded text-[#437C8B] focus:ring-[#437C8B]"
                    />
                    <span>{eleve.prenom} {eleve.nom}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fichier *
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif,.mp3,.wav,.ogg,.mp4,.webm"
              required
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Fichier sélectionné: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Upload en cours..." : "📤 Uploader le fichier"}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex flex-wrap gap-4">
        <select
          value={filterCategorie}
          onChange={(e) => setFilterCategorie(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
        >
          <option value="">Toutes les catégories</option>
          <option value="video">🎬 Vidéos</option>
          <option value="audio">🔊 Audio</option>
          <option value="image">🖼️ Images</option>
          <option value="document">📄 Documents</option>
        </select>

        <input
          type="text"
          value={filterDossier}
          onChange={(e) => setFilterDossier(e.target.value)}
          placeholder="Filtrer par dossier..."
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent"
        />
      </div>

      {/* Resources List */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Mes ressources ({ressources.length})
        </h2>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : ressources.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Aucune ressource pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ressources.map((ressource) => (
              <div
                key={ressource.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(ressource.categorie)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{ressource.titre}</h3>
                      {ressource.dossier && (
                        <p className="text-xs text-gray-500">📁 {ressource.dossier}</p>
                      )}
                    </div>
                  </div>
                  {getAccesIcon(ressource.acces_type)}
                </div>

                {ressource.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {ressource.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{getAccesLabel(ressource.acces_type)}</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      {ressource.vues}
                    </span>
                    <span className="flex items-center">
                      <Download size={14} className="mr-1" />
                      {ressource.telecharges}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <a
                    href={ressource.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-[#437C8B] text-white text-center rounded-lg hover:bg-[#35626f] transition-colors text-sm"
                  >
                    📂 Voir
                  </a>
                  <button
                    onClick={() => handleDelete(ressource.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardBibliotheque;
