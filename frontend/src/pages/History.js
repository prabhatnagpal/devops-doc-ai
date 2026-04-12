import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import axios from "axios";
import { toast } from "sonner";
import { Pencil, Trash, FileText, Calendar } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function History() {
  const [documentations, setDocumentations] = useState([]);

  useEffect(() => {
    fetchDocumentations();
  }, []);

  const fetchDocumentations = async () => {
    try {
      const response = await axios.get(`${API}/documentations`);
      setDocumentations(response.data);
    } catch (error) {
      toast.error("Failed to load history");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/documentations/${id}`);
      toast.success("Documentation deleted");
      fetchDocumentations();
    } catch (error) {
      toast.error("Delete failed");
      console.error(error);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter text-white leading-none mb-2">
            DOCUMENTATION HISTORY
          </h1>
          <p className="text-base text-[#A1A1AA]">
            View and manage all generated documentation
          </p>
        </div>

        {documentations.length === 0 ? (
          <div className="bg-[#121214] border border-[#27272A] p-12 text-center">
            <FileText size={64} weight="bold" className="mx-auto mb-4 text-[#27272A]" />
            <h3 className="text-xl font-bold text-white mb-2 font-heading">
              NO DOCUMENTATION YET
            </h3>
            <p className="text-[#A1A1AA] mb-6">Create your first documentation to get started</p>
            <Link to="/new">
              <Button className="btn-primary" data-testid="create-first-doc-btn">
                CREATE NEW
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1 bg-[#27272A]">
            {documentations.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#121214] p-6 hover:bg-[#1A1A1D] transition-colors border-r border-b border-[#27272A]"
                data-testid={`doc-item-${doc.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to={`/edit/${doc.id}`}>
                      <h3 className="text-xl font-bold text-white mb-2 hover:text-[#002FA7] transition-colors font-heading">
                        {doc.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-[#A1A1AA]">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} weight="bold" />
                        <span className="font-mono">{formatDate(doc.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText size={16} weight="bold" />
                        <span className="font-mono">{doc.file_ids.length} file(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/edit/${doc.id}`}>
                      <Button className="btn-ghost" data-testid={`edit-doc-${doc.id}`}>
                        <Pencil size={16} weight="bold" className="mr-2" />
                        EDIT
                      </Button>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="bg-transparent border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white" data-testid={`delete-doc-${doc.id}`}>
                          <Trash size={16} weight="bold" className="mr-2" />
                          DELETE
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#121214] border border-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white font-heading text-2xl">
                            DELETE DOCUMENTATION
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-[#A1A1AA]">
                            Are you sure you want to delete "{doc.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="btn-ghost">CANCEL</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(doc.id)}
                            className="bg-[#FF3B30] hover:bg-[#DC143C] text-white"
                          >
                            DELETE
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}