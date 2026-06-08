import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import TopNavbar from '../components/navbar/TopNavbar';
import { useChat } from '../context/ChatContext';

const DashboardLayout = () => {
  const { isSidebarCollapsed } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-chat-bg font-sans">
      {/* Glow Effects Behind App */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />

      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Viewport for Pages */}
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
