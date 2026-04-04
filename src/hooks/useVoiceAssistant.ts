import { useEffect, useRef, useCallback } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';

const commandResponses: Record<string, string> = {
  'open chrome': 'Opening Chrome for you now.',
  'open discord': 'Discord is launching.',
  'open obs': 'Opening OBS Studio.',
  'open spotify': 'Spotify is now open.',
  'launch steam': 'Steam is launching.',
  'open steam': 'Steam is launching.',
  'open visual studio code': 'Visual Studio Code is opening.',
  'open vs code': 'Visual Studio Code is opening.',
  'open vscode': 'Visual Studio Code is opening.',
  'start recording': 'Recording has started.',
  'stop recording': 'Recording stopped and saved.',
  'start streaming': 'Streaming has begun. You\'re live.',
  'stop streaming': 'Stream ended. Good session.',
  'clip that': 'Your clip has been saved.',
  'save the last 30 seconds': 'Saving the last 30 seconds as a clip.',
  'save the last minute': 'Saving the last 60 seconds as a clip.',
  'take a screenshot': 'Screenshot taken.',
  'switch scene': 'Switching to the next scene.',
  'switch to webcam': 'Switching to webcam scene.',
  'mute my mic': 'Microphone muted.',
  'mute mic': 'Microphone muted.',
  'unmute my mic': 'Microphone unmuted.',
  'unmute mic': 'Microphone unmuted.',
  'mute microphone': 'Microphone muted.',
  'turn the volume up': 'Volume increased.',
  'turn the volume down': 'Volume decreased.',
  'what time is it': `It's currently ${new Date().toLocaleTimeString()}.`,
  'what\'s my cpu usage': 'I\'ll need native system access to check that. This feature works in the desktop Electron build.',
  'shut down the pc': 'I\'ll need confirmation before shutting down. This feature works in the desktop build.',
  'gaming mode': 'Activating Gaming Mode. Opening Discord and Steam, setting volume to 70 percent.',
  'streaming mode': 'Activating Streaming Mode. Opening OBS, Twitch dashboard, and starting recording.',
  'study mode': 'Activating Study Mode. Opening browser and notes, muting Discord.',
};

function matchCommand(text: string): string {
  const lower = text.toLowerCase().trim();
  
  // Direct match
  if (commandResponses[lower]) return commandResponses[lower];
  
  // Partial match
  for (const [key, response] of Object.entries(commandResponses)) {
    if (lower.includes(key)) return response;
  }
  
  // Generic patterns
  if (lower.startsWith('open ')) {
    const app = lower.replace('open ', '');
    return `I'll try to open ${app} for you. In the desktop build, this would launch the application.`;
  }
  if (lower.startsWith('search youtube for ')) {
    const query = lower.replace('search youtube for ', '');
    return `Searching YouTube for "${query}".`;
  }
  if (lower.startsWith('search ')) {
    const query = lower.replace('search ', '');
    return `Searching for "${query}".`;
  }

  return `I heard "${text}", but I'm not confident I understood it correctly. Could you rephrase that?`;
}

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.volume = 1;
    
    // Try to pick a good English voice
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) 
      || voices.find(v => v.lang.startsWith('en-') && v.name.includes('Male'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}

export function useVoiceAssistant() {
  const { setState, addCommand, settings } = useJarvisStore();
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const wakeWordHeard = useRef(false);

  const processCommand = useCallback(async (text: string) => {
    setState('thinking');
    
    const response = matchCommand(text);
    
    // Small delay to feel natural
    await new Promise(r => setTimeout(r, 600));
    
    setState('speaking');
    addCommand({
      id: Date.now().toString(),
      text,
      response,
      timestamp: new Date(),
      type: 'voice',
    });

    await speak(response);
    setState('idle');
  }, [setState, addCommand]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = async (event: any) => {
      const last = event.results[event.results.length - 1];
      if (!last.isFinal) return;
      
      const transcript = last[0].transcript.trim().toLowerCase();
      const wakeName = settings.wakeName.toLowerCase();

      if (!wakeWordHeard.current) {
        // Check if the transcript contains the wake word
        if (transcript.includes(wakeName)) {
          wakeWordHeard.current = true;
          
          // Check if there's a command after the wake word
          const afterWake = transcript.split(wakeName).pop()?.trim();
          if (afterWake && afterWake.length > 2) {
            // Command was said together with wake word
            wakeWordHeard.current = false;
            await processCommand(afterWake);
          } else {
            // Just wake word — now listen for command
            setState('listening');
            // Auto-reset after 8 seconds of silence
            setTimeout(() => {
              if (wakeWordHeard.current) {
                wakeWordHeard.current = false;
                setState('idle');
              }
            }, 8000);
          }
        }
      } else {
        // Wake word was already heard, this is the command
        wakeWordHeard.current = false;
        await processCommand(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setState('idle');
        return;
      }
      // Restart on other errors
      setTimeout(() => {
        if (isListeningRef.current) startListening();
      }, 1000);
    };

    recognition.onend = () => {
      // Auto-restart to keep listening
      if (isListeningRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch {}
        }, 100);
      }
    };

    try {
      recognition.start();
      isListeningRef.current = true;
    } catch (e) {
      console.warn('Failed to start recognition:', e);
    }
  }, [settings.wakeName, setState, processCommand]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setState('idle');
  }, [setState]);

  // Send a text command manually
  const sendTextCommand = useCallback(async (text: string) => {
    const clean = text.replace(new RegExp(`^${settings.wakeName}[,\\s]+`, 'i'), '').trim();
    await processCommand(clean);
  }, [settings.wakeName, processCommand]);

  // Load voices
  useEffect(() => {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }, []);

  return { startListening, stopListening, sendTextCommand, isListening: isListeningRef.current };
}
