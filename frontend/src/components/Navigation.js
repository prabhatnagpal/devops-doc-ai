import { Link, useLocation } from "react-router-dom";
import { FileText, Plus, Clock, Layout } from "@phosphor-icons/react";

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-nav sticky top-0 z-50" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <FileText size={32} weight="bold" className="text-[#002FA7]" />
            <h1 className="font-heading text-2xl font-black tracking-tighter text-white">
              JENKINS DOC GEN
            </h1>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/new"
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                isActive("/new")
                  ? "text-white border-b-2 border-white"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
              data-testid="nav-new"
            >
              <Plus size={16} weight="bold" className="inline mr-2" />
              NEW
            </Link>
            <Link
              to="/history"
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                isActive("/history")
                  ? "text-white border-b-2 border-white"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
              data-testid="nav-history"
            >
              <Clock size={16} weight="bold" className="inline mr-2" />
              HISTORY
            </Link>
            <Link
              to="/templates"
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                isActive("/templates")
                  ? "text-white border-b-2 border-white"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
              data-testid="nav-templates"
            >
              <Layout size={16} weight="bold" className="inline mr-2" />
              TEMPLATES
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}