import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Plus, Mic, MicOff, Copy, Check, Image, Brain, Search, MoreHorizontal, ArrowUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useJarvisStore } from '@/store/jarvisStore';
import { useChatHistoryStore } from '@/store/chatHistoryStore';
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
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const { settings, addCommand, setActiveView } = useJarvisStore();
  const { activeConversationId, conversations, createConversation, updateConversation } = useChatHistoryStore();
  const t = createT(settings.language || 'en');
  const currentConvoIdRef = useRef<string | null>(null);

  // Load messages when switching conversations
  useEffect(() => {
    if (activeConversationId) {
      const convo = conversations.find(c => c.id === activeConversationId);
      if (convo) {
        setMessages(convo.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
      currentConvoIdRef.current = activeConversationId;
    } else {
      setMessages([]);
      currentConvoIdRef.current = null;
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  // Close plus menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false);
      }
    };
    if (plusMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [plusMenuOpen]);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const saveToHistory = (msgs: ChatMessage[], convoId: string) => {
    const serialized = msgs.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
    }));
    const title = msgs.find(m => m.role === 'user')?.content.slice(0, 40) || 'New chat';
    updateConversation(convoId, { messages: serialized, title });
  };

  // Speech-to-text transcription
  const toggleTranscription = useCallback(() => {
    if (isTranscribing && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsTranscribing(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings.language === 'en' ? 'en-US' : settings.language || 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim = transcript;
        }
      }
      setInput(prev => {
        const base = prev.replace(/\s*🎤.*$/, '');
        const combined = (finalTranscript + interim).trim();
        return base ? `${base} ${combined}` : combined;
      });
    };

    recognition.onerror = () => setIsTranscribing(false);
    recognition.onend = () => setIsTranscribing(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsTranscribing(true);
  }, [isTranscribing, settings.language]);

  const sendMessage = async () => {
    if (isTranscribing && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsTranscribing(false);
    }

    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    let convoId = currentConvoIdRef.current;
    if (!convoId) {
      convoId = createConversation(text.slice(0, 40));
      currentConvoIdRef.current = convoId;
    }

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
      const allMessages = [...newMessages, assistantMsg];
      setMessages(allMessages);
      saveToHistory(allMessages, convoId);

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
      const allMessages = [...newMessages, errMsg];
      setMessages(allMessages);
      saveToHistory(allMessages, convoId);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const hasMessages = messages.length > 0;

  const plusMenuItems = [
    { icon: Image, label: 'Create image', action: () => { setInput('/imagine '); setPlusMenuOpen(false); inputRef.current?.focus(); } },
    { icon: Brain, label: 'Thinking', action: () => { setInput('/think '); setPlusMenuOpen(false); inputRef.current?.focus(); } },
    { icon: Search, label: 'Deep research', action: () => { setInput('/research '); setPlusMenuOpen(false); inputRef.current?.focus(); } },
    { icon: MoreHorizontal, label: 'More', action: () => { setPlusMenuOpen(false); } },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <h1 className="text-2xl font-display font-semibold tracking-wide text-primary/90 mb-1">
              What can I help with?
            </h1>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] bg-primary/15 border border-primary/20 rounded-2xl px-4 py-3 text-sm text-foreground shadow-[0_0_12px_hsl(var(--primary)/0.1)]">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[85%] space-y-2">
                    <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground/90 leading-relaxed [&_code]:bg-primary/10 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-card/80 [&_pre]:border [&_pre]:border-border/40 [&_pre]:rounded-xl">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => copyToClipboard(msg.content, i)}
                        className="p-1.5 rounded-md text-muted-foreground/40 hover:text-primary/70 hover:bg-primary/10 transition-colors"
                        title="Copy"
                      >
                        {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 px-1 py-2">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom input bar */}
      <div className="w-full px-4 pb-4">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="relative flex items-end bg-card/60 border border-border/50 rounded-2xl px-2 py-2 shadow-[0_0_20px_hsl(var(--primary)/0.06)] backdrop-blur-sm"
          >
            {/* Plus menu */}
            <div className="relative" ref={plusMenuRef}>
              <button
                type="button"
                onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                className={`p-2 rounded-full transition-colors shrink-0 self-end mb-0.5 ${
                  plusMenuOpen
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground/60 hover:text-primary/70 hover:bg-primary/10'
                }`}
              >
                <Plus className="w-5 h-5" />
              </button>

              {plusMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-card border border-border/60 rounded-xl shadow-[0_0_24px_hsl(var(--primary)/0.1)] py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  {plusMenuItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={item.action}
                      className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask anything"
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent border-none resize-none px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none disabled:opacity-50 max-h-40"
            />

            <div className="flex items-center gap-1 shrink-0 self-end mb-0.5">
              {/* Mic button: transcribes to text */}
              <button
                type="button"
                onClick={toggleTranscription}
                className={`p-2 rounded-full transition-colors ${
                  isTranscribing
                    ? 'bg-destructive/20 text-destructive animate-pulse'
                    : 'text-muted-foreground/50 hover:text-primary/70 hover:bg-primary/10'
                }`}
                title={isTranscribing ? 'Stop recording' : 'Voice to text'}
              >
                {isTranscribing ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
              </button>

              {/* Send button: always visible */}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`p-2 rounded-full transition-all ${
                  input.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                    : 'bg-muted/40 text-muted-foreground/30 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
