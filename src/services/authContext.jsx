import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Añadir estado de carga

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    const savedToken = sessionStorage.getItem("token");

  const [user, setUser] = useState(getInitialUser());
  const [token, setToken] = useState(getInitialToken());

  useEffect(() => {
    // Si hay datos en localStorage, los mantiene
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    }

    setIsLoading(false); // Marcar como cargado
  }, []);
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
    <AuthContext.Provider value={{ user, token, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
