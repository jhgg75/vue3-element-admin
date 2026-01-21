import request from "@/utils/request";

const DICT_BASE_URL = "/api/data-dictionaries";
const DICT_ITEM_BASE_URL = "/api/data-dictionary-items";

const DictAPI = {
  /** 字典分页列表 */
  getPage(queryParams: DictPageQuery) {
    const params: any = {
      SkipCount: (queryParams.pageNum - 1) * queryParams.pageSize,
      MaxResultCount: queryParams.pageSize,
      Sorting: "creationTime desc",
    };
    if (queryParams.keywords) {
      params.Filter = queryParams.keywords;
    }
    return request<any, any>({
      url: `${DICT_BASE_URL}`,
      method: "get",
      params,
    }).then((res) => {
      const list = (res.items || []).map((item: any) => ({
        ...item,
        isStatic: item.isStatic !== undefined ? item.isStatic : item.IsStatic,
      }));
      return {
        list,
        total: res.totalCount || 0,
      } as PageResult<DictPageVO[]>;
    });
  },
  /** 字典列表 */
  getList() {
    return request<any, any>({
      url: `${DICT_BASE_URL}`,
      method: "get",
      params: { MaxResultCount: 1000 },
    }).then((res) => {
      const items = res.items || (Array.isArray(res) ? res : []);
      return items.map((item: any) => ({
        label: item.name,
        value: item.code,
      }));
    });
  },
  /** 字典表单数据 */
  getFormData(id: string) {
    return request<any, DictForm>({ url: `${DICT_BASE_URL}/${id}`, method: "get" });
  },
  /** 新增字典 */
  create(data: DictForm) {
    return request({ url: `${DICT_BASE_URL}`, method: "post", data });
  },
  /** 修改字典 */
  update(id: string, data: DictForm) {
    const rest = { ...data };
    delete rest.id;
    return request({ url: `${DICT_BASE_URL}/${id}`, method: "put", data: rest });
  },
  /** 删除字典 */
  deleteByIds(ids: string) {
    return request({ url: `${DICT_BASE_URL}/${ids}`, method: "delete" });
  },

  /** 获取字典项分页列表 */
  getDictItemPage(dictionaryId: string, queryParams: DictItemPageQuery) {
    const params: any = {
      SkipCount: (queryParams.pageNum - 1) * queryParams.pageSize,
      MaxResultCount: queryParams.pageSize,
      Sorting: "sortOrder asc",
      DictionaryId: dictionaryId,
    };
    if (queryParams.keywords) {
      params.Filter = queryParams.keywords;
    }
    return request<any, any>({
      url: `${DICT_ITEM_BASE_URL}`,
      method: "get",
      params,
    }).then((res) => {
      const list = (res.items || []).map((item: any) => ({
        ...item,
        isEnabled: item.isEnabled !== undefined ? item.isEnabled : item.IsEnabled,
      }));
      return {
        list,
        total: res.totalCount || 0,
      } as PageResult<DictItemPageVO[]>;
    });
  },
  /** 获取字典项列表 */
  getDictItems(code: string) {
    return request<any, any>({
      url: `${DICT_BASE_URL}/${code}/items`,
      method: "get",
    }).then((res) => {
      if (Array.isArray(res)) {
        return res as DictItemOption[];
      }
      if (res && Array.isArray(res.items)) {
        return res.items as DictItemOption[];
      }
      return [] as DictItemOption[];
    });
  },
  /** 新增字典项 */
  createDictItem(dictionaryId: string, data: DictItemForm) {
    return request({ url: `${DICT_ITEM_BASE_URL}`, method: "post", data });
  },
  /** 获取字典项表单数据 */
  getDictItemFormData(dictionaryId: string, id: string) {
    return request<any, DictItemForm>({
      url: `${DICT_ITEM_BASE_URL}/${id}`,
      method: "get",
    });
  },
  /** 修改字典项 */
  updateDictItem(dictionaryId: string, id: string, data: DictItemForm) {
    const rest = { ...data };
    delete rest.id;
    return request({ url: `${DICT_ITEM_BASE_URL}/${id}`, method: "put", data: rest });
  },
  /** 删除字典项 */
  deleteDictItems(dictionaryId: string, ids: string) {
    return request({ url: `${DICT_ITEM_BASE_URL}/${ids}`, method: "delete" });
  },
};

export default DictAPI;

export interface DictPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
}
export interface DictPageVO {
  /** 字典ID */
  id: string;
  /** 字典编码 */
  code: string;
  /** 字典名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 是否静态 */
  isStatic: boolean;
}

export interface DictForm {
  /** 字典ID(新增不填) */
  id?: string;
  /** 字典编码 */
  code: string;
  /** 字典名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 是否静态 */
  isStatic?: boolean;
}

export interface DictItemPageQuery extends PageQuery {
  /** 搜索关键字 */
  keywords?: string;
}

export interface DictItemPageVO {
  /** 字典项ID */
  id: string;
  /** 字典ID */
  dictionaryId: string;
  /** 字典项编码 */
  code: string;
  /** 字典项名称 */
  label: string;
  /** 字典项值 */
  value: string;
  /** 排序 */
  sortOrder: number;
  /** 是否启用 */
  isEnabled: boolean;
}

export interface DictItemForm {
  /** 字典项ID(新增不填) */
  id?: string;
  /** 字典ID */
  dictionaryId: string;
  /** 字典项编码 */
  code: string;
  /** 字典项名称 */
  label: string;
  /** 字典项值 */
  value: string;
  /** 排序 */
  sortOrder: number;
  /** 是否启用 */
  isEnabled: boolean;
}

export interface DictItemOption {
  label: string;
  value: string;
  tagType?: string;
}
