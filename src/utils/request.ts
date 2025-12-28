import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { AuthStorage, redirectToLogin } from "@/utils/auth";
import { useTokenRefresh } from "@/composables/auth/useTokenRefresh";
import { authConfig } from "@/settings";

// 初始化token刷新组合式函数
const { refreshTokenAndRetry } = useTokenRefresh();

/**
 * 创建 HTTP 请求实例
 */
const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
});

/**
 * 请求拦截器 - 添加 Authorization 头
 */
httpRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = AuthStorage.getAccessToken();

    // 如果 Authorization 设置为 no-auth，则不携带 Token
    if (config.headers.Authorization !== "no-auth" && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一处理响应和错误
 */
httpRequest.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    // 如果响应是二进制数据，则直接返回response对象（用于文件下载、Excel导出、图片显示等）
    if (response.config.responseType === "blob" || response.config.responseType === "arraybuffer") {
      return response;
    }

    // ABP VNext 默认直接返回数据，不包裹 code/msg/data 结构
    // 只要 HTTP 状态码是 2xx，就视为成功
    return response.data;
  },
  async (error) => {
    console.error("Response interceptor error:", error);

    const { config, response } = error;

    // 网络错误或服务器无响应
    if (!response) {
      ElMessage.error("网络连接失败，请检查网络设置");
      return Promise.reject(error);
    }

    // 根据 HTTP 状态码进行处理
    const status = response.status;
    const data = response.data;
    const msg = data?.error?.message || data?.error_description || "请求失败";

    switch (status) {
      case 401:
        // 401 Unauthorized: Access Token 过期或无效
        if (authConfig.enableTokenRefresh) {
          // 启用了token刷新，尝试刷新
          return refreshTokenAndRetry(config, httpRequest);
        } else {
          // 未启用token刷新，直接跳转登录页
          await redirectToLogin("登录已过期，请重新登录");
          return Promise.reject(new Error(msg || "Access Token Invalid"));
        }
      // 403 Forbidden: 权限不足
      case 403:
        ElMessage.error("您没有权限执行此操作");
        return Promise.reject(new Error(msg || "Forbidden"));

      // 400 Bad Request: 参数错误或业务验证失败
      case 400:
        ElMessage.error(msg);
        return Promise.reject(new Error(msg || "Bad Request"));

      // 404 Not Found: 资源不存在
      case 404:
        ElMessage.error("请求的资源不存在");
        return Promise.reject(new Error(msg || "Not Found"));

      // 500 Internal Server Error: 服务器错误
      case 500:
        ElMessage.error("服务器内部错误");
        return Promise.reject(new Error(msg || "Internal Server Error"));

      // 其他错误状态码
      default:
        ElMessage.error(msg || `请求失败(${status})`);
        return Promise.reject(new Error(msg || `Request Error (${status})`));
    }
  }
);

export default httpRequest;
