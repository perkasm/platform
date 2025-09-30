import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { env } from "@/config/env";

class ApiError extends Error {
  status?: number;
  data?: unknown;
  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const baseURL = env.apiUrl;

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    withCredentials: true, // toggle if you need cookies
  });

  client.interceptors.request.use((cfg) => {
    // Add global request logic here (e.g., start loader)
    return cfg;
  });

  client.interceptors.response.use(
    (res) => {
      // unwrap common response shape if needed (e.g., res.data.payload)
      return res;
    },
    (err) => {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message = data?.message || err.message || "Network Error";
      return Promise.reject(new ApiError(message, status, data));
    }
  );

  return client;
}

const client = createClient();

export function setAuthToken(token: string | null) {
  if (token) client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete client.defaults.headers.common["Authorization"];
}

export async function get<T = any>(url: string, config?: AxiosRequestConfig) {
  const res = await client.get<T>(url, config);
  return res.data;
}
export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  const res = await client.post<T>(url, data, config);
  return res.data;
}
export async function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  const res = await client.put<T>(url, data, config);
  return res.data;
}
export async function del<T = any>(url: string, config?: AxiosRequestConfig) {
  const res = await client.delete<T>(url, config);
  return res.data;
}

export { client as apiClient, ApiError };