
import { Stack } from "expo-router";
import "@/styles/tailwind.css"
import { DependencyProvider } from "@/context/dependancy-context";
import { AuthProvider } from "@/context/authentication-context";

export default function Layout() {
  return (
    <AuthProvider>
      <DependencyProvider>
        <Stack screenOptions={
          { headerShown: false }
        }  />
      </DependencyProvider>
    </AuthProvider>);
}


