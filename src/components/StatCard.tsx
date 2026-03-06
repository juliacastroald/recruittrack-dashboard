interface StatCardProps {
  value: string;
  label: string;
  delta?: string;
  deltaColor?: "green" | "amber";
  subtexts?: string[];
}

const StatCard = ({ value, label, delta, deltaColor = "green", subtexts }: StatCardProps) => (
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
    {subtexts && subtexts.length > 0 && (
      <div className="mt-1.5 space-y-0.5">
        {subtexts.map((line, i) => (
          <div key={i} className="text-[9px] font-mono text-rt-gray-500">
            {line}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default StatCard;
