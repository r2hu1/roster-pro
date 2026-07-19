import axios, { AxiosError, type AxiosInstance } from "axios"
import { toast } from "sonner"

const api: AxiosInstance = axios.create({
  baseURL: "/api/",
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error.response) {
      toast.error(error?.response?.data?.message ?? "API Error")
    } else {
      toast.error("Network/Unknown Error")
    }
    return Promise.reject(error)
  }
)

export default api
