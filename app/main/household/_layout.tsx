import { HouseholdProvider } from "@/context/household-context";
import { Stack } from "expo-router";


export default function Layout() {
    return (
        <HouseholdProvider>
            <Stack screenOptions={
                { headerShown: false }
            } />
        </HouseholdProvider>
    );
}