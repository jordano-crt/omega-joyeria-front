import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializa desde localStorage si existe, si no desde sessionStorage, si no null
  const getInitialUser = () => {
    const local = localStorage.getItem("user");
    if (local) return JSON.parse(local);
    const session = sessionStorage.getItem("user");
    if (session) return JSON.parse(session);
    return null;
  };
  const getInitialToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("token") || null
    );
  };

  const [user, setUser] = useState(getInitialUser());
  const [token, setToken] = useState(getInitialToken());

  useEffect(() => {
    // Si hay datos en localStorage, los mantiene
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    }
  }, [user, token]);

  const loginUser = (userData, persist = true) => {
    const id = userData.usuario_id || userData.userId;
    if (!id) {
      console.error("El usuario_id no está presente en la respuesta.");
      return;
    }
    // Guarda en localStorage por defecto (persistente)
    if (persist) {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
    } else {
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("token", userData.token);
    }
    setUser(userData);
    setToken(userData.token);
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
