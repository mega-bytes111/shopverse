import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaBars } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const { user } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:sticky lg:top-16 h-[calc(100vh-64px)]">
          <AdminSidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72">
              <AdminSidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        {/* Main */}
        <div className="flex-1">
          {/* Topbar */}
          <div className="sticky top-16 z-40 bg-white border-b">
            <div className="h-16 px-4 md:px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-2 rounded-xl border hover:bg-gray-50"
                  onClick={() => setOpen(true)}
                  aria-label="Open menu"
                >
                  <FaBars />
                </button>

                <div>
                  <p className="text-sm font-extrabold text-gray-900">Admin Dashboard</p>
                  <p className="text-xs text-gray-500">
                    Logged in as <b>{user?.name}</b> ({user?.role})
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Manage store operations
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;