import React, { useEffect, useState, useCallback } from 'react';
import ProductCard from '../../components/ProductCard';
import Notification from '../../components/Notification';
import { useNotification } from '../../hooks/useNotification';

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos');
  const [orden, setOrden] = useState('relevancia');
  const { notification, mostrarNotificacion, cerrarNotificacion } = useNotification();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await fetch('http://localhost:4000/productos/catalogo');
      const data = await response.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      mostrarNotificacion('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

    const mostrarNotificacionMemo = useCallback((mensaje, tipo) => {
        mostrarNotificacion(mensaje, tipo);
    }, [mostrarNotificacion]);

    const actualizarStockProducto = useCallback((productoId, nuevoStock) => {
        setProductos(prev => 
            prev.map(producto => 
            producto.producto_id === productoId 
                ? { ...producto, stock: nuevoStock }
                : producto
            )
        );
    }, []);

  const productosFiltrados = productos
    .filter((p) =>
      p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion_producto.toLowerCase().includes(busqueda.toLowerCase())
    )
    .filter((p) =>
      filtroStock === 'todos'
        ? true
        : filtroStock === 'stock'
        ? Number(p.stock) > 0
        : Number(p.stock) === 0
    )
    .sort((a, b) => {
      if (orden === 'precio-asc') return a.precio_producto - b.precio_producto;
      if (orden === 'precio-desc') return b.precio_producto - a.precio_producto;
      return 0;
    });

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 font-ibm bg-white min-h-screen">
        <h1 className="text-4xl font-bold text-sgreen mb-8 text-center drop-shadow-lg">
          🛒 Reserva tus Productos
        </h1>
        
        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-gray-300 rounded-2xl px-4 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-sgreen"
          />
          <div className="flex gap-2">
            <select
              value={filtroStock}
              onChange={(e) => setFiltroStock(e.target.value)}
              className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sgreen"
            >
              <option value="todos">Todos</option>
              <option value="stock">En stock</option>
              <option value="agotado">Agotados</option>
            </select>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sgreen"
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: Menor a mayor</option>
              <option value="precio-desc">Precio: Mayor a menor</option>
            </select>
          </div>
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="text-center text-gray-500 py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sgreen mx-auto mb-4"></div>
            Cargando productos...
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <div className="text-6xl mb-4">📦</div>
            No se encontraron productos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
            <ProductCard
                key={producto.producto_id}
                producto={producto}
                onNotification={mostrarNotificacionMemo}
                onStockUpdate={actualizarStockProducto}
            />
            ))}
          </div>
        )}
      </div>

      {/* Notificaciones */}
      <Notification 
        notification={notification} 
        onClose={cerrarNotificacion} 
      />
    </>
  );
};

export default Catalogo;