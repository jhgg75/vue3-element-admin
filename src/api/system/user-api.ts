import request from "@/utils/request";

const USER_BASE_URL = "/api/v1/users";

const UserAPI = {
  /**
   * 获取当前登录用户信息
   *
   * @returns 登录用户昵称、头像信息，包括角色和权限
   */
  getInfo() {
    return request<any, MyProfileResponse>({
      url: `/api/account/my-profile`,
      method: "get",
    }).then((userObj) => {
      const avatarPath = userObj.extraProperties?.Avatar;
      let avatar = "";
      if (avatarPath) {
        if (avatarPath.startsWith("http") || avatarPath.startsWith("https")) {
          avatar = avatarPath;
        } else {
          const ossDomain = import.meta.env.VITE_OSS_DOMAIN || "http://localhost:44329";
          const domain = ossDomain.endsWith("/") ? ossDomain.slice(0, -1) : ossDomain;
          const path = avatarPath.startsWith("/") ? avatarPath : "/" + avatarPath;
          avatar = domain + path;
        }
      } else {
        avatar = "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
      }

      const userInfo: UserInfo = {
        userId: userObj.id,
        username: userObj.userName,
        nickname: userObj.name,
        avatar,
        roles: userObj.roles || [],
        perms: userObj.perms || [],
      };
      return userInfo;
    });
  },

  getPage(queryParams: UserPageQuery): Promise<PageResult<UserPageVO[]>> {
    const params: any = {
      SkipCount: (queryParams.pageNum - 1) * queryParams.pageSize,
      MaxResultCount: queryParams.pageSize,
    };

    if (queryParams.userName) {
      params.UserName = queryParams.userName;
    }
    if (queryParams.name) {
      params.Name = queryParams.name;
    }
    if (queryParams.email) {
      params.Email = queryParams.email;
    }
    if (queryParams.phoneNumber) {
      params.PhoneNumber = queryParams.phoneNumber;
    }
    if (!params.UserName && queryParams.keywords) {
      params.UserName = queryParams.keywords;
    }

    return request<any, UserListResponse>({
      url: `/api/users`,
      method: "get",
      params,
    }).then((res) => {
      const list: UserPageVO[] = (res.items || []).map((item) => ({
        id: item.id,
        username: item.userName,
        nickname: item.nickName,
        email: item.email,
        mobile: item.phoneNumber,
        avatar: item.avatar,
        roleNames: Array.isArray(item.roles) ? item.roles.join(",") : item.roles,
        createTime: item.creationTime,
      }));

      return {
        list,
        total: res.totalCount ?? 0,
      };
    });
  },

  /**
   * 获取用户表单详情
   *
   * @param userId 用户ID
   * @returns 用户表单详情
   */
  getFormData(userId: string) {
    return request<any, UserForm>({
      url: `${USER_BASE_URL}/${userId}/form`,
      method: "get",
    });
  },

  /**
   * 添加用户
   *
   * @param data 用户表单数据
   */
  create(data: UserForm) {
    return request({
      url: `${USER_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改用户
   *
   * @param id 用户ID
   * @param data 用户表单数据
   */
  update(id: string, data: UserForm) {
    return request({
      url: `${USER_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 修改用户密码
   *
   * @param id 用户ID
   * @param password 新密码
   */
  resetPassword(id: string, password: string) {
    return request({
      url: `${USER_BASE_URL}/${id}/password/reset`,
      method: "put",
      params: { password },
    });
  },

  /**
   * 批量删除用户，多个以英文逗号(,)分割
   *
   * @param ids 用户ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${USER_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /** 下载用户导入模板 */
  downloadTemplate() {
    return request({
      url: `${USER_BASE_URL}/template`,
      method: "get",
      responseType: "blob",
    });
  },

  /**
   * 导出用户
   *
   * @param queryParams 查询参数
   */
  export(queryParams: UserPageQuery) {
    return request({
      url: `${USER_BASE_URL}/export`,
      method: "get",
      params: queryParams,
      responseType: "blob",
    });
  },

  /**
   * 导入用户
   *
   * @param deptId 部门ID
   * @param file 导入文件
   */
  import(deptId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<any, ExcelResult>({
      url: `${USER_BASE_URL}/import`,
      method: "post",
      params: { deptId },
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /** 获取个人中心用户信息 */
  getProfile() {
    return request<any, any>({
      url: `/api/account/my-profile`,
      method: "get",
    }).then((userObj) => {
      // 头像处理
      const avatarPath = userObj.extraProperties?.Avatar;
      let avatar = "";
      if (avatarPath) {
        if (avatarPath.startsWith("http") || avatarPath.startsWith("https")) {
          avatar = avatarPath;
        } else {
          const ossDomain = import.meta.env.VITE_OSS_DOMAIN || "http://localhost:44329";
          const domain = ossDomain.endsWith("/") ? ossDomain.slice(0, -1) : ossDomain;
          const path = avatarPath.startsWith("/") ? avatarPath : "/" + avatarPath;
          avatar = domain + path;
        }
      } else {
        avatar = "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
      }

      const profileVO: UserProfileVO = {
        id: userObj.id,
        username: userObj.userName,
        nickname: userObj.name,
        email: userObj.email,
        mobile: userObj.phoneNumber,
        avatar,
        roleNames: userObj.roleNames,
        deptName: userObj.deptName,
      };
      return profileVO;
    });
  },

  /** 修改个人中心用户信息 */
  updateProfile(data: UserProfileForm) {
    return request({
      url: `${USER_BASE_URL}/profile`,
      method: "put",
      data,
    });
  },

  /** 修改个人中心用户密码 */
  changePassword(data: PasswordChangeForm) {
    return request({
      url: `${USER_BASE_URL}/password`,
      method: "put",
      data,
    });
  },

  /** 发送短信验证码（绑定或更换手机号）*/
  sendMobileCode(mobile: string) {
    return request({
      url: `${USER_BASE_URL}/mobile/code`,
      method: "post",
      params: { mobile },
    });
  },

  /** 绑定或更换手机号 */
  bindOrChangeMobile(data: MobileUpdateForm) {
    return request({
      url: `${USER_BASE_URL}/mobile`,
      method: "put",
      data,
    });
  },

  /** 发送邮箱验证码（绑定或更换邮箱）*/
  sendEmailCode(email: string) {
    return request({
      url: `${USER_BASE_URL}/email/code`,
      method: "post",
      params: { email },
    });
  },

  /** 绑定或更换邮箱 */
  bindOrChangeEmail(data: EmailUpdateForm) {
    return request({
      url: `${USER_BASE_URL}/email`,
      method: "put",
      data,
    });
  },

  /**
   *  获取用户下拉列表
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${USER_BASE_URL}/options`,
      method: "get",
    });
  },
};

export default UserAPI;

/** 登录用户信息 */
export interface UserInfo {
  /** 用户ID */
  userId?: string;

  /** 用户名 */
  username?: string;

  /** 昵称 */
  nickname?: string;

  /** 头像URL */
  avatar?: string;

  /** 角色 */
  roles: string[];

  /** 权限 */
  perms: string[];
}

export interface MyProfileResponse {
  id: string;
  userName: string;
  name: string;
  extraProperties?: {
    Avatar?: string;
    [key: string]: any;
  };
  roles?: string[];
  perms?: string[];
}

/**
 * 用户分页查询对象
 */
export interface UserPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;

  /** 用户名 */
  userName?: string;

  /** 昵称 */
  name?: string;

  /** 邮箱 */
  email?: string;

  /** 手机号 */
  phoneNumber?: string;

  /** 用户状态 */
  status?: number;

  /** 部门ID */
  deptId?: string;

  /** 开始时间 */
  createTime?: [string, string];
}

/** 用户分页对象 */
export interface UserPageVO {
  /** 用户ID */
  id: string;
  /** 用户头像URL */
  avatar?: string;
  /** 创建时间 */
  createTime?: string;
  /** 部门名称 */
  deptName?: string;
  /** 用户邮箱 */
  email?: string;
  /** 性别 */
  gender?: number;
  /** 手机号 */
  mobile?: string;
  /** 用户昵称 */
  nickname?: string;
  /** 角色名称，多个使用英文逗号(,)分割 */
  roleNames?: string;
  /** 用户状态(1:启用;0:禁用) */
  status?: number;
  /** 用户名 */
  username?: string;
}

/** 用户表单类型 */
export interface UserForm {
  /** 用户ID */
  id?: string;
  /** 用户头像 */
  avatar?: string;
  /** 部门ID */
  deptId?: string;
  /** 邮箱 */
  email?: string;
  /** 性别 */
  gender?: number;
  /** 手机号 */
  mobile?: string;
  /** 昵称 */
  nickname?: string;
  /** 角色ID集合 */
  roleIds?: number[];
  /** 用户状态(1:正常;0:禁用) */
  status?: number;
  /** 用户名 */
  username?: string;
}

/** 个人中心用户信息 */
export interface UserProfileVO {
  /** 用户ID */
  id?: string;

  /** 用户名 */
  username?: string;

  /** 昵称 */
  nickname?: string;

  /** 头像URL */
  avatar?: string;

  /** 性别 */
  gender?: number;

  /** 手机号 */
  mobile?: string;

  /** 邮箱 */
  email?: string;

  /** 部门名称 */
  deptName?: string;

  /** 角色名称，多个使用英文逗号(,)分割 */
  roleNames?: string;

  /** 创建时间 */
  createTime?: Date;
}

/** 个人中心用户信息表单 */
export interface UserProfileForm {
  /** 用户ID */
  id?: string;

  /** 用户名 */
  username?: string;

  /** 昵称 */
  nickname?: string;

  /** 头像URL */
  avatar?: string;

  /** 性别 */
  gender?: number;

  /** 手机号 */
  mobile?: string;

  /** 邮箱 */
  email?: string;
}

/** 修改密码表单 */
export interface PasswordChangeForm {
  /** 原密码 */
  oldPassword?: string;
  /** 新密码 */
  newPassword?: string;
  /** 确认新密码 */
  confirmPassword?: string;
}

/** 修改手机表单 */
export interface MobileUpdateForm {
  /** 手机号 */
  mobile?: string;
  /** 验证码 */
  code?: string;
}

/** 修改邮箱表单 */
export interface EmailUpdateForm {
  /** 邮箱 */
  email?: string;
  /** 验证码 */
  code?: string;
}

export interface UserListItemDTO {
  id: string;
  userName: string;
  nickName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  roles: string[];
  creationTime: string;
}

export interface UserListResponse {
  items: UserListItemDTO[];
  totalCount: number;
}
