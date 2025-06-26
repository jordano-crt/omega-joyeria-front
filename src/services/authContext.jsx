import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    const savedToken = sessionStorage.getItem("token");

    if (savedUser && savedToken) {
      const tokenExpiration = parseInt(
        sessionStorage.getItem("tokenExpiration"),
        10
      );
      const now = new Date().getTime();

      if (now < tokenExpiration) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } else {
        logoutUser();
      }
    }
  }, []);

  const loginUser = (userData) => {
    const id = userData.usuario_id || userData.userId;

    if (!id) {
      console.error("El usuario_id no está presente en la respuesta.");
      return;
    }

    const expirationTime = new Date().getTime() + 3600 * 1000; // 1 hora
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("token", userData.token);
    sessionStorage.setItem("tokenExpiration", expirationTime.toString());
    setUser(userData);
    setToken(userData.token);
  };

  const logoutUser = () => {
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
