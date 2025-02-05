export interface ChatMessage extends BaseEntity {
  content: string
  role: string
  session: ChatSession
  validStatus: 'VALID' | 'INVALID'
}

export interface ChatSession extends BaseEntity {
  topic: string
  statistic: Statistic
  messages: ChatMessage[]
  createdBy: User
  validStatus: 'VALID' | 'INVALID'
}
export interface Statistic {
  chatCount: number
  tokenCount: number
  wordCount: number
}

export interface ChatConfig extends BaseEntity {
  model: number
  temperature: number
  maxTokens: number
  presencePenalty: number
  apiKey: string
  createdBy: User
  validStatus: 'VALID' | 'INVALID'
}

export interface User extends BaseEntity {
  avatar: string
  nickname: string
  email: string
  password: string
}
export class LoginResponse {
  tokenName: string
  tokenValue: string
  loginId: string
}

export type EditMode = 'CREATE' | 'EDIT'

export interface MyFile {
  name: string
  path: string
  status: 'ready' | 'uploading' | 'finish'
  file?: File
}

export interface QueryRequest<T> {
  pageNum: number
  pageSize: number
  keyword?: string
  query?: Partial<T>
}

export interface Page<T> {
  list: T[]
  total: number
  pageSize: number
  pageNum: number
  totalPages: number
}

export interface BaseEntity {
  id: string
  updatedAt: string
  createdAt: string
  validStatus: 'VALID' | 'INVALID'
}

// 通用格式 以注册返回为基础
export interface Result<T> {
  code: number
  message: string
  data: T
}

export interface RegistrationData {
  email: string
  refresh_token: string
  ip_address: string
}

export interface LoginData {
  email: string
  refresh_token: string
  ip_address: string
}
