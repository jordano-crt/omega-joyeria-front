import { Link } from 'react-router-dom';
import { Users, Calendar, Star, Briefcase, Tool, FileText } from 'react-feather';

const AdminDashboard = () => {
  return (
    <div className="max-w-6xl font-ibm mx-auto px-6 py-8 mt-10 ">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Panel de Administración</h1>
      <p className="text-gray-600 text-base mb-6">
        Bienvenido al panel de administración. Desde aquí puedes gestionar los diferentes aspectos del sistema.
      </p>

      <div className="h-full w-full flex items-center justify-center">
        <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-3 p-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          {/* Gestión de Usuarios */}
          <Link
            to="/admin/users"
            className="col-span-1 row-span-1 rounded-xl bg-blue-100 p-4 hover:shadow-md transition transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-300 mb-3">
              <Users className="text-blue-700 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-1">Usuarios</h3>
              <p className="text-xs text-blue-600">Gestiona todos los usuarios registrados.</p>
            </div>
          </Link>

          {/* Gestión de Artículos */}
          <Link
            to="/admin/blog"
            className="col-span-2 row-span-1 rounded-xl bg-indigo-100 p-4 hover:shadow-md transition transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-300 mb-3">
              <FileText className="text-indigo-700 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-1">Artículos</h3>
              <p className="text-xs text-indigo-600">Crear, editar o eliminar artículos del blog.</p>
            </div>
          </Link>

          {/* Gestión de Citas */}
          <Link
            to="/admin/appointments"
            className="col-span-2 row-span-1 rounded-xl bg-green-100 p-4 hover:shadow-md transition transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-300 mb-3">
              <Calendar className="text-green-700 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">Citas</h3>
              <p className="text-xs text-green-600">Organiza y administra las citas de los usuarios.</p>
            </div>
          </Link>

          {/* Gestión de Reseñas */}
          <Link
            to="/admin/reviews"
            className="col-span-1 row-span-1 rounded-xl bg-yellow-100 p-4 hover:shadow-md transition transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-yellow-300 mb-3">
              <Star className="text-yellow-700 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-1">Reseñas</h3>
              <p className="text-xs text-yellow-600">Responde a las reseñas de los usuarios.</p>
            </div>
          </Link>

          {/* Gestión de Eventos */}
          <Link
            to="/admin/events"
            className="col-span-1 row-span-1 rounded-xl bg-purple-100 p-4 hover:shadow-md transition transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-300 mb-3">
              <Briefcase className="text-purple-700 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800 mb-1">Eventos</h3>
              <p className="text-xs text-purple-600">Administra eventos y talleres del sistema.</p>
            </div>
          </Link>

          {/* Servicios Personalizados */}
          <Link
            to="/admin/services"
            className="col-span-2 row-span-1 rounded-xl bg-red-100 p-4 hover:shadow-md transition transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-300 mb-3">
              <Tool className="text-red-700 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-1">Servicios</h3>
              <p className="text-xs text-red-600">Gestiona los servicios personalizados ofrecidos.</p>
            </div>
          </Link>

          {/* Gestión de Productos */}
          <Link
            to="/admin/productos"
            className="col-span-1 row-span-1 rounded-xl bg-pink-100 p-4 hover:shadow-md transition transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-pink-300 mb-3">
              <Briefcase className="text-pink-700 h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-pink-800 mb-1">Productos</h3>
              <p className="text-xs text-pink-600">Administra el stock y la información de productos.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
