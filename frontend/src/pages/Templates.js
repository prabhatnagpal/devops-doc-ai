import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash, Code } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API}/templates`);
      setTemplates(response.data);
    } catch (error) {
      toast.error("Failed to load templates");
      console.error(error);
    }
  };

  const handleCreate = async () => {
    if (!name || !promptTemplate) {
      toast.error("Name and prompt template are required");
      return;
    }

    try {
      await axios.post(`${API}/templates`, {
        name,
        description,
        prompt_template: promptTemplate,
      });
      toast.success("Template created");
      setDialogOpen(false);
      setName("");
      setDescription("");
      setPromptTemplate("");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to create template");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/templates/${id}`);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      toast.error("Delete failed");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter text-white leading-none mb-2">
              TEMPLATES
            </h1>
            <p className="text-base text-[#A1A1AA]">
              Create and manage reusable documentation templates
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" data-testid="create-template-btn">
                <Plus size={16} weight="bold" className="mr-2" />
                NEW TEMPLATE
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121214] border border-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white font-heading text-2xl">
                  CREATE TEMPLATE
                </DialogTitle>
                <DialogDescription className="text-[#A1A1AA]">
                  Define a reusable prompt template for specific pipeline types
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-2 block">
                    Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Microservice Deployment"
                    className="bg-[#1A1A1D] border-[#27272A] text-white focus:border-white"
                    data-testid="template-name-input"
                  />
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-2 block">
                    Description
                  </Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this template"
                    className="bg-[#1A1A1D] border-[#27272A] text-white focus:border-white"
                    data-testid="template-description-input"
                  />
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-2 block">
                    Prompt Template
                  </Label>
                  <Textarea
                    value={promptTemplate}
                    onChange={(e) => setPromptTemplate(e.target.value)}
                    placeholder="You are an expert in documenting Jenkins pipelines for microservice deployments. Focus on...\n\nAnalyze the screenshots and create documentation covering:\n- Pipeline stages\n- Environment configuration\n- Deployment process\n- Error handling"
                    className="min-h-[200px] bg-[#000000] border-[#27272A] text-white font-mono text-sm leading-relaxed focus:border-white"
                    data-testid="template-prompt-input"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleCreate} className="btn-primary" data-testid="save-template-btn">
                  CREATE TEMPLATE
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {templates.length === 0 ? (
          <div className="bg-[#121214] border border-[#27272A] p-12 text-center">
            <Code size={64} weight="bold" className="mx-auto mb-4 text-[#27272A]" />
            <h3 className="text-xl font-bold text-white mb-2 font-heading">
              NO TEMPLATES YET
            </h3>
            <p className="text-[#A1A1AA] mb-6">
              Create your first template to standardize documentation generation
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="btn-primary"
              data-testid="create-first-template-btn"
            >
              CREATE TEMPLATE
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-[#121214] border border-[#27272A] p-6 hover:border-white transition-all"
                data-testid={`template-item-${template.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 font-heading">
                      {template.name}
                    </h3>
                    <p className="text-sm text-[#A1A1AA]">{template.description}</p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-[#FF3B30] hover:text-white transition-colors" data-testid={`delete-template-${template.id}`}>
                        <Trash size={20} weight="bold" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#121214] border border-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white font-heading text-2xl">
                          DELETE TEMPLATE
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#A1A1AA]">
                          Are you sure you want to delete "{template.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="btn-ghost">CANCEL</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(template.id)}
                          className="bg-[#FF3B30] hover:bg-[#DC143C] text-white"
                        >
                          DELETE
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="retro-code p-4 text-xs text-[#A1A1AA] font-mono leading-relaxed max-h-32 overflow-y-auto">
                  {template.prompt_template}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}