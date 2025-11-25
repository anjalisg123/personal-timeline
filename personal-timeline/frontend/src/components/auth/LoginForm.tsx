import React from "react";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "./GoogleLoginButton";
import { useAuth } from "../../context/AuthContext";


const LoginForm: React.FC = () => {
  const nav = useNavigate();
  const { acceptJwt } = useAuth();

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 rounded-2xl shadow bg-white">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <GoogleLoginButton
        onSuccess={(jwt, user) => {
          acceptJwt(jwt, user);     
          nav("/dashboard", { state: { justSignedIn: true } });
        }}
        onError={(msg) => alert(msg)}
      />
      <p className="mt-3 text-sm text-gray-500">Sign in with Google to continue.</p>
    </div>
  );
};

export default LoginForm;
