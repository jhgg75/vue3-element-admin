import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import router from "@/router";
import type { RouteVO } from "@/api/system/menu-api";
const modules = import.meta.glob("../../views/**/**.vue");
const Layout = () => import("../../layouts/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  // 所有路由（静态路由 + 动态路由）
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合布局的左侧菜单路由
  const mixLayoutSideMenus = ref<RouteRecordRaw[]>([]);
  // 动态路由是否已生成
  const isRouteGenerated = ref(false);

  /** 生成动态路由 */
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    try {
      // const data = await MenuAPI.getRoutes(); // 获取当前登录人的菜单路由
      // 临时硬编码菜单
      const data: RouteVO[] = [
        {
          path: "/news",
          component: "Layout",
          redirect: "/news/index",
          name: "News",
          meta: { title: "新闻管理", icon: "system", alwaysShow: true },
          children: [
            {
              path: "index",
              component: "news/index",
              name: "NewsList",
              meta: { title: "新闻列表", icon: "document" },
              children: [],
            },
            {
              path: "category",
              component: "category/index",
              name: "CategoryList",
              meta: { title: "分类列表", icon: "tree" },
              children: [],
            },
            {
              path: "create",
              component: "news/create",
              name: "NewsCreate",
              meta: { title: "新增新闻", hidden: true, activeMenu: "/news/index" },
              children: [],
            },
          ],
        },
        {
          path: "/user-manager",
          component: "Layout",
          redirect: "/user-manager/list",
          name: "UserManager",
          meta: { title: "用户管理", icon: "el-icon-User", alwaysShow: true },
          children: [
            {
              path: "list",
              component: "system/user/index",
              name: "UserList",
              meta: { title: "用户列表", icon: "el-icon-User", hideDeptTree: true },
              children: [],
            },
          ],
        },
        {
          path: "/auth-manager",
          component: "Layout",
          redirect: "/auth-manager/list",
          name: "AuthManager",
          meta: { title: "授权管理", icon: "el-icon-Lock", alwaysShow: true },
          children: [
            {
              path: "list",
              component: "system/role/index",
              name: "AuthList",
              meta: { title: "授权列表", icon: "el-icon-Lock" },
              children: [],
            },
          ],
        },
        {
          path: "/notice-manager",
          component: "Layout",
          redirect: "/notice-manager/list",
          name: "NoticeManager",
          meta: { title: "公告管理", icon: "el-icon-Bell", alwaysShow: true },
          children: [
            {
              path: "list",
              component: "system/notice/index",
              name: "NoticeList",
              meta: { title: "公告列表", icon: "el-icon-Bell" },
              children: [],
            },
          ],
        },
        {
          path: "/role-manager",
          component: "Layout",
          redirect: "/role-manager/list",
          name: "RoleManager",
          meta: { title: "角色管理", icon: "el-icon-Avatar", alwaysShow: true },
          children: [
            {
              path: "list",
              component: "system/role/index",
              name: "RoleList",
              meta: { title: "角色列表", icon: "el-icon-Avatar" },
              children: [],
            },
          ],
        },
        {
          path: "/menu-manager",
          component: "Layout",
          redirect: "/menu-manager/list",
          name: "MenuManager",
          meta: { title: "菜单管理", icon: "el-icon-Menu", alwaysShow: true },
          children: [
            {
              path: "list",
              component: "system/menu/index",
              name: "MenuList",
              meta: { title: "菜单列表", icon: "el-icon-Menu" },
              children: [],
            },
          ],
        },
        {
          path: "/version-manager",
          component: "Layout",
          redirect: "/version-manager/list",
          name: "VersionManager",
          meta: { title: "版本管理", icon: "el-icon-PriceTag", alwaysShow: true },
          children: [
            {
              path: "list",
              component: "version/index",
              name: "VersionList",
              meta: { title: "版本列表", icon: "el-icon-PriceTag" },
              children: [],
            },
          ],
        },
      ];
      const dynamicRoutes = transformRoutes(data);

      routes.value = [...constantRoutes, ...dynamicRoutes];
      isRouteGenerated.value = true;

      return dynamicRoutes;
    } catch (error) {
      // 路由生成失败，重置状态
      isRouteGenerated.value = false;
      throw error;
    }
  }

  /** 设置混合布局左侧菜单 */
  const setMixLayoutSideMenus = (parentPath: string) => {
    const parentMenu = routes.value.find((item) => item.path === parentPath);
    mixLayoutSideMenus.value = parentMenu?.children || [];
  };

  /** 重置路由状态 */
  const resetRouter = () => {
    // 移除动态添加的路由
    const constantRouteNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));
    routes.value.forEach((route) => {
      if (route.name && !constantRouteNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });

    // 重置所有状态
    routes.value = [...constantRoutes];
    mixLayoutSideMenus.value = [];
    isRouteGenerated.value = false;
  };

  return {
    routes,
    mixLayoutSideMenus,
    isRouteGenerated,
    generateRoutes,
    setMixLayoutSideMenus,
    resetRouter,
  };
});

/**
 * 转换后端路由数据为Vue Router配置
 * 处理组件路径映射和Layout层级嵌套
 */
const transformRoutes = (routes: RouteVO[], isTopLevel: boolean = true): RouteRecordRaw[] => {
  return routes.map((route) => {
    const { component, children, ...args } = route;

    // 处理组件：顶层或非Layout保留组件，中间层Layout设为undefined
    const processedComponent = isTopLevel || component !== "Layout" ? component : undefined;

    const normalizedRoute = { ...args } as RouteRecordRaw;

    if (!processedComponent) {
      // 多级菜单的父级菜单，不需要组件
      normalizedRoute.component = undefined;
    } else {
      // 动态导入组件，Layout特殊处理，找不到组件时返回404
      normalizedRoute.component =
        processedComponent === "Layout"
          ? Layout
          : modules[`../../views/${processedComponent}.vue`] ||
            modules[`../../views/error/404.vue`];
    }

    // 递归处理子路由
    if (children && children.length > 0) {
      normalizedRoute.children = transformRoutes(children, false);
    }

    return normalizedRoute;
  });
};

/** 非组件环境使用权限store */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
