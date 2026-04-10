import { ChatInput } from '../ChatInput';

export const ChatView = () => {
  return (
    <div className="flex-1 overflow-hidden bg-background">
      <div className="flex h-full flex-col">
        <ChatInput />
      </div>
    </div>
  );
};
