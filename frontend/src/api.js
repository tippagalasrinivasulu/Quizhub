import { useEffect, useState } from "react";

async function request(method, path, body, isFormData = false) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch("/api" + path, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error("Unable to reach QuizHub. Check your network connection or try again later.");
  }

  // Only redirect if specifically the auth session check failed with 401
  if (res.status === 401 && token && (path === "/auth/me" || path === "/users/profile")) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  del: (p) => request("DELETE", p),
  upload: (p, formData) => request("POST", p, formData, true)
};

export function useApi(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get(path)
      .then((d) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (alive) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => { alive = false; };
  }, [path]);

  const reload = () => {
    setLoading(true);
    api.get(path)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  return { data, error, loading, reload };
}
