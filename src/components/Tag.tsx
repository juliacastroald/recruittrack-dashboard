import { cn } from "@/lib/utils";

type TagVariant = "blue" | "green" | "amber" | "red" | "gray" | "purple";

const variantClasses: Record<TagVariant, string> = {
  blue: "bg-rt-blue-light text-rt-blue",
  green: "bg-rt-green-light text-rt-green",
  amber: "bg-rt-amber-light text-rt-amber-dark",
  red: "bg-rt-red-light text-rt-red-dark",
  gray: "bg-rt-gray-100 text-rt-gray-500",
  purple: "bg-rt-purple-light text-rt-purple",
};

interface TagProps {
  variant: TagVariant;
  children: React.ReactNode;
  className?: string;
}

const Tag = ({ variant, children, className }: TagProps) => (
  <span
    className={cn(
      "inline-flex items-center h-[18px] px-1.5 rounded text-[9px] font-medium font-mono",
      variantClasses[variant],
      className
    )}
  >
    {children}
  </span>
);

export default Tag;
