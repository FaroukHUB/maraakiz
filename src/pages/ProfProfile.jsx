import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Star, MapPin, Video, Clock, Users, Shield, CheckCircle, Mail, Phone } from "lucide-react";
import Header from "../components/Header";

const API_URL = "http://127.0.0.1:8000";

const ProfProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prof, setProf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProf = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/public/merkez/${id}`);
        setProf(response.data);
      } catch (error) {
        console.error("Erreur chargement prof:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProf();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#437C8B] mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  if (!prof) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Professeur non trouvé</h2>
            <button
              onClick={() => navigate("/")}
              className="mt-4 text-[#437C8B] hover:underline"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Bouton retour */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne gauche - Carte profil */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
                {/* Photo */}
                <div className="relative h-64 sm:h-80">
                  <img
                    src={prof.image || "https://via.placeholder.com/400"}
                    alt={prof.nom}
                    className="w-full h-full object-cover"
                  />
                  {prof.verifie && (
                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                      <CheckCircle className="text-green-500" size={24} />
                    </div>
                  )}
                </div>

                {/* Infos principales */}
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{prof.nom}</h1>

                  {/* Note */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-yellow-500" size={20} />
                      <span className="font-semibold text-lg">{prof.noteMoyenne}</span>
                    </div>
                    <span className="text-gray-600">({prof.nombreAvis} avis)</span>
                  </div>


                  {/* Prix */}
                  <div className="bg-[#437C8B]/10 rounded-xl p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-1">À partir de</div>
                    <div className="text-3xl font-bold text-[#437C8B]">
                      {prof.prixMin}€<span className="text-lg font-normal">/h</span>
                    </div>
                    {prof.prixMax && prof.prixMax !== prof.prixMin && (
                      <div className="text-sm text-gray-600 mt-1">
                        Jusqu'à {prof.prixMax}€/h
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {prof.nouveau && (
                      <span className="bg-[#437C8B] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Nouveau
                      </span>
                    )}
                    {prof.premierCoursGratuit && (
                      <span className="bg-[#A8835D] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        1er cours gratuit
                      </span>
                    )}
                  </div>

                  {/* Bouton contact */}
                  <button className="w-full bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg">
                    {prof.type === "institut" ? "Contacter l'institut" : "Contacter le professeur"}
                  </button>

                  {/* Contact info */}
                  {(prof.email || prof.telephone) && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                      {prof.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={16} />
                          <span>{prof.email}</span>
                        </div>
                      )}
                      {prof.telephone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={16} />
                          <span>{prof.telephone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite - Détails */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cursus (Professeur) ou Présentation (Institut) */}
              {prof.type === "professeur" && prof.cursus && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Cursus</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {prof.cursus}
                  </p>
                </div>
              )}

              {prof.type === "institut" && prof.presentationInstitut && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Présentation de l'institut</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {prof.presentationInstitut}
                  </p>
                </div>
              )}

              {/* Équipe (Institut uniquement) */}
              {prof.type === "institut" && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre équipe</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {prof.nombreProfesseurs > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-[#437C8B]/5 rounded-xl">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#437C8B] rounded-full flex items-center justify-center">
                          <Users size={24} className="text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#437C8B]">{prof.nombreProfesseurs}</div>
                          <div className="text-sm text-gray-600">Professeurs dévoués et motivés</div>
                        </div>
                      </div>
                    )}
                    {prof.nombreSecretaires > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-[#437C8B]/5 rounded-xl">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#A8835D] rounded-full flex items-center justify-center text-white text-xl font-bold">
                          📋
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#A8835D]">{prof.nombreSecretaires}</div>
                          <div className="text-sm text-gray-600">Secrétaires pour votre suivi</div>
                        </div>
                      </div>
                    )}
                    {prof.nombreSuperviseurs > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-[#437C8B]/5 rounded-xl">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#437C8B] rounded-full flex items-center justify-center">
                          <Shield size={24} className="text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#437C8B]">{prof.nombreSuperviseurs}</div>
                          <div className="text-sm text-gray-600">Superviseurs</div>
                        </div>
                      </div>
                    )}
                    {prof.nombreResponsablesPedagogiques > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-[#437C8B]/5 rounded-xl">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#35626f] rounded-full flex items-center justify-center text-white text-xl font-bold">
                          🎓
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#35626f]">{prof.nombreResponsablesPedagogiques}</div>
                          <div className="text-sm text-gray-600">Responsables pédagogiques</div>
                        </div>
                      </div>
                    )}
                    {prof.nombreGestionnaires > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-[#437C8B]/5 rounded-xl">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#A8835D] rounded-full flex items-center justify-center text-white text-xl font-bold">
                          💼
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#A8835D]">{prof.nombreGestionnaires}</div>
                          <div className="text-sm text-gray-600">Gestionnaires</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Matières enseignées */}
              {prof.matieres && prof.matieres.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Matières enseignées</h2>
                  <div className="flex flex-wrap gap-3">
                    {prof.matieres.map((matiere, index) => (
                      <span
                        key={index}
                        className="bg-[#437C8B]/10 text-[#437C8B] font-medium px-4 py-2 rounded-lg text-sm capitalize"
                      >
                        {matiere}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Programme enseigné */}
              {prof.programme && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Programme enseigné</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {prof.programme}
                  </p>
                </div>
              )}

              {/* Livres et supports utilisés */}
              {prof.livres && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Livres et supports utilisés</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {prof.livres}
                  </p>
                </div>
              )}

              {/* Méthodologie */}
              {prof.methodologie && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Méthodologie</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {prof.methodologie}
                  </p>
                </div>
              )}

              {/* Formats et modalités */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Formats */}
                {prof.formats && prof.formats.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Video size={20} className="text-[#437C8B]" />
                      Format des cours
                    </h3>
                    <div className="space-y-2">
                      {prof.formats.map((format, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#437C8B] rounded-full"></div>
                          <span className="text-gray-700 capitalize">{format}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Niveaux */}
                {prof.niveaux && prof.niveaux.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield size={20} className="text-[#437C8B]" />
                      Niveaux
                    </h3>
                    <div className="space-y-2">
                      {prof.niveaux.map((niveau, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#437C8B] rounded-full"></div>
                          <span className="text-gray-700 capitalize">{niveau}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Langues */}
                {prof.langues && prof.langues.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🗣️
                      Langues
                    </h3>
                    <div className="space-y-2">
                      {prof.langues.map((langue, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#437C8B] rounded-full"></div>
                          <span className="text-gray-700 capitalize">{langue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Public cible */}
                {prof.publicCible && prof.publicCible.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users size={20} className="text-[#437C8B]" />
                      Public cible
                    </h3>
                    <div className="space-y-2">
                      {prof.publicCible.map((public_, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#437C8B] rounded-full"></div>
                          <span className="text-gray-700 capitalize">{public_}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Statistiques */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistiques</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#437C8B]">{prof.nombreEleves}</div>
                    <div className="text-sm text-gray-600 mt-1">Élèves</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#437C8B]">{prof.nombreCoursDonnes}</div>
                    <div className="text-sm text-gray-600 mt-1">Cours donnés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#437C8B]">{prof.nombreAvis}</div>
                    <div className="text-sm text-gray-600 mt-1">Avis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfProfile;
