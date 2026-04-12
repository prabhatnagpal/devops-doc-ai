import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import axios from "axios";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  FloppyDisk,
  FilePdf,
  FileDoc,
  Pencil,
  ArrowLeft,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EditDocumentation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocumentation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDocumentation = async () => {
    try {
      const response = await axios.get(`${API}/documentations/${id}`);
      setDoc(response.data);
      setContent(response.data.content);
      setTitle(response.data.title);
    } catch (error) {
      toast.error("Failed to load documentation");
      console.error(error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/documentations/${id}`, {
        title,
        content,
      });
      toast.success("Documentation saved");
      setEditing(false);
      fetchDocumentation();
    } catch (error) {
      toast.error("Failed to save");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.get(`${API}/export/pdf/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    }
  };

  const handleExportWord = async () => {
    try {
      const response = await axios.get(`${API}/export/word/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Word document downloaded");
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    }
  };

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#0A0A0C]">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-[#A1A1AA]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/history")}
              className="text-[#A1A1AA] hover:text-white transition-colors"
              data-testid="back-to-history-btn"
            >
              <ArrowLeft size={24} weight="bold" />
            </button>
            {editing ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-heading text-4xl font-black tracking-tighter text-white bg-transparent border-b-2 border-white focus:outline-none"
                data-testid="edit-title-input"
              />
            ) : (
              <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button
                  onClick={() => {
                    setEditing(false);
                    setContent(doc.content);
                    setTitle(doc.title);
                  }}
                  className="btn-ghost"
                  data-testid="cancel-edit-btn"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                  data-testid="save-changes-btn"
                >
                  <FloppyDisk size={16} weight="bold" className="mr-2" />
                  {saving ? "SAVING..." : "SAVE"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setEditing(true)}
                  className="btn-ghost"
                  data-testid="edit-doc-btn"
                >
                  <Pencil size={16} weight="bold" className="mr-2" />
                  EDIT
                </Button>
                <Button
                  onClick={handleExportPDF}
                  className="btn-ghost"
                  data-testid="export-pdf-btn"
                >
                  <FilePdf size={16} weight="bold" className="mr-2" />
                  PDF
                </Button>
                <Button
                  onClick={handleExportWord}
                  className="btn-ghost"
                  data-testid="export-word-btn"
                >
                  <FileDoc size={16} weight="bold" className="mr-2" />
                  WORD
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#121214] border border-[#27272A] p-8">
          {editing ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[600px] bg-[#000000] border-[#27272A] text-white font-mono text-sm leading-relaxed focus:border-white"
              data-testid="content-editor"
            />
          ) : (
            <div
              className="prose prose-invert max-w-none"
              data-testid="content-viewer"
            >
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          background: "#000000",
                          border: "1px solid #27272A",
                          padding: "1rem",
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-[#1A1A1D] px-2 py-1 text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-white mb-4 font-heading tracking-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-white mb-3 font-heading tracking-tight mt-8">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-white mb-2 font-heading mt-6">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-[#A1A1AA] mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-[#A1A1AA] mb-4 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-[#A1A1AA] mb-4 space-y-2">
                      {children}
                    </ol>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}