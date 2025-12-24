import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCcw,
  Users,
  Video,
  BookOpen,
  Globe,
  Mic,
  Clock4,
  GraduationCap,
  Languages,
  Target,
  ShieldCheck
} from "lucide-react";

const PublicMerkezGrid = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      filters[key].forEach((val) => queryParams.append(key, val));
    });

    axios
      .get(`http://localhost:8001/public/merkez?${queryParams.toString()}`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      });
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleFilterClick = (key, value) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(value);
      const updated = exists
        ? current.filter((v) => v !== value)
        : [...current, value];
      const newFilters = { ...prev, [key]: updated };
      if (newFilters[key].length === 0) delete newFilters[key];
      return newFilters;
    });
  };

  const groupedFilters = [
    {
      title: "Matières",
      options: [
        { key: "enseignement", label: "Arabe", icon: <BookOpen size={16} /> },
        { key: "enseignement", label: "Tajwid", icon: <Mic size={16} /> },
        { key: "enseignement", label: "Coran", icon: <Clock4 size={16} /> },
        { key: "enseignement", label: "Sciences religieuses", icon: <GraduationCap size={16} /> }
      ]
    },
    {
      title: "Format de cours",
      options: [
        { key: "format", label: "Individuel", icon: <Users size={16} /> },
        { key: "format", label: "Binôme", icon: <Users size={16} /> },
        { key: "format", label: "Groupe", icon: <Users size={16} /> }
      ]
    },
    {
      title: "Mode d’enseignement",
      options: [
        { key: "mode", label: "En ligne", icon: <Video size={16} /> },
        { key: "mode", label: "Présentiel", icon: <Globe size={16} /> },
        { key: "mode", label: "En différé", icon: <Clock4 size={16} /> }
      ]
    },
    {
      title: "Langue d’enseignement",
      options: [
        { key: "langue", label: "Français", icon: <Languages size={16} /> },
        { key: "langue", label: "Arabe", icon: <Languages size={16} /> },
        { key: "langue", label: "Anglais", icon: <Languages size={16} /> }
      ]
    },
    {
      title: "Niveau",
      options: [
        { key: "niveau", label: "Débutant", icon: <Target size={16} /> },
        { key: "niveau", label: "Intermédiaire", icon: <Target size={16} /> },
        { key: "niveau", label: "Avancé", icon: <Target size={16} /> }
      ]
    },
    {
      title: "Public cible",
      options: [
        { key: "public", label: "Enfants", icon: <ShieldCheck size={16} /> },
        { key: "public", label: "Adolescents", icon: <ShieldCheck size={16} /> },
        { key: "public", label: "Hommes", icon: <ShieldCheck size={16} /> },
        { key: "public", label: "Femmes", icon: <ShieldCheck size={16} /> }
      ]
    }
  ];

  return (
    <section className="bg-white py-16 px-4 md:px-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        <h2 className="text-3xl font-title text-[#3D4C66] font-bold">
          Trouver un cours
        </h2>
        <button
          onClick={handleResetFilters}
          className="flex items-center gap-2 text-[#437C8B] hover:underline"
        >
          <RefreshCcw size={18} /> Réinitialiser
        </button>
      </div>

      {/* Filtres groupés */}
      <div className="space-y-16 mb-10">
        {groupedFilters.map((group, i) => (
          <div key={i} className="text-center">
            <h3 className="text-xl font-bold text-[#3D4C66] mb-6">
              {group.title}
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              {group.options.map((filter, index) => {
                const isSelected = filters[filter.key]?.includes(filter.label);
                return (
                  <button
                    key={index}
                    onClick={() => handleFilterClick(filter.key, filter.label)}
                    className={`w-44 py-6 rounded-xl border text-center text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center gap-2 shadow-sm ${
                      isSelected
                        ? "bg-[#437C8B] text-white border-[#437C8B]"
                        : "bg-gray-100 text-black border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Grille de professeurs */}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition duration-300"
            >
              <a href={`/fiche/${item.id}`}>
                <img
                  src={item.image_url || "/default.jpg"}
                  alt={item.nom}
                  className="w-full h-60 object-cover"
                />
              </a>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-[#3D4C66]">
                  {item.nom}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.note ? `${item.note} ⭐ (${item.nb_avis} avis)` : "Pas encore de note"}
                </p>
                <p className="text-sm text-gray-600 mt-2 mb-4 line-clamp-3">
                  {item.description}
                </p>
                <a
                  href={`/fiche/${item.id}`}
                  className="text-[#A8835D] font-semibold hover:underline"
                >
                  Voir plus
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PublicMerkezGrid;
