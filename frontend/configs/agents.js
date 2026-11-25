import {
  Compass,
  MessageSquare,
  Code2,
  Globe,
  FileText,
  Presentation,
  Eye,
} from "lucide-react";

/**
 * Available specialist agent definitions and metadata
 */
export const AGENTS = [
  {
    id: "auto",
    name: "Auto Detect",
    shortName: "Auto",
    icon: Compass,
    color: "text-blue-500",
    placeholder: "Ask Agentic AI...",
  },
  {
    id: "chat",
    name: "Chat Agent",
    shortName: "Chat",
    icon: MessageSquare,
    color: "text-sky-500",
    placeholder: "Chat with Agentic AI...",
  },
  {
    id: "coding",
    name: "Coding Agent",
    shortName: "Coding",
    icon: Code2,
    color: "text-emerald-500",
    placeholder: "Ask a coding or debugging question...",
  },
  {
    id: "search",
    name: "Search Agent",
    shortName: "Search",
    icon: Globe,
    color: "text-amber-500",
    placeholder: "Search web facts, climate, or news...",
  },
  {
    id: "pdf",
    name: "PDF Agent",
    shortName: "PDF",
    icon: FileText,
    color: "text-rose-500",
    placeholder: "Ask about documents or PDFs...",
  },
  {
    id: "ppt",
    name: "PPT Agent",
    shortName: "PPT",
    icon: Presentation,
    color: "text-purple-500",
    placeholder: "Describe slides or presentation topic...",
  },
  {
    id: "vision",
    name: "Vision Agent",
    shortName: "Vision",
    icon: Eye,
    color: "text-teal-500",
    placeholder: "Ask about visual concepts or images...",
  },
];

export default AGENTS;
