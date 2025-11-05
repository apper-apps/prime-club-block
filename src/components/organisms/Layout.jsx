import { Outlet, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import React from "react";
import Sidebar from "@/components/organisms/Sidebar";

const Layout = () => {
  // App-level state that can be shared via outlet context
  const outletContext = {
    // Add any app-level state or methods here that need to be shared
    // Example: user, theme, notifications, etc.
  };

return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        <main className="p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet context={outletContext} />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;