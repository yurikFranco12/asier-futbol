import React, { createContext, useState, useEffect } from 'react';

export const ContextoAutenticacion = createContext();

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al montar, verificar si hay sesión guardada
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }

    setCargando(false);
  }, []);

  const registro = async (email, contraseña, nombre_completo, telefono = '') => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          contraseña,
          nombre_completo,
          telefono
        })
      });

      const datos = await response.json();

      if (!response.ok) {
        throw new Error(datos.error || 'Error en el registro');
      }

      return { success: true, email: datos.email, emailEnviado: datos.emailEnviado, mensaje: datos.mensaje };

    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const guardarSesion = (datos) => {
    localStorage.setItem('token', datos.token);
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));
    setToken(datos.token);
    setUsuario(datos.usuario);
  };

  const verificarEmail = async (tokenVerificacion) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verificar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenVerificacion })
      });
      const datos = await response.json();
      if (!response.ok) {
        throw new Error(datos.error || 'No se pudo verificar el email');
      }
      guardarSesion(datos);
      return { success: true, usuario: datos.usuario };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const reenviarVerificacion = async (email) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/reenviar-verificacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const datos = await response.json();
      if (!response.ok) {
        throw new Error(datos.error || 'No se pudo reenviar el email');
      }
      return { success: true, mensaje: datos.mensaje };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, contraseña) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contraseña })
      });

      const datos = await response.json();

      if (!response.ok) {
        return { success: false, error: datos.error || 'Error al iniciar sesión', codigo: datos.codigo };
      }

      guardarSesion(datos);
      return { success: true, usuario: datos.usuario };

    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  const actualizarPerfil = async (datos) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'Error al actualizar perfil');
      }

      // Actualizar usuario en estado
      const usuarioActualizado = { ...usuario, ...resultado.usuario };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      setUsuario(usuarioActualizado);

      return { success: true, usuario: usuarioActualizado };

    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const cambiarContraseña = async (contraseña_actual, contraseña_nueva) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/cambiar-contraseña', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contraseña_actual, contraseña_nueva })
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'Error al cambiar contraseña');
      }

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const eliminarCuenta = async (contraseña) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/eliminar-cuenta', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contraseña })
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'Error al eliminar cuenta');
      }

      // Limpiar sesión
      logout();

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <ContextoAutenticacion.Provider value={{
      usuario,
      token,
      cargando,
      estaLogueado: !!usuario,
      registro,
      verificarEmail,
      reenviarVerificacion,
      login,
      logout,
      actualizarPerfil,
      cambiarContraseña,
      eliminarCuenta
    }}>
      {children}
    </ContextoAutenticacion.Provider>
  );
}
