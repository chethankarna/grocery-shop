// src/components/AuthGate.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * AuthGate
 *
 * - On first-ever open (per browser), if user is NOT authenticated,
 *   redirect automatically to /login (shows signup/login).
 * - If user is already signed in, do nothing.
 * - Uses localStorage key 'muchshop_auth_prompt_shown' to show the prompt only once.
 *
 * Important: This component must be mounted inside Router and inside AuthProvider.
 */
export default function AuthGate({ children }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loading) return; // wait for auth initialization

        const flagKey = "muchshop_auth_prompt_shown";
        const alreadyShown = localStorage.getItem(flagKey) === "true";

        // Only act when user is NOT signed in and we haven't shown the prompt yet.
        if (!user && !alreadyShown) {
            // Mark that we've shown the prompt so it won't appear again on subsequent loads.
            localStorage.setItem(flagKey, "true");

            // If user is not already on login/signup pages, send them to login.
            if (!location.pathname.startsWith("/login") && !location.pathname.startsWith("/signup")) {
                navigate("/login", { replace: true });
            }
        }
        // If user is signed in, do nothing (app opens normally).
    }, [user, loading, navigate, location]);

    return children;
}



// src/components/AuthGate.jsx
// import { useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// /**
//  * AuthGate
//  *
//  * - On first-ever open (per browser), if user is NOT authenticated,
//  *   redirect automatically to /login (shows signup/login).
//  * - If user is already signed in, do nothing.
//  * - Uses localStorage key 'muchshop_auth_prompt_shown' to show the prompt only once.
//  *
//  * Important: This component must be mounted inside Router and inside AuthProvider.
//  */
// export default function AuthGate({ children }) {
//   const { user, loading } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     if (loading) return; // wait for auth initialization

//     const flagKey = "muchshop_auth_prompt_shown";
//     const alreadyShown = localStorage.getItem(flagKey) === "true";

//     // Only act when user is NOT signed in and we haven't shown the prompt yet.
//     if (!user && !alreadyShown) {
//       // Mark that we've shown the prompt so it won't appear again on subsequent loads.
//       localStorage.setItem(flagKey, "true");

//       // If user is not already on login/signup pages, send them to login.
//       if (!location.pathname.startsWith("/login") && !location.pathname.startsWith("/signup")) {
//         navigate("/login", { replace: true });
//       }
//     }
//     // If user is signed in, do nothing (app opens normally).
//   }, [user, loading, navigate, location]);

//   return children;
// }
