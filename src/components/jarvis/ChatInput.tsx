import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useJarvisStore } from '@/store/jarvisStore';
import { createT } from '@/lib/i18n';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInput() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings, addCommand } = useJarvisStore();
  const t = createT(settings.language || 'en');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { formatMemoriesForPrompt, addMemories } = await import('@/lib/memoryStore');

      const memories = formatMemoriesForPrompt();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke('jarvis-chat', {
        body: {
          message: text,
          memories,
          timezone,
          mode: 'assistant',
          conversationHistory: history,
          language: settings.language || 'en',
        },
      });

      if (error) throw error;

      const reply = data?.reply || "I didn't catch that.";
      const assistantMsg: ChatMessage = { role: 'assistant', content: reply, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMsg]);

      if (data?.newMemories?.length) {
        addMemories(data.newMemories);
      }

      addCommand({
        id: Date.now().toString(),
        text,
        response: reply,
        timestamp: new Date(),
        type: 'text',
      });
    } catch (err) {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground/40 text-xs mt-8 font-mono">
            Type a message to chat with Jarvis
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                msg.role === 'user'
                  ? 'bg-primary/20 text-primary border border-primary/20'
                  : 'bg-card/60 text-foreground/80 border border-border/30'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card/60 border border-border/30 rounded-xl px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-primary/60" />
              <span className="text-xs text-muted-foreground/60">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/30 p-2">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${settings.wakeName}...`}
            disabled={loading}
            className="flex-1 bg-card/40 border border-border/30 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
