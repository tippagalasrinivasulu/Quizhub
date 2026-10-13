import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const save = (d) => {
    const u = {
      username: d.username,
      email: d.email || `${d.username}@quizhub.com`,
      role: d.role,
      level: d.level || 1,
      xp: d.xp || 0,
      rank: d.rank || "Bronze"
    };
    localStorage.setItem("token", d.token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const p = await api.get("/users/profile");
      if (p) {
        updateUser({
          email: p.email,
          username: p.username,
          role: p.role,
          level: p.level,
          xp: p.xp,
          rank: p.rank,
          badges: p.badges
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      refreshProfile();
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, save, updateUser, refreshProfile, logout }}>
      {children}
    </Ctx.Provider>
  );
}
