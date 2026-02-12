import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器（添加 token）
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.accessToken = token
  }
  return config
})

// 响应拦截器（统一处理错误）
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API 请求错误:', error)
    return Promise.reject(error)
  }
)

// 导出 API 方法
export const adminApi = {
  login: (data) => api.post('admin/login', data),
  token: () => api.get('admin/token'),
  logout: () => api.post('admin/logout'),
  list: (params) => api.get('admin', { params }),
  create: (data) => api.post('admin', data),
  reset: (id) => api.put(`admin/${id}/reset`, {}),
  delete: (id) => api.delete(`admin/${id}`),
  updateLoginName: (id, data) => api.put(`admin/${id}/loginName`, data),
  updatePassword: (id, data) => api.put(`admin/${id}/password`, data)
}

export const memberApi = {
  list: (params) => api.get('member', { params }),
  update: (id, data) => api.put(`member/${id}`, data)
}

export const deptApi = {
  list: (params) => api.get('dept', { params }),
  update: (id, data) => api.put(`dept/${id}`, data)
}

export const reportApi = {
  list: (params) => api.get('report', { params })
}

export const editionApi = {
  list: (params) => api.get('edition', { params }),
  updateStatus: (data) => api.put('edition/status', data),
  swapPublish: () => api.put('edition/publish/swap', {})
}

export default api