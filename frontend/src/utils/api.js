const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

export async function apiFetch(endpoint, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    ...options.headers,
  };

  // If body is FormData, do not set Content-Type header (browser sets it with multipart boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    // Clear credentials and force login redirect if token has expired or is invalid
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Prevent infinite redirect loops on login page
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = response.status;
    error.errors = data.errors;
    throw error;
  }

  return data;
}
