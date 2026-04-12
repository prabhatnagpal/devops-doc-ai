import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  Upload,
  Camera,
  VideoCamera,
  Lightning,
  Trash,
  CircleNotch,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function NewDocumentation() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [aiProvider, setAiProvider] = useState("claude");
  const [generating, setGenerating] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API}/templates`);
      setTemplates(response.data);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    });

    try {
      const uploaded = await Promise.all(uploadPromises);
      setUploadedFiles([...uploadedFiles, ...uploaded]);
      setFiles([]);
      toast.success(`Uploaded ${uploaded.length} file(s)`);
    } catch (error) {
      toast.error("Upload failed");
      console.error(error);
    }
  };

  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
      });

      videoRef.current.srcObject = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "video/webm",
        });
        setFiles([...files, file]);
        stream.getTracks().forEach((track) => track.stop());
        toast.success("Recording saved");
      };

      mediaRecorder.start();
      setRecording(true);
      toast.info("Recording started");
    } catch (error) {
      toast.error("Screen capture failed");
      console.error(error);
    }
  };

  const stopScreenCapture = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const takeScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      stream.getTracks().forEach((track) => track.stop());

      canvas.toBlob((blob) => {
        const file = new File([blob], `screenshot-${Date.now()}.png`, {
          type: "image/png",
        });
        setFiles([...files, file]);
        toast.success("Screenshot captured");
      });
    } catch (error) {
      toast.error("Screenshot failed");
      console.error(error);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!title) {
      toast.error("Please enter a title");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    setGenerating(true);

    try {
      const response = await axios.post(
        `${API}/generate`,
        {
          title,
          file_ids: uploadedFiles.map((f) => f.id),
          template_id: selectedTemplate === "none" ? null : selectedTemplate || null,
          ai_provider: aiProvider,
        },
        { timeout: 180000 }
      );

      toast.success("Documentation generated!");
      navigate(`/edit/${response.data.id}`);
    } catch (error) {
      toast.error("Generation failed. AI processing may have timed out.");
      console.error(error);
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter text-white leading-none mb-2">
            CREATE DOCUMENTATION
          </h1>
          <p className="text-base text-[#A1A1AA]">
            Upload screenshots or record your screen to generate AI-powered
            documentation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#121214] border border-[#27272A] p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-heading">
                COMMAND CENTER
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-transparent border border-[#27272A] hover:border-white text-[#A1A1AA] hover:text-white transition-all flex flex-col items-center gap-2"
                  data-testid="upload-file-btn"
                >
                  <Upload size={24} weight="bold" />
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Upload Files
                  </span>
                </button>

                <button
                  onClick={takeScreenshot}
                  className="p-4 bg-transparent border border-[#27272A] hover:border-white text-[#A1A1AA] hover:text-white transition-all flex flex-col items-center gap-2"
                  data-testid="take-screenshot-btn"
                >
                  <Camera size={24} weight="bold" />
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Screenshot
                  </span>
                </button>

                <button
                  onClick={recording ? stopScreenCapture : startScreenCapture}
                  className={`p-4 transition-all flex flex-col items-center gap-2 ${
                    recording
                      ? "bg-[#FF3B30] text-white recording-pulse"
                      : "bg-transparent border border-[#27272A] hover:border-[#FF3B30] text-[#A1A1AA] hover:text-[#FF3B30]"
                  }`}
                  data-testid="record-screen-btn"
                >
                  <VideoCamera size={24} weight="bold" />
                  <span className="text-xs font-mono uppercase tracking-wider">
                    {recording ? "STOP REC" : "Record"}
                  </span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
              <video ref={videoRef} className="hidden" />

              {files.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-[#A1A1AA] mb-3">
                    Selected Files
                  </h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#1A1A1D] border border-[#27272A]"
                      >
                        <span className="text-sm text-white truncate">
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-[#FF3B30] hover:text-white transition-colors"
                        >
                          <Trash size={16} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleUpload}
                    className="btn-primary w-full mt-4"
                    data-testid="upload-files-submit-btn"
                  >
                    Upload Selected Files
                  </Button>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-[#A1A1AA] mb-3">
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#1A1A1D] border border-[#27272A]"
                      >
                        <span className="text-sm text-white truncate">
                          {file.original_filename}
                        </span>
                        <button
                          onClick={() => removeUploadedFile(index)}
                          className="text-[#FF3B30] hover:text-white transition-colors"
                        >
                          <Trash size={16} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#121214] border border-[#27272A] p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-heading">
                CONFIGURATION
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-2 block">
                    Title
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter documentation title"
                    className="bg-[#1A1A1D] border-[#27272A] text-white focus:border-white"
                    data-testid="doc-title-input"
                  />
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-2 block">
                    AI Provider
                  </Label>
                  <Select value={aiProvider} onValueChange={setAiProvider}>
                    <SelectTrigger
                      className="bg-[#1A1A1D] border-[#27272A] text-white"
                      data-testid="ai-provider-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude">Claude Sonnet 4.5</SelectItem>
                      <SelectItem value="gemini">Gemini 3 Flash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] mb-2 block">
                    Template (Optional)
                  </Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                  >
                    <SelectTrigger
                      className="bg-[#1A1A1D] border-[#27272A] text-white"
                      data-testid="template-select"
                    >
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating || uploadedFiles.length === 0}
                  className="w-full bg-[#FFCC00] text-black hover:bg-[#FFD700] font-bold py-3"
                  data-testid="generate-docs-btn"
                >
                  {generating ? (
                    <>
                      <CircleNotch
                        size={20}
                        weight="bold"
                        className="animate-spin mr-2"
                      />
                      GENERATING (this may take ~2 min)...
                    </>
                  ) : (
                    <>
                      <Lightning size={20} weight="bold" className="mr-2" />
                      GENERATE DOCS
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}