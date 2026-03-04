import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Building2, BarChart3 } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, path: "/", label: "Dashboard" },
  { icon: Users, path: "/networking", label: "Networking" },
  { icon: Building2, path: "/company/mckinsey", label: "Companies" },
  { icon: BarChart3, path: "/analytics", label: "Analytics" },
];

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-[52px] bg-rt-sidebar flex flex-col items-center py-4 gap-2 flex-shrink-0">
      <div className="w-7 h-7 bg-rt-blue rounded-md flex items-center justify-center mb-3">
        <span className="text-[11px] font-bold font-mono text-primary-foreground">RT</span>
      </div>
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`w-8 h-8 rounded-[7px] flex items-center justify-center transition-colors ${
            isActive(item.path) ? "bg-white/[0.12]" : "hover:bg-white/[0.08]"
          }`}
          title={item.label}
        >
          <item.icon
            className={`w-4 h-4 ${isActive(item.path) ? "text-white" : "text-rt-gray-500"}`}
          />
        </button>
      ))}
      <div className="flex-1" />
      <div className="w-7 h-7 rounded-full bg-rt-gray-700" />
    </div>
  );
};

export default AppSidebar;
