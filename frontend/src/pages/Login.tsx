import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const handleLogin = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = "openid profile email";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 text-center shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            PerkAsm
          </h1>
          <p className="mt-2 text-gray-600">
            Maximize your credit card rewards.
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-gray-500">
            Please log in to continue to your dashboard.
          </p>
          <Button
            onClick={handleLogin}
            className="flex w-full items-center justify-center"
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Login with Google
          </Button>
        </div>
        <p className="text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;