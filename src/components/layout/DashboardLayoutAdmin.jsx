function DashboardLayoutAdmin({ children, userProfile, onLogout }) {
  return (
    <div className="flex">
      {/* Sidebar admin */}
      <aside className="hidden md:flex flex-col w-64 bg-purple-50 shadow-lg min-h-screen p-4">
        <h2 className="text-xl font-bold mb-6">Admin</h2>
        <nav className="flex flex-col space-y-2">
          <button onClick={() => navigate("/admin")}>Dashboard Admin</button>
          <button onClick={() => navigate("/admin/students")}>Étudiants</button>
          <button onClick={() => navigate("/admin/courses")}>Cours</button>
          {/* ... autres liens admin */}
        </nav>
      </aside>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}