import { useState } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

const responses: Record<string, string> = {
  'open chrome': 'Opening Chrome for you now.',
  'open discord': 'Discord is launching.',
  'open obs': 'Opening OBS Studio.',
  'start recording': 'Recording has started.',
  'stop recording': 'Recording stopped and saved.',
  'start streaming': 'Streaming has begun. You\'re live.',
  'stop streaming': 'Stream ended. Good session.',
  'clip that': 'Your clip has been saved.',
  'open spotify': 'Spotify is now open.',
  'launch steam': 'Steam is launching.',
  'mute my mic': 'Microphone muted.',
  'turn the volume down': 'Volume reduced by 10%.',
  'what\'s my cpu usage': 'Your CPU is currently at 34%. Everything looks smooth.',
  'gaming mode': 'Activating Gaming Mode. Opening Discord, Steam, and setting volume to 70%.',
  'streaming mode': 'Activating Streaming Mode. Opening OBS, Twitch dashboard, and starting recording.',
};

export const CommandInput = () => {
  const [input, setInput] = useState('');
  const { addCommand, setState } = useJarvisStore();

  const processCommand = (text: string) => {
    const lower = text.toLowerCase().trim();
    const clean = lower.replace(/^jarvis[,\s]+/, '');
    
    const response = responses[clean] || `I heard "${text}", but I'm not sure what you'd like me to do. Could you rephrase that?`;
    
    setState('thinking');
    setTimeout(() => {
      setState('speaking');
      addCommand({
        id: Date.now().toString(),
        text,
        response,
        timestamp: new Date(),
        type: 'text',
      });
      setTimeout(() => setState('idle'), 2000);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setInput('');
  };

  const handleVoice = () => {
    setState('listening');
    setTimeout(() => {
      processCommand('Open Chrome');
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-lg p-3 flex items-center gap-2">
      <Button type="button" variant="jarvis" size="icon" onClick={handleVoice} className="shrink-0">
        <Mic className="w-4 h-4" />
      </Button>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a command or say 'Jarvis'..."
        className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground font-mono"
      />
      <Button type="submit" variant="jarvis" size="icon" className="shrink-0">
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};
