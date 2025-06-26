import React, { useEffect, useState } from 'react';

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos');
  const [orden, setOrden] = useState('relevancia');

  useEffect(() => {
    fetch('http://localhost:4000/productos')
      .then((res) => res.json())
      .then((data) => {
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        ? p.stock > 0
        : p.stock === 0
    )
    .sort((a, b) => {
      if (orden === 'precio-asc') return a.precio_producto - b.precio_producto;
      if (orden === 'precio-desc') return b.precio_producto - a.precio_producto;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto p-4 font-ibm bg-white min-h-screen">
      <h1 className="text-4xl font-bold text-sgreen mb-8 text-center drop-shadow-lg">Catálogo de Productos</h1>
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
      {loading ? (
        <div className="text-center text-gray-500 py-16">Cargando productos...</div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center text-gray-500 py-16">No se encontraron productos.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.producto_id}
              className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col"
            >
              <div className="h-40 flex items-center justify-center mb-4 bg-gray-50 rounded-xl">
                {producto.imagen_producto ? (
                  <img
                    src={`http://localhost:4000/${producto.imagen_producto.replace(/\\/g, '/')}`}
                    alt={producto.nombre_producto}
                    className="h-40 w-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-5xl text-gray-300">
                    <i className="fa-regular fa-image"></i>
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2 truncate">{producto.nombre_producto}</h2>
              <p className="text-gray-600 mb-2 line-clamp-2">{producto.descripcion_producto}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sgreen font-bold text-xl">${producto.precio_producto}</span>
                {producto.stock > 0 ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">En stock</span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">Agotado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalogo;
