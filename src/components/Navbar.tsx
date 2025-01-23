import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Bus, Users, FileText, DollarSign, LogOut, Menu, X, Home, Settings, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    { to: '/', icon: <Home size={20} />, text: 'Inicio' },
    { to: '/vehiculos', icon: <Bus size={20} />, text: 'Vehículos' },
    { to: '/conductores', icon: <Users size={20} />, text: 'Conductores' },
    { to: '/reportes', icon: <FileText size={20} />, text: 'Reportes' },
    { to: '/caja-chica', icon: <DollarSign size={20} />, text: 'Caja Chica' },
  ];

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <Bus className="h-8 w-8 text-white" />
              <span className="font-bold text-xl text-white">BoletosControl</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${
                  location.pathname === item.to ? 'nav-link-active' : ''
                }`}
              >
                {item.icon}
                <span>{item.text}</span>
              </Link>
            ))}
            
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="nav-link"
              >
                <Settings size={20} />
                <span>Opciones</span>
                <ChevronDown size={16} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link ${
                    location.pathname === item.to ? 'nav-link-active' : ''
                  }`}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-white hover:bg-red-700 rounded-lg"
              >
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
