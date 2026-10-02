import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cabecera from '../components/Cabecera';
import { ContextoAutenticacion } from '../contexto/ContextoAutenticacion';
import '../styles/Autenticacion.css';

function VerificarEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verificarEmail } = useContext(ContextoAutenticacion);
  const [estado, setEstado] = useState('verificando'); // 'verificando' | 'ok' | 'error'
  const [mensaje, setMensaje] = useState('');
  // The token is single-use; React StrictMode runs effects twice in development.
  const yaEnviado = useRef(false);

  useEffect(() => {
    if (yaEnviado.current) return;
    yaEnviado.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setEstado('error');
      setMensaje('El enlace de verificación no es válido.');
      return;
    }

    verificarEmail(token).then(resultado => {
      if (resultado.success) {
        setEstado('ok');
        setTimeout(() => navigate('/'), 2500);
      } else {
        setEstado('error');
        setMensaje(resultado.error);
      }
    });
  }, [searchParams, verificarEmail, navigate]);

  return (
    <div>
      <Cabecera />
      <div className="auth-container auth-container-centrado">
        <div className="auth-card auth-verificacion">
          {estado === 'verificando' && (
            <>
              <div className="auth-icono-grande">⏳</div>
              <h2>Confirmando tu email...</h2>
            </>
          )}

          {estado === 'ok' && (
            <>
              <div className="auth-icono-grande">✅</div>
              <h2>¡Email confirmado!</h2>
              <p>Tu cuenta ya está activa y has iniciado sesión. Te llevamos a la tienda...</p>
              <button className="btn-auth" onClick={() => navigate('/catalogo')}>Ir al catálogo</button>
            </>
          )}

          {estado === 'error' && (
            <>
              <div className="auth-icono-grande">⚠️</div>
              <h2>No hemos podido confirmar tu email</h2>
              <p>{mensaje}</p>
              <button className="btn-auth" onClick={() => navigate('/autenticacion')}>Ir a iniciar sesión</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerificarEmail;
