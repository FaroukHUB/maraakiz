import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AlertCircle, CheckCircle, Upload, Eye, EyeOff } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
    telephone: "",
    type: "professeur", // professeur, institut, eleve
    accepteCharte: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setError(""); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!formData.accepteCharte) {
      setError("Vous devez accepter la charte pour vous inscrire");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        nom: formData.nom,
        email: formData.email,
        password: formData.password,
        telephone: formData.telephone,
        type: formData.type
      });

      // Redirection après succès
      navigate("/login", {
        state: {
          message: "Inscription réussie! Vous pouvez maintenant vous connecter."
        }
      });
    } catch (err) {
      console.error("Erreur inscription:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Une erreur est survenue lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Rejoindre Maraakiz</h1>
          <p className="text-gray-600">
            La plateforme de référence pour l'apprentissage de l'arabe et du Coran
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Type de compte */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Je souhaite m'inscrire en tant que
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: "professeur" }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === "professeur"
                      ? "border-[#437C8B] bg-[#437C8B] text-white shadow-lg"
                      : "border-gray-200 hover:border-[#437C8B] text-gray-700"
                  }`}
                >
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="font-semibold text-sm">Professeur</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: "institut" }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === "institut"
                      ? "border-[#437C8B] bg-[#437C8B] text-white shadow-lg"
                      : "border-gray-200 hover:border-[#437C8B] text-gray-700"
                  }`}
                >
                  <div className="text-2xl mb-2">🏫</div>
                  <div className="font-semibold text-sm">Institut</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: "eleve" }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === "eleve"
                      ? "border-[#437C8B] bg-[#437C8B] text-white shadow-lg"
                      : "border-gray-200 hover:border-[#437C8B] text-gray-700"
                  }`}
                >
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-semibold text-sm">Élève</div>
                </button>
              </div>
            </div>

            {/* Nom */}
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === "institut" ? "Nom de l'institut" : "Nom complet"} *
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                required
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent outline-none transition-all"
                placeholder={formData.type === "institut" ? "Institut Al-Furqan" : "Ahmed Ibn Ali"}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent outline-none transition-all"
                placeholder="votre@email.com"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent outline-none transition-all"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe * (min. 8 caractères)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#437C8B] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* CHARTE OBLIGATOIRE - EN ROUGE ET EN GROS */}
            <div className="bg-red-50 border-4 border-red-500 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="accepteCharte"
                  name="accepteCharte"
                  checked={formData.accepteCharte}
                  onChange={handleChange}
                  className="mt-1 w-6 h-6 text-red-600 border-red-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="accepteCharte" className="flex-1 cursor-pointer">
                  <span className="block text-lg font-bold text-red-700 mb-2">
                    ⚠️ CONDITION OBLIGATOIRE
                  </span>
                  <span className="block text-base font-semibold text-red-900">
                    Je certifie suivre le Coran et la Sunna selon la compréhension des pieux prédécesseurs
                  </span>
                  <span className="block text-sm text-red-600 mt-2">
                    * Maraakiz se réserve le droit de supprimer tout compte ne respectant pas cette condition
                  </span>
                </label>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-[#437C8B] to-[#35626f] text-white font-bold py-4 rounded-xl transition-all ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Inscription en cours...
                </span>
              ) : (
                "S'inscrire"
              )}
            </button>

            {/* Lien vers login */}
            <div className="text-center text-sm text-gray-600">
              Vous avez déjà un compte?{" "}
              <Link to="/login" className="text-[#437C8B] font-semibold hover:underline">
                Se connecter
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
