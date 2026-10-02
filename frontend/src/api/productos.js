const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function aProductoTienda(p) {
  return {
    id: p.id,
    name: p.nombre,
    price: p.precio,
    image: p.imagen_url,
    description: p.descripcion,
    caracteristicas: p.caracteristicas || [],
    categoria: p.categoria,
    stock: p.cantidad_stock
  };
}

async function peticion(ruta, { metodo = 'GET', token, cuerpo } = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.error || 'Error de servidor');
  }
  return datos;
}

export async function obtenerProductos() {
  const datos = await peticion('/api/productos');
  return datos.productos.map(aProductoTienda);
}

export async function obtenerProducto(id) {
  const datos = await peticion(`/api/productos/${id}`);
  return aProductoTienda(datos.producto);
}

export const adminProductos = {
  listar: (token) => peticion('/api/admin/productos', { token }).then(d => d.productos),
  crear: (token, producto) => peticion('/api/admin/productos', { metodo: 'POST', token, cuerpo: producto }),
  actualizar: (token, id, producto) => peticion(`/api/admin/productos/${id}`, { metodo: 'PUT', token, cuerpo: producto }),
  eliminar: (token, id) => peticion(`/api/admin/productos/${id}`, { metodo: 'DELETE', token })
};
