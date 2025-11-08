import LoginScreen from "./(auth)/login";
import DashboardScreen from "./(owner)/dashboard";
import ReportsScreen from "./(owner)/reports";
import GuestsScreen from "./(owner)/guests";
import ReservationScreen from "./(owner)/reservations";
import ViewReservationScreen from "./(owner)/view_reservation";
import AmenitiesManagementScreen from "./(owner)/amenities";
import OwnerChatConversation from "./(owner)/view_messages";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, redirect } from "react-router";
import { RouterProvider } from "react-router/dom";
import { useAuthStore } from "./(auth)/store/Auth";
import { useResortStore } from "./(owner)/store/resort";

import "./globals.css";
import "leaflet/dist/leaflet.css";
import "react-calendar/dist/Calendar.css";
import ChatListScreen from "./(owner)/messages";
import RoomsScreen from "./(owner)/rooms";
import SettingsScreen from "./(owner)/settings";

const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginScreen,
    loader: async () => {
      const { user } = useAuthStore.getState();

      if (user?.role == "owner") {
        useResortStore.getState().fetchResortsByOwner();
        return redirect("dashboard");
      }
    },
  },
  {
    path: "dashboard",
    Component: DashboardScreen,
  },
  {
    path: "reports",
    Component: ReportsScreen,
  },
  {
    path: "guests",
    Component: GuestsScreen,
  },
  {
    path: "reservations",
    Component: ReservationScreen,
  },
  {
    path: "amenities",
    Component: AmenitiesManagementScreen,
  },
  {
    path: "messages",
    Component: ChatListScreen,
  },
  { path: "rooms", Component: RoomsScreen },
  {
    path: "view/messages/:chatId",
    Component: OwnerChatConversation,
  },
  {
    path: "view/reservation/:id",
    Component: ViewReservationScreen,
  },
  {
    path: "settings",
    Component: SettingsScreen,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
