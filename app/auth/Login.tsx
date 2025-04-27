import { withAuth } from "@/hooks/useAuth";
import { LoginScreen } from "@/screens/Authentication/LoginScreen";

export default withAuth(LoginScreen);