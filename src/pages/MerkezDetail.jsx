import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  Award,
  Users,
  BookOpen,
  MessageCircle,
  CheckCircle,
  Calendar,
  ArrowLeft,
  Globe,
  Video,
  TrendingUp
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const MerkezDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [merkez, setMerkez] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMerkez = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/public/merkez/${id}`);
        setMerkez(response.data);
      } catch (err) {
        console.error("Erreur chargement merkez:", err);
        setError("Impossible de charger les détails");
      } finally {
        setLoading(false);
      }
    };

    fetchMerkez();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#437C8B]"></div>
      </div>
    );
  }

  if (error || !merkez) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oups!</h2>
          <p className="text-gray-600 mb-4">{error || "Professeur non trouvé"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#437C8B] text-white rounded-xl hover:bg-[#35626f] transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const isProfesseur = merkez.type === "professeur";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec image de couverture */}
      <div className="relative bg-gradient-to-r from-[#437C8B] to-[#35626f] h-64 md:h-80">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg"
        >
          <ArrowLeft size={24} className="text-gray-900" />
        </button>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Colonne gauche - Carte profil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              {/* Photo/Logo */}
              <div className="relative -mt-20 mb-4">
                <img
                  src={merkez.image || "https://via.placeholder.com/200"}
                  alt={merkez.nom}
                  className="w-40 h-40 rounded-2xl mx-auto object-cover border-4 border-white shadow-lg"
                />
                {merkez.verifie && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle size={14} />
                    Vérifié
                  </div>
                )}
              </div>

              {/* Nom et type */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{merkez.nom}</h1>
                <p className="text-gray-600 flex items-center justify-center gap-1">
                  {isProfesseur ? "🎓 Professeur" : "🏫 Institut"}
                </p>
              </div>

              {/* Note et avis */}
              <div className="flex items-center justify-center gap-2 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <Star size={20} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-xl">{merkez.noteMoyenne?.toFixed(1) || "N/A"}</span>
                </div>
                <span className="text-gray-600">({merkez.nombreAvis || 0} avis)</span>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                {isProfesseur ? (
                  <>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users size={20} className="text-[#437C8B]" />
                      <span><strong>{merkez.nombreEleves || 0}</strong> élèves</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Award size={20} className="text-[#437C8B]" />
                      <span><strong>{merkez.nombreCoursDonnes || 0}</strong> cours donnés</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users size={20} className="text-[#437C8B]" />
                      <span><strong>{merkez.nombreProfesseurs || 0}</strong> professeurs</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users size={20} className="text-[#437C8B]" />
                      <span><strong>{merkez.nombreEleves || 0}</strong> élèves formés</span>
                    </div>
                  </>
                )}
              </div>

              {/* Prix */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Tarif</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">
                      {merkez.prixMin}€
                      {merkez.prixMax && merkez.prixMax !== merkez.prixMin && ` - ${merkez.prixMax}€`}
                    </div>
                    <div className="text-xs text-gray-600">par cours</div>
                  </div>
                </div>
                {merkez.premierCoursGratuit && (
                  <div className="mt-2 text-center text-sm font-semibold text-green-700">
                    🎁 1er cours gratuit
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2">
                  <Calendar size={20} />
                  Réserver un cours
                </button>
                <button className="w-full border-2 border-[#437C8B] text-[#437C8B] font-semibold py-3 rounded-xl hover:bg-[#437C8B] hover:text-white transition-all flex items-center justify-center gap-2">
                  <MessageCircle size={20} />
                  Envoyer un message
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite - Détails */}
          <div className="lg:col-span-2 space-y-6">

            {/* Matières enseignées */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="text-[#437C8B]" />
                Matières enseignées
              </h2>
              <div className="flex flex-wrap gap-2">
                {merkez.matieres?.map((matiere, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white rounded-full text-sm font-semibold"
                  >
                    {matiere}
                  </span>
                ))}
              </div>
            </div>

            {/* Formats, Langues, Niveaux */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informations pratiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Formats */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Video size={18} className="text-[#437C8B]" />
                    Format
                  </h3>
                  <div className="space-y-1">
                    {merkez.formats?.map((format, idx) => (
                      <div key={idx} className="text-gray-600 text-sm">
                        • {format === "en-ligne" ? "En ligne" : format === "presentiel" ? "Présentiel" : "En différé"}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Langues */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Globe size={18} className="text-[#437C8B]" />
                    Langues
                  </h3>
                  <div className="space-y-1">
                    {merkez.langues?.map((langue, idx) => (
                      <div key={idx} className="text-gray-600 text-sm">
                        • {langue === "francais" ? "🇫🇷 Français" : langue === "arabe" ? "🇸🇦 Arabe" : "🇬🇧 Anglais"}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Niveaux */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#437C8B]" />
                    Niveaux
                  </h3>
                  <div className="space-y-1">
                    {merkez.niveaux?.map((niveau, idx) => (
                      <div key={idx} className="text-gray-600 text-sm">
                        • {niveau.charAt(0).toUpperCase() + niveau.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cursus (Professeur) ou Présentation (Institut) */}
            {isProfesseur && merkez.cursus && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="text-[#437C8B]" />
                  Cursus et diplômes
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {merkez.cursus}
                </div>
              </div>
            )}

            {!isProfesseur && merkez.presentationInstitut && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🏫 Présentation de l'institut
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {merkez.presentationInstitut}
                </div>
              </div>
            )}

            {/* Infrastructure (Institut uniquement) */}
            {!isProfesseur && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Notre équipe</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-[#437C8B]">{merkez.nombreProfesseurs || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Professeurs</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-[#437C8B]">{merkez.nombreSecretaires || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Secrétaires</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-[#437C8B]">{merkez.nombreSuperviseurs || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Superviseurs</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-[#437C8B]">{merkez.nombreResponsablesPedagogiques || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Resp. péda.</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-[#437C8B]">{merkez.nombreGestionnaires || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Gestionnaires</div>
                  </div>
                </div>
              </div>
            )}

            {/* Programme */}
            {merkez.programme && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📚 Programme
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {merkez.programme}
                </div>
              </div>
            )}

            {/* Livres utilisés */}
            {merkez.livres && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📖 Supports pédagogiques
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {merkez.livres}
                </div>
              </div>
            )}

            {/* Méthodologie */}
            {merkez.methodologie && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🎯 Méthodologie
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {merkez.methodologie}
                </div>
              </div>
            )}

            {/* Public cible */}
            {merkez.publicCible && merkez.publicCible.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Public accepté</h2>
                <div className="flex flex-wrap gap-2">
                  {merkez.publicCible.map((pub, idx) => (
                    <span key={idx} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {pub === "homme" ? "🔵 Homme" : pub === "femme" ? "🟣 Femme" : pub === "garcon" ? "🔷 Garçon" : "💜 Fille"}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MerkezDetail;
