// AuthProvider.jsx
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { getCurrentUser, refreshToken } from "../api/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      // Step 1: Try with existing access token
      const res = await getCurrentUser();
      setUser(res.data.data[0]);
    } catch (err) {
      // Step 2: Access token expired/missing — try refreshing silently
      if (err.response?.status === 400) {
        try {
          await refreshToken();           
          const res = await getCurrentUser();  
          setUser(res.data.data[0]);
        } catch {
          setUser(null); // refresh token also expired → needs login
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};