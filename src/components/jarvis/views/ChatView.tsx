import { MessageSquare } from 'lucide-react';
import { ChatInput } from '../ChatInput';
import { useJarvisStore } from '@/store/jarvisStore';
import { createT } from '@/lib/i18n';

export const ChatView = () => {
  const { settings } = useJarvisStore();
  const t = createT(settings.language || 'en');

  return (
    <div className="flex-1 overflow-hidden bg-background">
      <div className="flex h-full flex-col p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-sm tracking-[0.15em] text-primary">{t('chat.title')}</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {t('chat.subtitle')}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <MessageSquare className="h-4 w-4" />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-[0_0_24px_hsl(var(--primary)/0.08)] backdrop-blur-sm">
          <ChatInput />
        </div>
      </div>
    </div>
  );
};