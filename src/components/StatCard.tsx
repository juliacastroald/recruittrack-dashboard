interface StatCardProps {
  value: string;
  label: string;
  delta?: string;
  deltaColor?: "green" | "amber";
}

const StatCard = ({ value, label, delta, deltaColor = "green" }: StatCardProps) => (
  <div className="bg-card border border-border rounded-lg p-3">
    <div className="text-[22px] font-semibold font-mono leading-none text-foreground">{value}</div>
    <div className="text-[9px] font-medium font-mono uppercase tracking-wider text-rt-gray-400 mt-1">
      {label}
    </div>
    {delta && (
      <div className={`text-[9px] font-mono mt-1 ${deltaColor === "amber" ? "text-rt-amber" : "text-rt-green"}`}>
        {delta}
      </div>
    )}
  </div>
);

export default StatCard;
