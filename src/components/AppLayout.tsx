import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => (
  <div className="flex h-screen w-full overflow-hidden">
    <AppSidebar />
    <div className="flex-1 flex flex-col overflow-hidden bg-rt-gray-50">
      <Outlet />
    </div>
  </div>
);

export default AppLayout;
