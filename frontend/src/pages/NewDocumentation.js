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
  FileCode,
  CaretDown,
  CaretUp,
  CheckCircle,
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

function XmlPreviewCard({ xmlFile, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const parsed = xmlFile.parsed_data || {};

  return (
    <div
      className="bg-[#1A1A1D] border border-[#27272A] p-4"
      data-testid={`xml-preview-${xmlFile.id}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileCode size={18} weight="bold" className="text-[#FFCC00]" />
          <span className="text-sm text-white font-mono truncate">
            {xmlFile.original_filename}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[#A1A1AA] hover:text-white transition-colors"
          >
            {expanded ? (
              <CaretUp size={16} weight="bold" />
            ) : (
              <CaretDown size={16} weight="bold" />
            )}
          </button>
          <button
            onClick={onRemove}
            className="text-[#FF3B30] hover:text-white transition-colors"
          >
            <Trash size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        <span className="px-2 py-0.5 bg-[#002FA7] text-white text-xs font-mono">
          {parsed.job_type || "unknown"}
        </span>
        {parsed.parameters?.length > 0 && (
          <span className="px-2 py-0.5 bg-[#27272A] text-[#A1A1AA] text-xs font-mono">
            {parsed.parameters.length} param(s)
          </span>
        )}
        {parsed.build_steps?.length > 0 && (
          <span className="px-2 py-0.5 bg-[#27272A] text-[#A1A1AA] text-xs font-mono">
            {parsed.build_steps.length} build step(s)
          </span>
        )}
        {parsed.scm?.urls?.length > 0 && (
          <span className="px-2 py-0.5 bg-[#27272A] text-[#A1A1AA] text-xs font-mono">
            SCM configured
          </span>
        )}
        {parsed.pipeline_script && (
          <span className="px-2 py-0.5 bg-[#FFCC00] text-black text-xs font-mono font-bold">
            Pipeline
          </span>
        )}
      </div>

      {parsed.description && (
        <p className="text-xs text-[#A1A1AA] mb-2 truncate">
          {parsed.description}
        </p>
      )}

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-[#27272A] pt-3">
          {parsed.agent_label && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                Agent
              </span>
              <p className="text-sm text-white font-mono">{parsed.agent_label}</p>
            </div>
          )}

          {parsed.parameters?.length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                Parameters
              </span>
              <div className="mt-1 space-y-1">
                {parsed.parameters.map((p, i) => (
                  <div key={i} className="text-xs font-mono text-white">
                    <span className="text-[#FFCC00]">{p.name}</span>
                    <span className="text-[#A1A1AA]">
                      {" "}
                      ({p.type}) = {p.default || "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.scm?.urls?.length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                SCM
              </span>
              {parsed.scm.urls.map((url, i) => (
                <p key={i} className="text-xs text-white font-mono truncate">
                  {url}
                </p>
              ))}
            </div>
          )}

          {parsed.triggers?.length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                Triggers
              </span>
              {parsed.triggers.map((t, i) => (
                <p key={i} className="text-xs text-white font-mono">
                  {t.type}: {t.schedule || "N/A"}
                </p>
              ))}
            </div>
          )}

          {parsed.build_steps?.length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                Build Steps
              </span>
              {parsed.build_steps.map((s, i) => (
                <div key={i} className="mt-1">
                  <span className="text-xs text-[#002FA7] font-mono">
                    [{s.type}]
                  </span>
                  {(s.command || s.script) && (
                    <pre className="text-xs text-[#A1A1AA] font-mono mt-1 bg-black p-2 overflow-x-auto max-h-24 overflow-y-auto">
                      {(s.command || s.script).substring(0, 300)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {parsed.pipeline_script && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                Pipeline Script
              </span>
              <pre className="text-xs text-white font-mono mt-1 bg-black p-2 overflow-x-auto max-h-40 overflow-y-auto border border-[#27272A]">
                {parsed.pipeline_script.substring(0, 500)}
                {parsed.pipeline_script.length > 500 && "..."}
              </pre>
            </div>
          )}

          {parsed.post_build_actions?.length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                Post-Build Actions
              </span>
              {parsed.post_build_actions.map((a, i) => (
                <p key={i} className="text-xs text-white font-mono">
                  {a.type}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NewDocumentation() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [xmlFiles, setXmlFiles] = useState([]);
  const [uploadedXmlFiles, setUploadedXmlFiles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [aiProvider, setAiProvider] = useState("claude");
  const [generating, setGenerating] = useState(false);
  const [recording, setRecording] = useState(false);
  const [uploadingXml, setUploadingXml] = useState(false);
  const fileInputRef = useRef(null);
  const xmlInputRef = useRef(null);
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

  const handleXmlSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setXmlFiles([...xmlFiles, ...selectedFiles]);
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

  const handleXmlUpload = async () => {
    if (xmlFiles.length === 0) {
      toast.error("Please select XML files to upload");
      return;
    }

    setUploadingXml(true);
    const uploadPromises = xmlFiles.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${API}/upload-xml`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    });

    try {
      const uploaded = await Promise.all(uploadPromises);
      setUploadedXmlFiles([...uploadedXmlFiles, ...uploaded]);
      setXmlFiles([]);
      toast.success(`Parsed ${uploaded.length} config.xml file(s)`);
    } catch (error) {
      toast.error("XML upload failed");
      console.error(error);
    } finally {
      setUploadingXml(false);
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
        setFiles((prev) => [...prev, file]);
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
        setFiles((prev) => [...prev, file]);
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

  const removeXmlFile = (index) => {
    setXmlFiles(xmlFiles.filter((_, i) => i !== index));
  };

  const removeUploadedXml = (index) => {
    setUploadedXmlFiles(uploadedXmlFiles.filter((_, i) => i !== index));
  };

  const hasContent = uploadedFiles.length > 0 || uploadedXmlFiles.length > 0;

  const handleGenerate = async () => {
    if (!title) {
      toast.error("Please enter a title");
      return;
    }

    if (!hasContent) {
      toast.error("Please upload screenshots or XML config files");
      return;
    }

    setGenerating(true);

    try {
      const response = await axios.post(
        `${API}/generate`,
        {
          title,
          file_ids: uploadedFiles.map((f) => f.id),
          xml_file_ids: uploadedXmlFiles.map((f) => f.id),
          template_id:
            selectedTemplate === "none" ? null : selectedTemplate || null,
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
            Upload screenshots, record your screen, or upload Jenkins config.xml
            files to generate AI-powered documentation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Screen Capture Section */}
            <div className="bg-[#121214] border border-[#27272A] p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-heading">
                SCREEN CAPTURE
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
                    <CheckCircle
                      size={14}
                      weight="bold"
                      className="inline mr-1 text-green-500"
                    />
                    Uploaded Screenshots ({uploadedFiles.length})
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

            {/* XML Config Upload Section */}
            <div className="bg-[#121214] border border-[#27272A] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white font-heading">
                  JENKINS CONFIG.XML
                </h2>
                <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] bg-[#1A1A1D] px-3 py-1 border border-[#27272A]">
                  Auto-Parsed
                </span>
              </div>

              <button
                onClick={() => xmlInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-[#27272A] hover:border-[#FFCC00] text-[#A1A1AA] hover:text-[#FFCC00] transition-all flex flex-col items-center gap-3 mb-4"
                data-testid="upload-xml-btn"
              >
                <FileCode size={32} weight="bold" />
                <span className="text-sm font-mono">
                  Drop or click to upload config.xml files
                </span>
                <span className="text-xs text-[#A1A1AA]">
                  Supports multiple files for multi-job pipelines
                </span>
              </button>

              <input
                type="file"
                ref={xmlInputRef}
                onChange={handleXmlSelect}
                accept=".xml,text/xml,application/xml"
                multiple
                className="hidden"
              />

              {xmlFiles.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-[#A1A1AA] mb-3">
                    Selected XML Files
                  </h3>
                  <div className="space-y-2">
                    {xmlFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#1A1A1D] border border-[#27272A]"
                      >
                        <div className="flex items-center gap-2">
                          <FileCode
                            size={16}
                            weight="bold"
                            className="text-[#FFCC00]"
                          />
                          <span className="text-sm text-white truncate">
                            {file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeXmlFile(index)}
                          className="text-[#FF3B30] hover:text-white transition-colors"
                        >
                          <Trash size={16} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleXmlUpload}
                    disabled={uploadingXml}
                    className="w-full mt-4 bg-[#FFCC00] text-black hover:bg-[#FFD700] font-bold"
                    data-testid="upload-xml-submit-btn"
                  >
                    {uploadingXml ? (
                      <>
                        <CircleNotch
                          size={16}
                          weight="bold"
                          className="animate-spin mr-2"
                        />
                        PARSING...
                      </>
                    ) : (
                      <>
                        <FileCode size={16} weight="bold" className="mr-2" />
                        PARSE & UPLOAD XML
                      </>
                    )}
                  </Button>
                </div>
              )}

              {uploadedXmlFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-[#A1A1AA] mb-3">
                    <CheckCircle
                      size={14}
                      weight="bold"
                      className="inline mr-1 text-green-500"
                    />
                    Parsed Configs ({uploadedXmlFiles.length})
                  </h3>
                  <div className="space-y-3">
                    {uploadedXmlFiles.map((xmlFile, index) => (
                      <XmlPreviewCard
                        key={xmlFile.id}
                        xmlFile={xmlFile}
                        onRemove={() => removeUploadedXml(index)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Sidebar */}
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

                {/* Status summary */}
                <div className="bg-[#0A0A0C] border border-[#27272A] p-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] block mb-2">
                    Ready to generate
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#A1A1AA]">Screenshots</span>
                      <span
                        className={
                          uploadedFiles.length > 0
                            ? "text-green-500 font-mono"
                            : "text-[#27272A] font-mono"
                        }
                      >
                        {uploadedFiles.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#A1A1AA]">XML Configs</span>
                      <span
                        className={
                          uploadedXmlFiles.length > 0
                            ? "text-[#FFCC00] font-mono"
                            : "text-[#27272A] font-mono"
                        }
                      >
                        {uploadedXmlFiles.length}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating || !hasContent}
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
