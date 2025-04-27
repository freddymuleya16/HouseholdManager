
import { Stack } from "expo-router";
import "@/styles/tailwind.css"
import { DependencyProvider } from "@/context/dependancy-context";
import { AuthProvider } from "@/context/authentication-context";
import { HouseholdProvider } from "@/context/household-context";

export default function Layout() {
  return (
    <AuthProvider>
      <DependencyProvider>
        <HouseholdProvider>
          <Stack screenOptions={
            { headerShown: false }
          } />
        </HouseholdProvider>
      </DependencyProvider>
    </AuthProvider>);
}


