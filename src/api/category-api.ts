import request from "@/utils/request";

const CATEGORY_BASE_URL = "/api/categories";

export interface CategoryQuery extends PageQuery {
  keywords?: string;
  name?: string;
}

export interface CategoryVO {
  id?: number;
  name?: string;
  sort?: number;
}

export interface CategoryForm {
  id?: number;
  name?: string;
  sort?: number;
}

const CategoryAPI = {
  /**
   * 获取分类分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: CategoryQuery) {
    const params = {
      SkipCount: (queryParams.pageNum - 1) * queryParams.pageSize,
      MaxResultCount: queryParams.pageSize,
      Sorting: "CreationTime",
      Filter: queryParams.keywords,
    };

    return request<any, any>({
      url: `${CATEGORY_BASE_URL}`,
      method: "get",
      params,
    });
  },

  /**
   * 获取分类表单详情
   *
   * @param id 分类ID
   */
  getFormData(id: number) {
    return request<any, any>({
      url: `${CATEGORY_BASE_URL}/${id}`,
      method: "get",
    }).then((data) => ({
      ...data,
      sort: data.sortOrder ?? data.sort,
    })) as Promise<CategoryForm>;
  },

  /**
   * 添加分类
   *
   * @param data 分类表单数据
   */
  add(data: CategoryForm) {
    const payload = {
      name: data.name,
      sortOrder: data.sort ?? 0,
    };
    return request({
      url: `${CATEGORY_BASE_URL}`,
      method: "post",
      data: payload,
    });
  },

  /**
   * 修改分类
   *
   * @param id 分类ID
   * @param data 分类表单数据
   */
  update(id: number, data: CategoryForm) {
    const payload = {
      name: data.name,
      sortOrder: data.sort ?? 0,
    };
    return request({
      url: `${CATEGORY_BASE_URL}/${id}`,
      method: "put",
      data: payload,
    });
  },

  /**
   * 删除分类
   *
   * @param ids 分类ID，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${CATEGORY_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default CategoryAPI;
