import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  BookOpen,
  CreditCard,
  Library
} from "lucide-react";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Navigation items based on user type
  const getNavigationItems = () => {
    if (user?.type === "eleve") {
      return [
        { name: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
        { name: "Mes rapports", path: "/dashboard/mes-rapports", icon: BookOpen },
        { name: "Mes professeurs", path: "/dashboard/mes-professeurs", icon: Users },
        { name: "Messages", path: "/dashboard/messages", icon: MessageSquare },
        { name: "Paramètres", path: "/dashboard/parametres", icon: Settings },
      ];
    } else if (user?.type === "institut") {
      return [
        { name: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
        { name: "Professeurs", path: "/dashboard/professeurs", icon: Users },
        { name: "Élèves", path: "/dashboard/eleves", icon: Users },
        { name: "Paiements", path: "/dashboard/paiements", icon: CreditCard },
        { name: "Messages", path: "/dashboard/messages", icon: MessageSquare },
        { name: "Paramètres", path: "/dashboard/parametres", icon: Settings },
      ];
    } else if (user?.type === "professeur") {
      // Différencier prof salarié vs indépendant
      const isSalarie = user?.institut_id != null;

      if (isSalarie) {
        // Professeur salarié - SANS Paiements
        return [
          { name: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
          { name: "Mes élèves", path: "/dashboard/eleves", icon: Users },
          { name: "Calendrier", path: "/dashboard/calendrier", icon: Calendar },
          { name: "Mes cours", path: "/dashboard/mes-cours", icon: BookOpen },
          { name: "Bibliothèque", path: "/dashboard/bibliotheque", icon: Library },
          { name: "Messages", path: "/dashboard/messages", icon: MessageSquare },
          { name: "Mon profil", path: "/dashboard/profil", icon: User },
          { name: "Paramètres", path: "/dashboard/parametres", icon: Settings },
        ];
      } else {
        // Professeur indépendant - AVEC Paiements
        return [
          { name: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
          { name: "Mes élèves", path: "/dashboard/eleves", icon: Users },
          { name: "Calendrier", path: "/dashboard/calendrier", icon: Calendar },
          { name: "Mes cours", path: "/dashboard/mes-cours", icon: BookOpen },
          { name: "Bibliothèque", path: "/dashboard/bibliotheque", icon: Library },
          { name: "Paiements", path: "/dashboard/paiements", icon: CreditCard },
          { name: "Messages", path: "/dashboard/messages", icon: MessageSquare },
          { name: "Mon profil", path: "/dashboard/profil", icon: User },
          { name: "Paramètres", path: "/dashboard/parametres", icon: Settings },
        ];
      }
    }

    // Fallback par défaut
    return [
      { name: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
      { name: "Paramètres", path: "/dashboard/parametres", icon: Settings },
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg text-gray-600 hover:text-[#437C8B]"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 bg-white border-r border-gray-200 transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200 flex-shrink-0">
          <Link to="/" className="text-2xl font-bold text-[#437C8B]">
            Maraakiz
          </Link>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-[#437C8B] flex items-center justify-center text-white font-semibold text-lg">
              {user?.nom?.charAt(0) || "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.nom || "Utilisateur"}</p>
              <p className="text-sm text-gray-500 capitalize">
                {user?.type === "professeur" ? "Professeur" : user?.type === "institut" ? "Institut" : "Élève"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - flex-1 to take remaining space with overflow */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#437C8B] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout button - flex-shrink-0 to keep at bottom */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
