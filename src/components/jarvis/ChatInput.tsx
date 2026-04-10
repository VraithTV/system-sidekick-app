import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Plus, Mic, AudioLines, Copy, Check } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { settings, addCommand } = useJarvisStore();
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

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Create conversation if this is a new chat
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

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <h1 className="text-2xl font-semibold text-foreground/90 mb-1">
              What's on the agenda today?
            </h1>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[80%] bg-muted/50 rounded-2xl px-4 py-3 text-sm text-foreground">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[85%] space-y-2">
                    <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground/90 leading-relaxed">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => copyToClipboard(msg.content, i)}
                        className="p-1.5 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30 transition-colors"
                        title="Copy"
                      >
                        {copiedIdx === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 px-1 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
            className="relative flex items-end bg-muted/40 border border-border/40 rounded-2xl px-3 py-2 shadow-lg"
          >
            <button
              type="button"
              className="p-2 rounded-full text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/40 transition-colors shrink-0 self-end mb-0.5"
              title="Attach"
            >
              <Plus className="w-5 h-5" />
            </button>

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
              className="flex-1 bg-transparent border-none resize-none px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 max-h-40"
            />

            <div className="flex items-center gap-1 shrink-0 self-end mb-0.5">
              {input.trim() ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="p-2 rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="p-2 rounded-full text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/40 transition-colors"
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors"
                    title="Voice chat"
                  >
                    <AudioLines className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
