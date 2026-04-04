import { useState } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommandInputProps {
  onSendCommand: (text: string) => void;
}

export const CommandInput = ({ onSendCommand }: CommandInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendCommand(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-lg p-3 flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a command..."
        className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground font-mono"
      />
      <Button type="submit" variant="jarvis" size="icon" className="shrink-0">
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};
