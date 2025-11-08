import { redirect } from "react-router";
import { awaitAuthRehydration, useAuthStore } from "../(auth)/store/Auth";

const getHydratedAuthState = async () => {
  await awaitAuthRehydration();
  return useAuthStore.getState();
};

export const protectedLoader = async () => {
  const { user } = await getHydratedAuthState();

  if (!user) {
    return redirect("/");
  }

  return null;
};

export const loginPageLoader = async () => {
  const { user } = await getHydratedAuthState();

  if (user) {
    if (user.role === "customer") {
      return redirect("/");
    }
    if (user.role === "owner") {
      return redirect("/owner/(owner-tabs)/ResortScreen");
    }
    return redirect("/");
  }

  return null;
};
