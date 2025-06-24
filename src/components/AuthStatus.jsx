import { useContext } from 'react';
import { AuthContext } from '../services/authContext';

const AuthStatus = () => {
  const { user, token } = useContext(AuthContext);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>🔍 DEBUG AUTH STATUS</strong></div>
      <div>Usuario: {user ? '✅ Logueado' : '❌ No logueado'}</div>
      <div>ID: {user?.usuario_id || 'N/A'}</div>
      <div>Rol: {user?.rol_id || 'N/A'}</div>
      <div>Token: {token ? '✅ Existe' : '❌ No existe'}</div>
      <div>SessionStorage Token: {sessionStorage.getItem('token') ? '✅' : '❌'}</div>
      <div>SessionStorage User: {sessionStorage.getItem('user') ? '✅' : '❌'}</div>
    </div>
  );
};

export default AuthStatus;
