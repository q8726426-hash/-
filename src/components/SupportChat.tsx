import { GoogleGenAI } from "@google/genai";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { translations, Language } from "../translations";

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export default function SupportChat({ lang }: { lang: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const t = translations[lang].chat;
  const siteInfo = translations[lang];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'bot', text: t.welcome }]);
    }
  }, [isOpen, t.welcome]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const systemInstruction = `
        You are a helpful assistant for "AMMOR STYLE UZGEN" located in Uzgen, Kyrgyzstan.
        Address: ${siteInfo.contact.address}
        Phone: +996 (550) 73 78 27
        Schedule: ${siteInfo.contact.hoursVal}
        
        Answer questions about services, prices, location, and working hours.
        Be polite and professional.
        Respond in the language the user is using (currently the site is in ${lang}).
        If you don't know the answer, ask the user to call the phone number.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ]
      });

      const botResponse = response.text || "Sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to assistant. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-dark-soft border border-white/10 w-[350px] h-[500px] flex flex-col shadow-2xl mb-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gold p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-dark font-bold">
                <MessageSquare size={20} />
                <span>{t.title}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-dark hover:opacity-70 transition-opacity">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gold/20">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gold text-dark font-medium' 
                      : 'bg-white/5 border border-white/10 text-white/80'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3">
                    <Loader2 size={16} className="animate-spin text-gold" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 bg-white/5 border border-white/10 p-2 text-sm outline-none focus:border-gold transition-all"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-gold text-dark p-2 hover:bg-gold-hover transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gold text-dark flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
