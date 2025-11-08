import { NavLink } from "react-router-dom";
import { useState } from "react";

function SidebarEleve() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Mes Cours", path: "/dashboard/cours" },
    { name: "Mon Planning", path: "/dashboard/planning" },
    { name: "Mes Notes", path: "/dashboard/notes" },
    { name: "Mes Présences", path: "/dashboard/presences" },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg min-h-screen p-4">
        <h2 className="text-xl font-bold mb-6">Menu</h2>
        <nav className="flex flex-col space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 p-6">
        {/* Ici, on affichera le contenu correspondant aux routes */}
      </div>

      {/* Menu mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-t px-4 py-2 flex justify-between">
        <button onClick={() => setIsOpen(!isOpen)}>☰ Menu</button>
        {isOpen && (
          <div className="absolute bottom-12 left-0 w-full bg-white shadow-lg p-4 flex flex-col space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SidebarEleve;
