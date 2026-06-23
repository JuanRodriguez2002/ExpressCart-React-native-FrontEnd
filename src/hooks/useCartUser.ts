// src/hooks/useCartUser.ts
import { tokenStorage } from "@/utils/storage";
import { useEffect, useState } from "react";
import { authService, UserProfile } from "../services/authService";

export function useCartUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState<string>("Usuario");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await tokenStorage.getToken();
        if (token) {
          const userData = await authService.getUserProfile(token);
          setUser(userData);
          if (userData && userData.name) {
            setUserName(`${userData.name}`.trim());
          }
        }
      } catch (error) {
        console.error("Error al recuperar el perfil en el carrito:", error);
      }
    };

    fetchUserData();
  }, []);

  return { user, userName };
}
