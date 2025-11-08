function DashboardLayoutEleve({ children, userProfile, onLogout }) {
  return (
    <div className="flex">
      {/* Sidebar élève */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg min-h-screen p-4">
        <h2 className="text-xl font-bold mb-6">Menu Élève</h2>
        <nav className="flex flex-col space-y-2">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/dashboard/cours")}>Mes Cours</button>
          {/* ... autres liens élève */}
        </nav>
      </aside>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}