"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { nagpurDb } from "@/lib/data/nagpur-mock-db";
import { Property } from "@/lib/types/database";
import { formatINR } from "@/lib/utils";
import { ScheduleVisitModal } from "../properties/ScheduleVisitModal";
import {
  MessageSquare,
  Bot,
  X,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Building2,
  HelpCircle,
  TrendingUp,
  Minimize2
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  recommendedProperties?: Property[];
  suggestions?: string[];
  timestamp: string;
}

export function NagpurAiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState<Property | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const INITIAL_MESSAGES: ChatMessage[] = [
    {
      id: "msg-welcome",
      sender: "bot",
      text: "Namaste! I am your Nagpur Realty AI Assistant. I can help you find properties across all 21 Nagpur localities, compare Buy vs Rent options, check prices in Lakhs/Crores, or schedule a visit with our local brokers.",
      suggestions: [
        "3 BHK in Dharampeth under ₹1.2 Cr",
        "Affordable 2 BHK on Wardha Road",
        "Commercial spaces in Sadar / Sitabuldi",
        "Should I Buy or Rent in Nagpur?"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const generateBotReply = (userQuery: string): ChatMessage => {
    const q = userQuery.toLowerCase();
    const allProps = nagpurDb.getProperties();

    // 1. Check for Buy vs Rent queries
    if (q.includes("buy vs rent") || q.includes("buy or rent") || q.includes("rent vs buy")) {
      return {
        id: "msg-" + Date.now(),
        sender: "bot",
        text: "In Nagpur's current real estate market:\n\n• **Buying**: Ideal along growth corridors like Wardha Road, Besa, and Manish Nagar due to MIHAN SEZ expansion and Metro connectivity, delivering 7–10% annual capital appreciation.\n• **Renting**: Perfect for short-to-medium stays near VNIT (Pratap Nagar/Bajaj Nagar) and IT Parks (Hingna), where rental yields average 3.2% - 3.8%.\n\nWould you like to browse ready-to-move flats to buy or furnished rentals?",
        suggestions: [
          "Show available properties for Buy",
          "Show available properties for Rent"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
    }

    // 2. Check for locality / BHK matching
    let matched = allProps.filter((p) => p.status === "available");

    // Locality filter
    if (q.includes("dharampeth")) matched = matched.filter((p) => p.locality.toLowerCase().includes("dharampeth"));
    else if (q.includes("civil lines")) matched = matched.filter((p) => p.locality.toLowerCase().includes("civil"));
    else if (q.includes("wardha road") || q.includes("wardha")) matched = matched.filter((p) => p.locality.toLowerCase().includes("wardha"));
    else if (q.includes("besa")) matched = matched.filter((p) => p.locality.toLowerCase().includes("besa"));
    else if (q.includes("manish nagar")) matched = matched.filter((p) => p.locality.toLowerCase().includes("manish"));
    else if (q.includes("sadar")) matched = matched.filter((p) => p.locality.toLowerCase().includes("sadar"));
    else if (q.includes("sitabuldi")) matched = matched.filter((p) => p.locality.toLowerCase().includes("sitabuldi"));
    else if (q.includes("pratap nagar")) matched = matched.filter((p) => p.locality.toLowerCase().includes("pratap"));
    else if (q.includes("trimurti nagar")) matched = matched.filter((p) => p.locality.toLowerCase().includes("trimurti"));

    // BHK filter
    if (q.includes("1 bhk") || q.includes("1bhk")) matched = matched.filter((p) => p.bhk === 1);
    else if (q.includes("2 bhk") || q.includes("2bhk")) matched = matched.filter((p) => p.bhk === 2);
    else if (q.includes("3 bhk") || q.includes("3bhk")) matched = matched.filter((p) => p.bhk === 3);
    else if (q.includes("4 bhk") || q.includes("4bhk") || q.includes("villa")) matched = matched.filter((p) => (p.bhk && p.bhk >= 4) || p.category === "villa");

    // Commercial filter
    if (q.includes("commercial") || q.includes("office") || q.includes("showroom")) {
      matched = allProps.filter((p) => p.type === "commercial" && p.status === "available");
    }

    // Rent filter
    if (q.includes("rent") || q.includes("lease")) {
      matched = matched.filter((p) => p.listing_type === "rent");
    }

    if (matched.length > 0) {
      return {
        id: "msg-" + Date.now(),
        sender: "bot",
        text: `I found ${matched.length} matching properties in our live Nagpur database that fit your criteria:`,
        recommendedProperties: matched.slice(0, 3),
        suggestions: [
          "Schedule a site visit",
          "What are the loan sanction details?",
          "Show commercial options"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
    }

    // Default fallback guidance
    return {
      id: "msg-" + Date.now(),
      sender: "bot",
      text: "I can help you filter any listing in Nagpur. You can search by locality (Dharampeth, Civil Lines, Besa, Wardha Road, Sadar), property type (Apartments, Villas, Commercial Showrooms, NIT Plots), or price range.",
      recommendedProperties: allProps.slice(0, 2),
      suggestions: [
        "2 BHK near Airport Metro",
        "Bungalow in Civil Lines",
        "NIT Plot in Besa"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateBotReply(query);
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-full shadow-2xl hover:scale-105 hover:shadow-orange-500/30 transition-all cursor-pointer group"
          aria-label="Open Nagpur AI Property Assistant"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow" />
          </div>
          <span className="text-sm">Nagpur Realty AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm">Nagpur Realty AI</span>
                  <span className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Local Property Advisor</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.sender === "user"
                      ? "bg-orange-600 text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs whitespace-pre-line"
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                </div>

                {/* Recommended Property Cards */}
                {m.recommendedProperties && m.recommendedProperties.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    {m.recommendedProperties.map((prop) => (
                      <div
                        key={prop.id}
                        className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-orange-300 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prop.images[0]}
                            alt={prop.title}
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate text-[11px]">
                              {prop.title}
                            </p>
                            <p className="text-[10px] text-orange-600 font-semibold flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {prop.locality}
                            </p>
                            <span className="text-xs font-bold text-slate-900">
                              {formatINR(prop.price, prop.listing_type)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          <Link
                            href={`/properties/${prop.id}`}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded text-center"
                          >
                            Details
                          </Link>
                          <button
                            onClick={() => setSelectedPropertyForVisit(prop)}
                            className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-semibold rounded text-center"
                          >
                            Visit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestion Chips */}
                {m.suggestions && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(s)}
                        className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-300 rounded-full text-[10px] font-medium transition cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 w-24">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about Nagpur flats, localities, prices..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-orange-500 focus:outline-hidden transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Schedule Visit Modal when triggered from Chat */}
      {selectedPropertyForVisit && (
        <ScheduleVisitModal
          property={selectedPropertyForVisit}
          isOpen={true}
          onClose={() => setSelectedPropertyForVisit(null)}
          onSuccess={() => {
            setMessages((prev) => [
              ...prev,
              {
                id: "msg-visit-booked",
                sender: "bot",
                text: `Site visit scheduled for "${selectedPropertyForVisit.title}". You can track this in your Customer Portal!`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
            ]);
          }}
        />
      )}
    </>
  );
}
