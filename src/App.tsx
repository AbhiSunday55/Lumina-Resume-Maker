import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Download, 
  Layout, 
  Palette, 
  Type as TypeIcon, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wand2, 
  CheckCircle2, 
  Globe, 
  Award,
  FileText,
  Zap,
  Lightbulb,
  Search
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import confetti from "canvas-confetti";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- CONFIG & CONSTANTS ---

const COLOR_THEMES = [
  { id: "emerald", name: "Emerald", primary: "#10b981", secondary: "#ecfdf5", accent: "#059669", text: "#064e3b" },
  { id: "indigo", name: "Indigo", primary: "#6366f1", secondary: "#eef2ff", accent: "#4f46e5", text: "#1e1b4b" },
  { id: "rose", name: "Rose", primary: "#f43f5e", secondary: "#fff1f2", accent: "#e11d48", text: "#4c0519" },
  { id: "amber", name: "Amber", primary: "#f59e0b", secondary: "#fffbeb", accent: "#d97706", text: "#451a03" },
  { id: "slate", name: "Slate", primary: "#475569", secondary: "#f8fafc", accent: "#334155", text: "#0f172a" },
  { id: "violet", name: "Violet", primary: "#8b5cf6", secondary: "#f5f3ff", accent: "#7c3aed", text: "#2e1065" },
];

const FONT_OPTIONS = [
  { id: "inter", name: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap", style: "'Inter', sans-serif" },
  { id: "playfair", name: "Playfair", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap", style: "'Playfair Display', serif" },
  { id: "outfit", name: "Outfit", url: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap", style: "'Outfit', sans-serif" },
  { id: "space", name: "Space Mono", url: "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap", style: "'Space Mono', monospace" },
];

const TEMPLATES = [
  { id: "modern", name: "Modern", icon: <Layout className="w-5 h-5" />, desc: "Clean sidebar layout" },
  { id: "minimal", name: "Minimal", icon: <FileText className="w-5 h-5" />, desc: "Focus on typography" },
  { id: "creative", name: "Creative", icon: <Sparkles className="w-5 h-5" />, desc: "Bold centered header" },
  { id: "executive", name: "Executive", icon: <Award className="w-5 h-5" />, desc: "Traditional & authoritative" },
];

const INITIAL_DATA = {
  firstName: "Abhijeet",
  lastName: "Borde",
  jobTitle: "Customer Service & Support Specialist",
  phone: "9960264593",
  email: "Bordeabhijeet139@gmail.com",
  address: "Gandhi Nagar, Yerwada, Pune 411006",
  summary: "Dedicated customer service professional with 3+ years of experience across aviation, telecom, and insurance sectors. Achieved a 95% customer satisfaction rating. Expert in multichannel support via phone, email, and chat. Fluent in English, Hindi, and Marathi.",
  experience: [
    { id: "1", title: "Customer Care Executive", company: "IGT Solution", location: "Pune", start: "Apr 2022", end: "Mar 2023", description: "Handled inbound calls in the Aviation sector.\nManaged daily customer inquiries via phone, email, and chat.\nAchieved a 95% customer satisfaction rating.\nStreamlined customer experience and processes." },
    { id: "2", title: "Customer Support Executive", company: "Tech Mahindra", location: "Pune", start: "May 2023", end: "Jul 2023", description: "Handled inbound calls for 3UK in the Telecom sector.\nManaged cancellations and renewals for telecom clients." },
  ],
  education: [
    { id: "1", degree: "SSC – 10th Standard", school: "Don Bosco High School", location: "Pune", year: "2020" },
    { id: "2", degree: "HSC – 12th Standard", school: "S.N.B.P Jr College", location: "Pune", year: "2022" },
  ],
  skills: ["Inbound Call Handling", "Multichannel Support", "Customer Relations", "Problem Resolution", "CRM Software", "Email Management", "Chat Support", "Team Collaboration"],
  languages: [
    { id: "1", name: "English", level: 5 },
    { id: "2", name: "Hindi", level: 5 },
    { id: "3", name: "Marathi", level: 5 },
  ],
  certificates: [
    { id: "1", name: "Customer Service Excellence", issuer: "IGT Solutions", year: "2022" },
  ],
};

// --- AI SERVICE ---

async function getAIInstance() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("Gemini API Key is not configured. Please add it to the Secrets panel.");
  }
  return new GoogleGenAI({ apiKey });
}

async function polishContent(content: string, type: 'summary' | 'experience') {
  try {
    const ai = await getAIInstance();
    const model = "gemini-flash-latest";
    const prompt = type === 'summary' 
      ? `As a professional career coach, rewrite this resume summary to be more impactful, professional, and results-oriented. Keep it concise (2-3 sentences). Original: "${content}"`
      : `As a professional career coach, rewrite this job responsibility to be more achievement-oriented using action verbs. Keep it as a concise bullet point. Original: "${content}"`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error: any) {
    console.error("AI Polish failed:", error);
    const msg = error.message || String(error);
    if (msg.includes("Origin not allowed")) {
      throw new Error("API_KEY_RESTRICTION: Your Gemini API key has 'HTTP Referrer' restrictions that block this domain. Please go to Google Cloud Console > Credentials and remove domain restrictions from your API key to use AI features in the preview.");
    }
    return content;
  }
}

async function getCareerTip(data: typeof INITIAL_DATA) {
  try {
    const ai = await getAIInstance();
    const model = "gemini-flash-latest";
    const prompt = `Based on this resume data, give one short, surprising career tip or resume improvement advice. Data: ${JSON.stringify(data)}`;
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error: any) {
    console.error("Career Tip failed:", error);
    const msg = error.message || String(error);
    if (msg.includes("Origin not allowed")) {
      return "⚠️ AI Tip: Your API key is restricted by domain. Check your Google Cloud settings.";
    }
    return "Add quantifiable achievements to stand out!";
  }
}

// --- COMPONENTS ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string; key?: string | number }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, onMagic }: any) => (
  <div className="space-y-1.5 relative group">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
      <span>{label}</span>
      {onMagic && (
        <button 
          onClick={onMagic}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Wand2 className="w-3 h-3" />
          <span>Magic Polish</span>
        </button>
      )}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
    />
  </div>
);

