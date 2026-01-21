import request from "@/utils/request";

const NOTICE_BASE_URL = "/api/v1/notices";

const NoticeAPI = {
  /** 获取通知公告分页数据 */
  getPage(queryParams: NoticePageQuery = { pageNum: 1, pageSize: 10 }) {
    const params: any = {
      SkipCount: (queryParams.pageNum - 1) * queryParams.pageSize,
      MaxResultCount: queryParams.pageSize,
      Sorting: "creationTime desc",
    };
    if (queryParams.title) params.Filter = queryParams.title;
    if (queryParams.publishStatus !== undefined)
      params.IsPublished = queryParams.publishStatus === 1;

    return request<any, any>({
      url: `/api/announcements`,
      method: "get",
      params,
    }).then((res) => {
      const list = (res.items || []).map((item: any) => ({
        ...item,
        id: item.id || item.Id,
        title: item.title || item.Title,
        content: item.content || item.Content,
        type: item.type !== undefined ? item.type : item.Type,
        level: item.level !== undefined ? item.level : item.Level,
        targetType: item.targetType !== undefined ? item.targetType : item.TargetType,
        isPublished: item.isPublished !== undefined ? item.isPublished : item.IsPublished,
        isSticky: item.isSticky !== undefined ? item.isSticky : item.IsSticky,
        publishStart: item.publishStart || item.PublishStart,
        publishEnd: item.publishEnd || item.PublishEnd,
        publisherName: item.publisherName || item.PublisherName,
        creationTime: item.creationTime || item.CreationTime,
      }));
      return {
        list,
        total: res.totalCount || 0,
      } as PageResult<NoticePageVO[]>;
    });
  },
  /** 获取通知公告表单数据 */
  getFormData(id: string) {
    return request<any, NoticeForm>({ url: `${NOTICE_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 添加通知公告 */
  create(data: NoticeForm) {
    return request({ url: `/api/announcements`, method: "post", data });
  },
  /** 更新通知公告 */
  update(id: string, data: NoticeForm) {
    const rest = { ...data };
    delete rest.id;
    return request({ url: `/api/announcements/${id}`, method: "put", data: rest });
  },
  /** 批量删除通知公告，多个以英文逗号(,)分割 */
  deleteByIds(ids: string) {
    return request({ url: `/api/announcements/${ids}`, method: "delete" });
  },
  /** 发布通知 */
  publish(id: string) {
    return request({ url: `/api/announcements/${id}/publish`, method: "put" });
  },
  /** 撤回通知 (停止发布) */
  revoke(id: string) {
    return request({ url: `/api/announcements/${id}/unpublish`, method: "put" });
  },
  /** 查看通知 */
  getDetail(id: string) {
    return request<any, NoticeDetailVO>({ url: `/api/announcements/${id}`, method: "get" });
  },
  /** 全部已读 */
  readAll() {
    return request({ url: `${NOTICE_BASE_URL}/read-all`, method: "put" });
  },
  /** 获取我的通知分页列表 */
  getMyNoticePage(queryParams?: NoticePageQuery) {
    return request<any, PageResult<NoticePageVO[]>>({
      url: `${NOTICE_BASE_URL}/my-page`,
      method: "get",
      params: queryParams,
    });
  },
};

export default NoticeAPI;

export interface NoticePageQuery extends PageQuery {
  /** 标题 */
  title?: string;
  /** 发布状态(0:草稿;1:已发布;2:已撤回) */
  publishStatus?: number;
  /** 是否已读(1:是;0:否) */
  isRead?: number;
}
export interface NoticeForm {
  /** 通知ID(新增不填) */
  id?: string;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 是否发布 */
  isPublished?: boolean;
  /** 发布开始时间 */
  publishStart?: string | Date;
  /** 发布结束时间 */
  publishEnd?: string | Date;
  /** 是否置顶 */
  isSticky?: boolean;
  /** 优先级 */
  priority?: number;
  /** 类型 (0:Notification, 1:Activity, 2:Update, 3:Maintenance) */
  type?: number;
  /** 级别 (0:Normal, 1:Urgent, 2:Critical) */
  level?: number;
  /** 目标类型 (0:All, 1:SpecificUsers) */
  targetType?: number;
  /** 目标用户ID(多个以英文逗号(,)分割) */
  targetUserIds?: string[];
}
export interface NoticePageVO {
  /** 通知ID */
  id: string;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 类型 */
  type?: number;
  /** 级别 */
  level?: number;
  /** 发布人ID */
  publisherId?: string;
  /** 发布人姓名 */
  publisherName?: string;
  /** 优先级 */
  priority?: number;
  /** 目标类型 */
  targetType?: number;
  /** 是否发布 */
  isPublished?: boolean;
  /** 发布开始时间 */
  publishStart?: string;
  /** 发布结束时间 */
  publishEnd?: string;
  /** 是否置顶 */
  isSticky?: boolean;
  /** 创建时间 */
  creationTime?: string;
}
export interface NoticeDetailVO {
  /** 通知ID */
  id?: string;
  /** 标题 */
  title?: string;
  /** 内容 */
  content?: string;
  /** 类型 */
  type?: number;
  /** 发布人名称 */
  publisherName?: string;
  /** 优先级/级别 */
  level?: number | string;
  /** 发布时间 */
  publishTime?: Date;
  /** 发布状态 */
  publishStatus?: number;
  /** 是否发布 */
  isPublished?: boolean;
  /** 发布开始时间 */
  publishStart?: string | Date;
  /** 发布结束时间 */
  publishEnd?: string | Date;
  /** 是否置顶 */
  isSticky?: boolean;
  /** 优先级 */
  priority?: number;
  /** 目标类型 */
  targetType?: number;
  /** 目标用户ID */
  targetUserIds?: string[];
}
