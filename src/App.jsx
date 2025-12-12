import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./services/authContext";
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes comunes
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./services/ProtectedRoute";

// Páginas principales
import Home from "./pages/Comun/Home.jsx";
import About from "./pages/Comun/About.jsx";
import FAQ from "./pages/Comun/Faq.jsx";
import NotFoundPage from "./pages/Comun/404.jsx";
import SolicitudPersonalizacion from "./pages/Usuario/SolicitudPersonalizacion.jsx";
import Catalogo from "./pages/Comun/Catalogo.jsx";

// Páginas de autenticación
import Login from "./pages/Usuario/Login.jsx";
import Register from "./pages/Usuario/Register.jsx";
import Solicitud from "./pages/Usuario/Solicitud.jsx";
import Restablecer from "./pages/Usuario/Restablecer.jsx";
import Profile from "./pages/Usuario/UserProfile.jsx";
import ManageTestimonials from "./pages/Usuario/ManageTestimonials.jsx";
import FormTestimonials from "./pages/Usuario/FormTestimonials.jsx";
import ManageEvents from "./pages/Usuario/ManageEvents.jsx";
import ManageCitasNew from "./pages/Usuario/ManageCitasNew.jsx";

// Páginas del blog
import Blog from "./pages/Comun/Blog.jsx";
import ArticleDetail from "./pages/Comun/ArticleDetail.jsx";

// Administración
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import ArticleForm from "./pages/Admin/ArticleForm.jsx";
import ManageArticles from "./pages/Admin/ManageArticles.jsx";
import ManageReseñas from "./pages/Admin/ManageReseñas.jsx";
import ManageUsers from "./pages/Admin/ManageUsers.jsx";
import ManageDisponibilidad from "./pages/Admin/ManageDisponibilidad.jsx";
import ManageServicios from "./pages/Admin/ManageServicios.jsx";
import ProductosAdmin from './pages/Admin/ProductosAdmin.jsx';
import KpiPanel from './pages/Admin/kpiPanel.jsx';
import ManageEventsAdmin from './pages/Admin/ManageEventsAdmin.jsx';
import EventsForm from './pages/Admin/EventsForm.jsx';



// Layout general
function Layout({ children }) {
  const location = useLocation();

  const hideHeaderFooter = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeaderFooter && <Header />}
      <main className={`flex-grow ${!hideHeaderFooter ? "pt-20" : ""}`}>
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

// Configuración principal de rutas
function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover
            theme="ligth"
            transition={Bounce}
            style={{ top: '80px', right: '20px' }} 
            />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<ArticleDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<Solicitud />} />
            <Route path="/reset-password" element={<Restablecer />} />
            <Route path="/catalogo" element={<Catalogo />} />
            {/* Rutas protegidas para usuarios autenticados */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citas"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <ManageCitasNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <ManageEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/solicitud-personalizacion"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <SolicitudPersonalizacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/testimonials"
              element={<ManageTestimonials />}
            />
            <Route
              path="/testimonials/new"
              element={
                <ProtectedRoute allowedRoles={[1, 2]}>
                  <FormTestimonials />
                </ProtectedRoute>
              }
            />

            {/* Rutas para administradores */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageReseñas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blog"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageArticles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blog/new"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ArticleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blog/edit/:id"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ArticleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/disponibilidad"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageDisponibilidad />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/servicios"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageServicios />
                </ProtectedRoute>
              }
            />
            <Route
            path="/admin/productos"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <ProductosAdmin />
              </ProtectedRoute>
              }
            />

            <Route
            path="/admin/kpi"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <KpiPanel />
              </ProtectedRoute>
            }
            />

            {/* Rutas de eventos para admin */}
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <ManageEventsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/new"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <EventsForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/edit/:id"
              element={
                <ProtectedRoute allowedRoles={[2]}>
                  <EventsForm />
                </ProtectedRoute>
              }
            />

            {/* Ruta 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
