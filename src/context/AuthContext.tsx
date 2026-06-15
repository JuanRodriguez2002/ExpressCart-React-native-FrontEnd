import React, { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";

interface UserProfile {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: any | null;
  token: string | null;
  loginUser: (credentials: object) => Promise<void>;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loginUser = async (credentials: object) => {
    // Consumimos el servicio de autenticación
    const jwtToken = await authService.login(credentials);

    // Paso 2: Consultar la información del usuario al endpoint GET usando el token recién obtenido
    const userData = await authService.getUserProfile(jwtToken);

    // Paso 3: Validación estricta del rol devuelto por tu base de datos
    if (!userData || userData.role !== "client") {
      throw new Error(
        "Acceso denegado. Esta aplicación es exclusiva para clientes.",
      );
    }

    // Paso 4: Si pasa el filtro, guardamos el token y los datos completos del usuario en el estado global
    setToken(jwtToken);
    setUser(userData);

    // TODO: Aquí puedes persistir el token localmente usando SecureStore o AsyncStorage en el futuro
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};
