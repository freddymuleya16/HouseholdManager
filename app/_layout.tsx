
import { Stack } from "expo-router";
import "@/styles/tailwind.css"
import { DependencyProvider } from "@/context/dependancy-context";

export default function Layout() {
  return (
    <DependencyProvider>
      <Stack  screenOptions={
        {headerShown:false}
      } />
    </DependencyProvider>);
}


