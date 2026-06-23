// src/hooks/useAuthUser.ts
import { tokenStorage } from "@/utils/storage";
import { useEffect, useState } from "react";
import { authService, UserProfile } from "../services/authService";

export function useAuthUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState<string>("Usuario");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = await tokenStorage.getToken();
        if (token) {
          const userData = await authService.getUserProfile(token);
          setUser(userData);
          if (userData && userData.name) {
            setUserName(`${userData.name}`.trim());
          }
        }
      } catch (error) {
        console.error("Error al recuperar el perfil del usuario:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { user, userName, isLoading };
}
