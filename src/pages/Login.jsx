import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      // FormData pour l'authentification (FastAPI OAuth2)
      const loginData = new FormData();
      loginData.append("username", formData.email);
      loginData.append("password", formData.password);

      const response = await axios.post(`${API_URL}/api/auth/login`, loginData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      // Stocker le token
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirection selon le type d'utilisateur
      const userType = response.data.user.type;
      if (userType === "professeur" || userType === "institut") {
        navigate("/dashboard");
      } else if (userType === "eleve") {
        navigate("/dashboard/eleve");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Erreur connexion:", err);
      if (err.response?.status === 401) {
        setError("Email ou mot de passe incorrect");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Une erreur est survenue lors de la connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Connexion</h1>
          <p className="text-gray-600">
            Accédez à votre espace Maraakiz
          </p>
        </div>

        {/* Message de succès (après inscription) */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
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
                autoComplete="email"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link to="/mot-de-passe-oublie" className="text-sm text-[#437C8B] hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>
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
                  autoComplete="current-password"
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
                  Connexion en cours...
                </span>
              ) : (
                "Se connecter"
              )}
            </button>

            {/* Lien vers register */}
            <div className="text-center text-sm text-gray-600">
              Pas encore de compte?{" "}
              <Link to="/register" className="text-[#437C8B] font-semibold hover:underline">
                S'inscrire gratuitement
              </Link>
            </div>
          </form>
        </div>

        {/* Retour accueil */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-[#437C8B] transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
