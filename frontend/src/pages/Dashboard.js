import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { FileText, Lightning, Code, FolderOpen } from "@phosphor-icons/react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-16">
          <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter text-white leading-none mb-4">
            AI-POWERED
            <br />
            JENKINS DOCUMENTATION
          </h1>
          <p className="text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
            Generate comprehensive pipeline documentation from screenshots using
            Claude Sonnet 4.5 and Gemini 3 Flash. Optimized for complex DevOps
            workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <Link
            to="/new"
            className="group p-8 bg-[#121214] border border-[#27272A] hover:border-white transition-all"
            data-testid="create-new-doc-card"
          >
            <div className="mb-4">
              <FileText size={40} weight="bold" className="text-[#002FA7]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-heading">
              CREATE NEW
            </h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Upload screenshots and generate documentation
            </p>
          </Link>

          <Link
            to="/history"
            className="group p-8 bg-[#121214] border border-[#27272A] hover:border-white transition-all"
            data-testid="view-history-card"
          >
            <div className="mb-4">
              <FolderOpen size={40} weight="bold" className="text-[#002FA7]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-heading">
              HISTORY
            </h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              View and manage past documentation
            </p>
          </Link>

          <Link
            to="/templates"
            className="group p-8 bg-[#121214] border border-[#27272A] hover:border-white transition-all"
            data-testid="manage-templates-card"
          >
            <div className="mb-4">
              <Code size={40} weight="bold" className="text-[#002FA7]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-heading">
              TEMPLATES
            </h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Manage pipeline documentation templates
            </p>
          </Link>

          <div className="p-8 bg-[#121214] border border-[#27272A]">
            <div className="mb-4">
              <Lightning size={40} weight="bold" className="text-[#FFCC00]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 font-heading">
              AI-POWERED
            </h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Claude & Gemini integration for intelligent analysis
            </p>
          </div>
        </div>

        <div className="bg-[#121214] border border-[#27272A] p-8">
          <h2 className="text-2xl font-bold text-white mb-6 font-heading tracking-tight">
            FEATURES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-2 h-2 bg-[#002FA7] mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Screen Capture</h4>
                  <p className="text-sm text-[#A1A1AA]">
                    Upload screenshots or record your screen
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-2 h-2 bg-[#002FA7] mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold mb-1">AI Generation</h4>
                  <p className="text-sm text-[#A1A1AA]">
                    Powered by Claude Sonnet 4.5 and Gemini 3 Flash
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#002FA7] mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    Jenkins Optimization
                  </h4>
                  <p className="text-sm text-[#A1A1AA]">
                    Specialized for pipeline documentation
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-2 h-2 bg-[#002FA7] mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    Export Options
                  </h4>
                  <p className="text-sm text-[#A1A1AA]">
                    Download as PDF or Word document
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-2 h-2 bg-[#002FA7] mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    Edit & Refine
                  </h4>
                  <p className="text-sm text-[#A1A1AA]">
                    Modify generated documentation as needed
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#002FA7] mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    Custom Templates
                  </h4>
                  <p className="text-sm text-[#A1A1AA]">
                    Create reusable documentation templates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}