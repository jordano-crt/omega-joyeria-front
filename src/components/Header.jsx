import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Logo.svg';
import { AuthContext } from '../services/authContext';
import NavigationLinks from './NavigationLinks';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import { FaBars } from 'react-icons/fa';

const Header = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  useEffect(() => {
    const protectedRoutes = ['/profile'];
    if (!user && protectedRoutes.includes(location.pathname)) {
      navigate('/login');
    }
  }, [user, navigate, location.pathname]);

  return (
    <header className="bg-white/70 backdrop-blur-lg font-ibm fixed top-0 left-0 w-full z-50 h-20">
      <div className="container mx-auto flex justify-between items-center h-full px-4">
        
        {/* Logo en un elemento semántico */}
        <Logo />

        {/* Navegación principal en una etiqueta nav */}
        <nav className="hidden md:flex w-1/3 justify-center">
          <div className="bg-transparent backdrop-blur-md border border-sgreen/15 rounded-full px-6 py-2 flex items-center justify-center space-x-6">
            <NavigationLinks className="whitespace-nowrap" />
          </div>
        </nav>

        {/* Menú de usuario y botón de menú móvil */}
        <div className="flex items-center space-x-4 ml-auto">
          <aside className="hidden md:flex">
            {user ? (
              <UserMenu user={user} handleLogout={handleLogout} />
            ) : (
              <>
                <Link to="/login" className="text-gray-700 py-2 px-2 rounded-2xl hover:border-sgreen hover:text-sgreen transition">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="bg-sgreen text-white py-2 px-4 border-2 border-green-500 rounded-2xl shadow-inner-green hover:shadow-inner-hgreen transition duration-300 ease-in-out">
                  Registrarse
                </Link>
              </>
            )}
          </aside>
          
          {/* Botón para abrir el menú móvil */}
          <button onClick={toggleMobileMenu} className="md:hidden text-gray-700">
            <FaBars size={24} />
          </button>
        </div>
      </div>

      {/* Menú móvil en una etiqueta nav para accesibilidad */}
      <nav aria-label="Mobile Menu">
        <MobileMenu
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          user={user}
          handleLogout={handleLogout}
        />
      </nav>
    </header>
  );
};

// Componente Logo dentro de una etiqueta semántica
const Logo = () => (
  <div className="w-1/3 flex justify-start">
    <Link to="/" aria-label="Home">
      <img src={logo} alt="Logo" className="w-32 h-auto" />
    </Link>
  </div>
);

export default Header;


