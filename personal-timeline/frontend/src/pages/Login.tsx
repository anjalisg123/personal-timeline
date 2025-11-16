// // src/pages/LoginPage.tsx
// import React from "react";
// import { useNavigate } from "react-router-dom";

// import GoogleLoginButton from "../components/auth/GoogleLoginButton";
// import { useAuth } from "../context/AuthContext";


// const LoginPage: React.FC = () => {
//   const { acceptJwt } = useAuth();
//   const navigate = useNavigate();

//   return (
//     <div className="max-w-sm mx-auto mt-16 p-6 rounded-2xl shadow">
//       <h1 className="text-xl font-semibold mb-4">Sign in</h1>

//       <GoogleLoginButton
//         onSuccess={(jwt, user) => {
//           acceptJwt(jwt, user);
//           navigate("/"); // go to your home/dashboard
//         }}
//         onError={(msg) => {
//           console.error("Login error:", msg);
//           alert(msg || "Login failed");
//         }}
//       />

//       <p className="mt-3 text-sm text-gray-500">
//         Use your Google account to continue.
//       </p>
//     </div>
//   );
// };

// export default LoginPage;





// pages/Login.tsx (or LoginPage.tsx)
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";
import { useAuth } from "../context/AuthContext"; // your AuthContext with acceptJwt


export default function Login() {
  const { token, acceptJwt } = useAuth();
  const nav = useNavigate();

  if (token) return <Navigate to="/dashboard" replace />; // already signed in

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 rounded-2xl shadow bg-white">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <GoogleLoginButton
        onSuccess={(jwt, user) => {
          acceptJwt(jwt, user);
          nav("/dashboard", { state: { justSignedIn: true } });
        }}
        onError={(msg) => {
          console.error("Login error:", msg);
          alert(msg || "Login failed");
        }}
      />
      <p className="mt-3 text-sm text-gray-500">Sign in with Google to continue.</p>
    </div>
  );
}
