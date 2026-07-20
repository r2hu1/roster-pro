import axios, { type AxiosInstance } from "axios"
import { toast } from "sonner"

declare module "axios" {
  export interface AxiosRequestConfig {
    // for probe requests that handle 401/errors themselves (session checks)
    skipSessionRedirect?: boolean
    skipErrorToast?: boolean
  }
}

const api: AxiosInstance = axios.create({
  baseURL: "/api/",
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    const config = error?.config ?? {}

    if (
      error.response?.status === 401 &&
      !config.skipSessionRedirect &&
      typeof window !== "undefined"
    ) {
      // Server tells us why the session is gone: SESSION_ENDED (checkout /
      // staff ended / QR regenerated) → thank-you page; anything else
      // (expiry, no session) → scanner. Cart persists in localStorage so
      // nothing is lost across re-issue.
      const ended = error.response?.data?.errorCode === "SESSION_ENDED"
      window.location.href = ended ? "/thank-you" : "/"
      return Promise.reject(error)
    }

    if (!config.skipErrorToast) {
      if (error.response) {
        toast.error(error?.response?.data?.message ?? "API Error")
      } else {
        toast.error("Network/Unknown Error")
      }
    }
    return Promise.reject(error)
  }
)

export default api
