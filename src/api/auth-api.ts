import request from "@/utils/request";
import qs from "qs";

const AUTH_BASE_URL = "/api/v1/auth";

import { AuthStorage } from "@/utils/auth";

const AuthAPI = {
  /** 登录接口*/
  login(data: LoginFormData) {
    return request<any, LoginResult>({
      url: `/connect/token`,
      method: "post",
      data: qs.stringify({
        username: data.username,
        password: data.password,
        client_id: data.clientId,
        grant_type: data.grantType,
        scope: data.scope,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  /** 刷新 token 接口*/
  refreshToken(refreshToken: string) {
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: "post",
      params: { refreshToken },
      headers: {
        Authorization: "no-auth",
      },
    });
  },

  /** 退出登录接口 */
  async logout() {
    const accessToken = AuthStorage.getAccessToken();
    const refreshToken = AuthStorage.getRefreshToken();
    const clientId = "EasyNews_App"; // 暂时硬编码，与Login.vue保持一致

    const requests: Promise<any>[] = [];

    if (accessToken) {
      requests.push(
        request({
          url: `/connect/revocation`,
          method: "post",
          data: qs.stringify({
            token: accessToken,
            token_type_hint: "access_token",
            client_id: clientId,
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
      );
    }

    if (refreshToken) {
      requests.push(
        request({
          url: `/connect/revocation`,
          method: "post",
          data: qs.stringify({
            token: refreshToken,
            token_type_hint: "refresh_token",
            client_id: clientId,
          }),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
      );
    }

    return Promise.all(requests);
  },

  /** 获取验证码接口*/
  getCaptcha() {
    return request<any, CaptchaInfo>({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "get",
    });
  },
};

export default AuthAPI;

/** 登录表单数据 */
export interface LoginFormData {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 验证码缓存key */
  // captchaKey: string;
  // /** 验证码 */
  // captchaCode: string;
  /** 记住我 */
  rememberMe: boolean;

  /** 客户端ID */
  clientId: string;

  /** 授权类型 */
  grantType: string;

  /** 范围 */
  scope: string;
}

/** 登录响应 */
export interface LoginResult {
  /** 访问令牌 */
  access_token: string;
  /** 刷新令牌 */
  refresh_token: string;
  /** 令牌类型 */
  tokenType: string;
  /** 过期时间(秒) */
  expires_in: number;
}

/** 验证码信息 */
export interface CaptchaInfo {
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码图片Base64字符串 */
  captchaBase64: string;
}
