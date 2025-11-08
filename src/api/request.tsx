import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../(auth)/store/Auth";

interface JWTPayload {
  userId: string;
  role: string;
  exp: number;
}

export const logout = async () => {
  try {
    await localStorage.removeItem("user");
    await localStorage.removeItem("token");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

export const getCurrentUser = async () => {
  try {
    const userData = await useAuthStore.getState().user;
    if (userData) {
      return userData
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const getToken = async () => {
  try {
    return await useAuthStore.getState().token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const getUserIdFromToken = async () => {
  try {
    const token = await getToken();
    if (!token) return null;

    const decoded = jwtDecode<JWTPayload>(token);
    return decoded.userId;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
