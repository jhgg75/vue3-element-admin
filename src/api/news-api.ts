import request from "@/utils/request";

const NEWS_BASE_URL = "/api/articles";

export interface NewsQuery extends PageQuery {
  title?: string;
  status?: number; // 0: Draft, 1: Published
  categoryId?: number;
}

export interface NewsVO {
  id: number;
  title: string;
  cover: string;
  contentHtml: string;
  status: number;
  categoryId: number;
  categoryName?: string;
  publishTime?: string;
  createTime?: string;
}

export interface NewsForm {
  id?: number | string;
  title: string;
  coverUrl: string;
  contentHtml: string;
  status: number;
  categoryId: number;
}

const NewsAPI = {
  /**
   * 获取新闻分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: NewsQuery) {
    const params = {
      SkipCount: (queryParams.pageNum - 1) * queryParams.pageSize,
      MaxResultCount: queryParams.pageSize,
      Sorting: "CreationTime DESC",
      Filter: queryParams.title,
      Status: queryParams.status,
      CategoryId: queryParams.categoryId,
    };

    return request<any, any>({
      url: `${NEWS_BASE_URL}`,
      method: "get",
      params,
    });
  },

  /**
   * 获取新闻详情
   *
   * @param id 新闻ID
   */
  getFormData(id: number | string) {
    return request<any, NewsForm>({
      url: `${NEWS_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 添加新闻
   *
   * @param data 新闻表单数据
   */
  add(data: NewsForm) {
    return request({
      url: `${NEWS_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改新闻
   *
   * @param id 新闻ID
   * @param data 新闻表单数据
   */
  update(id: number | string, data: NewsForm) {
    return request({
      url: `${NEWS_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 删除新闻
   *
   * @param ids 新闻ID，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${NEWS_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default NewsAPI;