// --- MAIN APP ---

export default function App() {
  const [step, setStep] = useState<"onboarding" | "customize" | "editor">("onboarding");
  const [data, setData] = useState(INITIAL_DATA);
  const [config, setConfig] = useState({
    theme: COLOR_THEMES[1],
    font: FONT_OPTIONS[0],
    template: TEMPLATES[0],
  });
  const [isPolishing, setIsPolishing] = useState(false);
  const [careerTip, setCareerTip] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");

  // Calculate Resume Strength
  const strength = useMemo(() => {
    let score = 0;
    if (data.firstName && data.lastName) score += 10;
    if (data.email && data.phone) score += 10;
    if (data.summary.length > 50) score += 15;
    if (data.experience.length > 0) score += 25;
    if (data.skills.length > 3) score += 15;
    if (data.education.length > 0) score += 15;
    if (data.certificates.length > 0) score += 10;
    return Math.min(score, 100);
  }, [data]);

  // Load fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = config.font.url;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [config.font]);

  const handleMagicPolish = async (field: string, id?: string) => {
    setIsPolishing(true);
    try {
      if (field === 'summary') {
        const polished = await polishContent(data.summary, 'summary');
        setData(prev => ({ ...prev, summary: polished }));
      } else if (field === 'experience' && id) {
        const exp = data.experience.find(e => e.id === id);
        if (exp) {
          const polished = await polishContent(exp.description, 'experience');
          setData(prev => ({
            ...prev,
            experience: prev.experience.map(e => e.id === id ? { ...e, description: polished } : e)
          }));
        }
      }
      
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: [config.theme.primary]
      });
    } catch (error: any) {
      if (error.message?.includes("API_KEY_RESTRICTION")) {
        alert(error.message.replace("API_KEY_RESTRICTION: ", ""));
      } else {
        alert("AI Polish failed. Please check your connection or API key.");
      }
    } finally {
      setIsPolishing(false);
    }
  };

  const handleDownload = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: [config.theme.primary, '#ffffff', '#000000']
    });
    try {
      window.print();
    } catch (e) {
      console.error("Print failed:", e);
      alert("Print failed. Please try opening the app in a new tab if you're in a restricted environment.");
    }
  };

  // --- RENDER STEPS ---

  if (step === "onboarding") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full text-center space-y-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-200 mb-4">
            <Sparkles className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
              Lumina <span className="text-indigo-600">Resume AI</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-md mx-auto">
              The world's most intuitive AI-powered resume builder. Create a stunning resume in minutes, not hours.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-left">
            {[
              { icon: Wand2, title: "AI Magic", desc: "Polish your content" },
              { icon: Layout, title: "Modern", desc: "Premium templates" },
              { icon: Zap, title: "Instant", desc: "Live PDF preview" }
            ].map((feature, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <feature.icon className="w-5 h-5 text-indigo-600 mb-2" />
                <h3 className="text-sm font-bold text-slate-800">{feature.title}</h3>
                <p className="text-[11px] text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setStep("customize")}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200"
          >
            Start Building
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  if (step === "customize") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Choose your style</h2>
              <p className="text-slate-500">Pick a template and theme that matches your personality.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layout className="w-4 h-4" /> Template
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setConfig(prev => ({ ...prev, template: t }))}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                        config.template.id === t.id 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", config.template.id === t.id ? "bg-white/20" : "bg-slate-100")}>
                        {t.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{t.name}</div>
                        <div className={cn("text-[10px]", config.template.id === t.id ? "text-indigo-100" : "text-slate-400")}>{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Color Theme
                </label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setConfig(prev => ({ ...prev, theme: t }))}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                        config.theme.id === t.id ? "border-slate-900 scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: t.primary }}
                    >
                      {config.theme.id === t.id && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <TypeIcon className="w-4 h-4" /> Typography
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {FONT_OPTIONS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setConfig(prev => ({ ...prev, font: f }))}
                      className={cn(
                        "p-3 rounded-xl border transition-all text-sm font-medium",
                        config.font.id === f.id 
                          ? "bg-slate-900 border-slate-900 text-white" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                      style={{ fontFamily: f.style }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={() => setStep("onboarding")}
                className="p-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setStep("editor")}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
              >
                Continue to Editor
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-4 bg-indigo-500/5 blur-3xl rounded-full" />
            <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="scale-[0.5] origin-top">
                <ResumePreview data={data} config={config} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Lumina AI</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Editor</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strength</div>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${strength}%` }}
                className={cn(
                  "h-full transition-all duration-1000",
                  strength < 40 ? "bg-rose-500" : strength < 80 ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{strength}%</span>
          </div>

          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Editor */}
        <div className="w-full md:w-[450px] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("content")}
              className={cn(
                "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === "content" ? "text-indigo-600 border-indigo-600 bg-indigo-50/30" : "text-slate-400 border-transparent hover:text-slate-600"
              )}
            >
              Content
            </button>
            <button 
              onClick={() => setActiveTab("style")}
              className={cn(
                "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2",
                activeTab === "style" ? "text-indigo-600 border-indigo-600 bg-indigo-50/30" : "text-slate-400 border-transparent hover:text-slate-600"
              )}
            >
              Style
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {activeTab === "content" ? (
              <AnimatePresence mode="wait">
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  {/* Personal Info */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <User className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold">Personal Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="First Name" value={data.firstName} onChange={(v: string) => setData({...data, firstName: v})} />
                      <Input label="Last Name" value={data.lastName} onChange={(v: string) => setData({...data, lastName: v})} />
                    </div>
                    <Input label="Job Title" value={data.jobTitle} onChange={(v: string) => setData({...data, jobTitle: v})} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Email" value={data.email} onChange={(v: string) => setData({...data, email: v})} />
                      <Input label="Phone" value={data.phone} onChange={(v: string) => setData({...data, phone: v})} />
                    </div>
                    <Input label="Address" value={data.address} onChange={(v: string) => setData({...data, address: v})} />
                  </section>

                  {/* Summary */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold">Professional Summary</h3>
                    </div>
                    <TextArea 
                      label="Summary" 
                      value={data.summary} 
                      onChange={(v: string) => setData({...data, summary: v})}
                      onMagic={() => handleMagicPolish('summary')}
                    />
                  </section>

                  {/* Experience */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold">Experience</h3>
                      </div>
                      <button 
                        onClick={() => setData({
                          ...data, 
                          experience: [...data.experience, { id: Date.now().toString(), title: "", company: "", location: "", start: "", end: "", description: "" }]
                        })}
                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {data.experience.map((exp) => (
                        <Card key={exp.id} className="p-4 space-y-4 relative group">
                          <button 
                            onClick={() => setData({...data, experience: data.experience.filter(e => e.id !== exp.id)})}
                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-2 gap-4">
                            <Input label="Title" value={exp.title} onChange={(v: string) => setData({...data, experience: data.experience.map(e => e.id === exp.id ? {...e, title: v} : e)})} />
                            <Input label="Company" value={exp.company} onChange={(v: string) => setData({...data, experience: data.experience.map(e => e.id === exp.id ? {...e, company: v} : e)})} />
                          </div>
                          <TextArea 
                            label="Description" 
                            value={exp.description} 
                            onChange={(v: string) => setData({...data, experience: data.experience.map(e => e.id === exp.id ? {...e, description: v} : e)})}
                            onMagic={() => handleMagicPolish('experience', exp.id)}
                          />
                        </Card>
                      ))}
                    </div>
                  </section>

                  {/* Skills */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900">
                        <Zap className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold">Skills</h3>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-700 group">
                          <input 
                            value={skill} 
                            onChange={(e) => {
                              const newSkills = [...data.skills];
                              newSkills[i] = e.target.value;
                              setData({...data, skills: newSkills});
                            }}
                            className="bg-transparent outline-none w-20"
                          />
                          <button 
                            onClick={() => setData({...data, skills: data.skills.filter((_, j) => j !== i)})}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => setData({...data, skills: [...data.skills, "New Skill"]})}
                        className="px-3 py-1.5 border border-dashed border-indigo-300 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-50 transition-all"
                      >
                        + Add
                      </button>
                    </div>
                  </section>
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div 
                key="style"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Template</label>
                    <div className="grid grid-cols-2 gap-3">
                      {TEMPLATES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setConfig(prev => ({ ...prev, template: t }))}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                            config.template.id === t.id ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-600"
                          )}
                        >
                          {t.icon}
                          <span className="text-xs font-bold">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Color Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {COLOR_THEMES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setConfig(prev => ({ ...prev, theme: t }))}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-xl border transition-all",
                            config.theme.id === t.id ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
                          )}
                        >
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.primary }} />
                          <span className="text-[10px] font-bold text-slate-600">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Typography</label>
                    <div className="grid grid-cols-2 gap-3">
                      {FONT_OPTIONS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => setConfig(prev => ({ ...prev, font: f }))}
                          className={cn(
                            "p-3 rounded-xl border transition-all text-xs font-medium",
                            config.font.id === f.id ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600"
                          )}
                          style={{ fontFamily: f.style }}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Career Coach Tip */}
          <div className="p-4 bg-indigo-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Lightbulb className="w-12 h-12" />
            </div>
            <div className="relative z-10 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80">AI Career Coach</div>
              <p className="text-xs font-medium leading-relaxed italic">
                "{careerTip || "Your resume is looking great! Try adding more quantifiable results."}"
              </p>
              <button 
                onClick={async () => setCareerTip(await getCareerTip(data))}
                className="text-[10px] font-bold underline decoration-indigo-300 hover:text-indigo-200"
              >
                Get another tip
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-slate-200/50 p-8 overflow-y-auto flex justify-center items-start custom-scrollbar">
          <div 
            id="resume-preview"
            className="bg-white shadow-2xl shadow-slate-300/50 w-[210mm] min-h-[297mm] origin-top transition-transform duration-500"
            style={{ transform: 'scale(0.9)' }}
          >
            <ResumePreview data={data} config={config} />
          </div>
        </div>
      </main>

      {/* Polishing Overlay */}
      <AnimatePresence>
        {isPolishing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-indigo-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Wand2 className="w-16 h-16" />
            </motion.div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">AI Magic in Progress</h2>
            <p className="text-indigo-100 font-medium">Polishing your content to perfection...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e0; }
        
        @media print {
          body * { visibility: hidden; }
          #resume-preview, #resume-preview * { visibility: visible; }
          #resume-preview { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            height: 100%; 
            transform: scale(1) !important; 
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// --- RESUME PREVIEW TEMPLATES ---

function ResumePreview({ data, config }: { data: typeof INITIAL_DATA; config: any }) {
  const { theme, font, template } = config;
  const fullName = `${data.firstName} ${data.lastName}`;

  const SectionTitle = ({ children, className }: any) => (
    <h3 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 pb-1 border-b-2", className)} style={{ borderColor: theme.primary, color: theme.primary }}>
      {children}
    </h3>
  );

  // --- MODERN TEMPLATE ---
  if (template.id === "modern") {
    return (
      <div className="flex min-h-[297mm]" style={{ fontFamily: font.style }}>
        {/* Sidebar */}
        <div className="w-[35%] p-8 flex flex-col gap-8" style={{ backgroundColor: theme.secondary }}>
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black" style={{ backgroundColor: theme.primary }}>
              {data.firstName[0]}{data.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">{fullName}</h1>
              <p className="text-xs font-bold mt-1" style={{ color: theme.primary }}>{data.jobTitle}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</h4>
              <div className="space-y-2 text-[10px] font-medium text-slate-600">
                <div className="flex items-center gap-2"><span>📞</span> {data.phone}</div>
                <div className="flex items-center gap-2"><span>✉</span> {data.email}</div>
                <div className="flex items-center gap-2"><span>📍</span> {data.address}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s, i) => (
                  <span key={i} className="px-2 py-1 rounded-md text-[9px] font-bold" style={{ backgroundColor: theme.primary + '20', color: theme.primary }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Languages</h4>
              <div className="space-y-2">
                {data.languages.map((l) => (
                  <div key={l.id} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-700">
                      <span>{l.name}</span>
                    </div>
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${(l.level / 5) * 100}%`, backgroundColor: theme.primary }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-10 space-y-8 bg-white">
          <section>
            <SectionTitle>Profile</SectionTitle>
            <p className="text-[11px] leading-relaxed text-slate-600">{data.summary}</p>
          </section>

          <section>
            <SectionTitle>Experience</SectionTitle>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{exp.title}</h4>
                      <p className="text-[10px] font-bold" style={{ color: theme.primary }}>{exp.company}</p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{exp.start} — {exp.end}</span>
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-1">
                    {exp.description.split('\n').filter(Boolean).map((line, i) => (
                      <li key={i} className="text-[10px] text-slate-600 leading-relaxed">{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                    <p className="text-[10px] text-slate-500">{edu.school}</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // --- MINIMAL TEMPLATE ---
  if (template.id === "minimal") {
    return (
      <div className="p-16 space-y-12 bg-white min-h-[297mm]" style={{ fontFamily: font.style }}>
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">{fullName}</h1>
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>{data.email}</span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span>{data.phone}</span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span>{data.address}</span>
          </div>
          <div className="inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest" style={{ backgroundColor: theme.secondary, color: theme.primary }}>
            {data.jobTitle}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-8 space-y-10">
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">About Me</h3>
              <p className="text-[11px] leading-relaxed text-slate-600">{data.summary}</p>
            </section>

            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">Experience</h3>
              <div className="space-y-8">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                      <span className="text-[9px] font-bold text-slate-400">{exp.start} — {exp.end}</span>
                    </div>
                    <p className="text-[10px] font-bold" style={{ color: theme.primary }}>{exp.company}</p>
                    <ul className="space-y-1.5 pt-2">
                      {exp.description.split('\n').filter(Boolean).map((line, i) => (
                        <li key={i} className="text-[10px] text-slate-600 flex gap-2">
                          <span className="text-slate-300">•</span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="col-span-4 space-y-10">
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((s, i) => (
                  <span key={i} className="text-[10px] font-medium text-slate-600">
                    {s}{i < data.skills.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">Education</h3>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-800">{edu.degree}</h4>
                    <p className="text-[9px] text-slate-500">{edu.school}</p>
                    <p className="text-[9px] font-bold" style={{ color: theme.primary }}>{edu.year}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for other templates (simplified for brevity)
  return (
    <div className="p-10 bg-white min-h-[297mm] flex flex-col items-center justify-center text-slate-400 italic" style={{ fontFamily: font.style }}>
      Template "{template.name}" is coming soon in the next update!
      <br />
      Try "Modern" or "Minimal" for now.
    </div>
  );
}
