import { Search } from "lucide-react";
import { toast } from "sonner";

interface TopBarProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
  showSearch?: boolean;
}

const TopBar = ({ title, actionLabel, onAction, children, showSearch = false }: TopBarProps) => (
  <div className="h-12 bg-card border-b border-border flex items-center px-5 gap-3 flex-shrink-0">
    <div className="text-[13px] font-semibold text-foreground flex-1">{title}</div>
    {children}
    {showSearch && (
      <div className="h-[26px] w-[140px] rounded-md bg-rt-gray-100 border border-border flex items-center px-2 gap-1.5">
        <Search className="w-3 h-3 text-rt-gray-400" />
        <span className="text-[10px] text-rt-gray-400">Search…</span>
      </div>
    )}
    {actionLabel && (
      <button
        onClick={onAction || (() => toast("Action clicked"))}
        className="h-[26px] px-2.5 rounded-md bg-rt-blue flex items-center gap-1"
      >
        <span className="text-[10px] font-medium font-mono text-primary-foreground">{actionLabel}</span>
      </button>
    )}
  </div>
);

export default TopBar;
