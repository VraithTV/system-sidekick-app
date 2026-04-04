import { StatusPanel } from '../StatusPanel';

export const SystemView = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-8">
        <h2 className="font-display text-sm text-primary tracking-[0.15em] mb-8">SYSTEM</h2>
        <div className="max-w-md">
          <div className="bg-card rounded-xl p-6 border border-border">
            <StatusPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
