<template>
  <!-- 最外层页面于窗口同宽，使聊天面板居中 -->
  <div class="home-view">
    <!-- 整个聊天面板 -->
    <div class="chat-panel">
      <!-- 左侧的会话列表 -->
      <div class="session-panel">
        <div class="title">ChatGPT助手</div>
        <div class="description">构建你的AI助手</div>
        <div v-if="loading" class="loading-overlay">
          <el-icon class="loading-icon"><Loading /></el-icon>
          正在加载历史会话...
        </div>

        <!-- 错误提示 -->
        <el-alert
          v-if="error"
          type="error"
          :title="error.message"
          show-icon
          closable
          @close="error = null"
        />
        <div class="session-list">
          <!-- for循环遍历会话列表用会话组件显示，并监听点击事件和删除事件。点击时切换到被点击的会话，删除时从会话列表中提出被删除的会话。 -->
          <!--  -->
          <template v-if="sessionList.length > 0">
            <SessionItem
              v-for="session in sessionList"
              :key="session.session_id"
              :active="session.session_id === activeSession.session_id"
              :session="session"
              class="session"
              @click="handleSessionSwitch(session)"
              @delete="handleDeleteSession"
            />
          </template>
          <div v-else class="empty-tip">
            <el-empty description="暂无历史会话" />
          </div>
          <div ref="loadMoreRef" class="load-more-trigger"></div>
        </div>
        <div class="button-wrapper">
          <div class="new-session">
            <el-button @click="handleCreateSession">
              <el-icon :size="15" class="el-icon--left">
                <CirclePlus />
              </el-icon>
              新的聊天
            </el-button>
          </div>
        </div>
      </div>
      <!-- 右侧的消息记录 -->
      <div class="message-panel">
        <!-- 会话名称 -->
        <div class="header">
          <div class="front">
            <!-- 如果处于编辑状态则显示输入框让用户去修改 -->
            <div v-if="isEdit" class="title">
              <!-- 按回车代表确认修改 -->
              <el-input
                v-model="activeSession.title"
                @keydown.enter="handleUpdateSession"
              ></el-input>
            </div>
            <!-- 否则正常显示标题 -->
            <div v-else class="title">{{ activeSession.title }}</div>
            <div class="description">与ChatGPT的{{ activeSession.message_count }}条对话</div>
          </div>
          <!-- 尾部的编辑按钮 -->
          <div class="rear">
            <el-icon :size="20">
              <!-- 不处于编辑状态显示编辑按钮 -->
              <EditPen v-if="!isEdit" @click="isEdit = true" />
              <!-- 处于编辑状态显示取消编辑按钮 -->
              <div class="edit-buttons" v-else>
                <Select @click="handleUpdateSession" />
                <Close @click="isEdit = false" />
              </div>
            </el-icon>
          </div>
        </div>
        <el-divider :border-style="'solid'" />
        <div class="message-list" ref="messageListRef">
          <!-- 过渡效果 -->
          <transition-group name="list">
            <el-scrollbar class="chat-box__content">
              <template v-for="(message, index) in messages" :key="index">
                <Message :message="message" @completeText="handleCompleteText" />
              </template>
            </el-scrollbar>
          </transition-group>
        </div>
        <!-- 监听发送事件 -->
        <InputBox @inputedText="handleInputText" :session_id="session_id" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick, computed } from 'vue'
import { ChatMessage, ChatSession } from '../../../typings'
import {
  findChatSessionById,
  queryChatSession,
  saveChatSession,
  updateSessionTitle,
} from '@/api/chat-session'
import SessionItem from '@/views/chat/components/SessionItem.vue'
import { CirclePlus, Close, EditPen, Select } from '@element-plus/icons-vue'
import MessageRow from '@/views/chat/components/MessageRow.vue'
import MessageInput from '@/views/chat/components/MessageInput.vue'
import Message from '@/views/chat/components/Message.vue'
// import { Client } from '@stomp/stompjs'
// import dayjs from 'dayjs'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useIntersectionObserver } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import InputBox from '@/views/chat/components/InputBox.vue'

import { webSocketService } from '@/services/WebSocketService'
import { provide } from 'vue'

// 是否连接
const isConnecting = ref(false)
// 连接失败状态
const connectionError = ref('')
// 使用router实现编程式路由导航
const router = useRouter()
// 当前会话页码
const currentPage = ref(1)
// 总会话页码
const totalPages = ref(0)
// 滚动加载触发元素
const loadMoreRef = ref<HTMLElement | null>(null)
// 会话标题是否处于编辑状态
const isEdit = ref(false)
// 初始化 存储当前活跃的会话信息
const activeSession = ref<ChatSession>({
  session_id: '',
  title: '',
  message_count: 0,
  messages: [],
  created_at: '',
  updated_at: '',
  is_deleted: false,
  user_id: '',
})
const sessionList = ref([] as ChatSession[])
const loading = ref(false)
const error = ref<Error | null>(null)
const { userInfo } = storeToRefs(useUserStore())
const messageListRef = ref<HTMLElement | null>(null)
const messages = computed(() => webSocketService.messages.value)

const completeMessages = ref('')
const handleCompleteText = (text: string) => {
  completeMessages.value = text
  console.log('completeMessages', completeMessages.value)
}

const inputedMessage = ref('')
const handleInputText = (text: string) => {
  inputedMessage.value = text
  console.log('inputedMessage', inputedMessage.value)
  activeSession.value.messages = [...activeSession.value.messages, text]
}

// 使用 Intersection Observer 实现会话分页滚动加载
// 通过 useIntersectionObserver 监听 loadMoreRef 元素是否进入视口
useIntersectionObserver(loadMoreRef, ([{ isIntersecting }]) => {
  if (isIntersecting && !loading.value && currentPage.value < totalPages.value) {
    currentPage.value++ // 增加页码
    loadSessions(currentPage.value) // 加载新页数据
  }
})

// 首次进入界面加载方法
const loadSessions = async (page = 1) => {
  try {
    loading.value = true
    error.value = null

    if (!userInfo.value?.user_id) {
      throw new Error('用户未登录')
    }

    const response = await queryChatSession(userInfo.value.user_id, {
      pageNum: page,
      pageSize: 20,
      query: {},
    })

    // 分页处理
    if (page === 1) {
      sessionList.value = response.data.list
    } else {
      sessionList.value.push(...response.data.list)
    }

    // 自动选择首个会话
    if (sessionList.value.length > 0 && !activeSession.value.session_id) {
      activeSession.value = sessionList.value[0]
    }
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('加载失败')
    console.error('加载会话列表失败:', err)
  } finally {
    loading.value = false
    // 滚动到底部
    scrollToBottom()
  }
}

// 挂载前
onMounted(async () => {
  const userStore = useUserStore()

  // 确保已初始化
  try {
    // 用户初始化检查
    if (!userStore.isInitialized) await userStore.initialize()
    if (!userStore.isLoggedIn) {
      ElMessage.error('请先登录')
      return router.push('/login')
    }
    if (!userStore.userInfo.user_id) await userStore.getInfo()

    // 加载会话列表
    await loadSessions()

    // 连接WebSocket
    if (activeSession.value.session_id) {
      isConnecting.value = true
      await webSocketService.connect(activeSession.value.session_id)
      ElMessage.success('实时连接已建立')
    }
  } catch (err) {
    connectionError.value = '无法建立实时连接'
    console.error('WebSocket连接失败:', err)
  } finally {
    isConnecting.value = false
  }
})

// 组件卸载时关闭连接
onBeforeUnmount(() => {
  webSocketService.disconnect()
})

// 删除会话
const handleDeleteSession = async (deletedSession: ChatSession) => {
  try {
    // 从列表移除
    sessionList.value = sessionList.value.filter((s) => s.session_id !== deletedSession.session_id)

    // 如果删除的是当前会话
    if (activeSession.value.session_id === deletedSession.session_id) {
      activeSession.value = sessionList.value[0] || {
        session_id: '',
        title: '',
        message_count: 0,
        messages: [],
      }
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 新增会话 当用户点击“新的聊天”按钮时，创建一个新的会话
const handleCreateSession = async () => {
  try {
    const userStore = useUserStore()

    // 1. 检查登录状态
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      await router.push('/login')
      return
    }

    // 2. 调用创建接口
    const createRes = await saveChatSession({
      user_id: userStore.userInfo.user_id!, // 从store获取用户ID
      title: '新的聊天', // 默认标题
    })

    // 3. 处理成功响应（根据实际接口返回结构调整）
    if (createRes.code === 200) {
      // 构造新会话对象
      const newSession = {
        session_id: createRes.data.session_id,
        user_id: createRes.data.user_id,
        title: createRes.data.title,
        message_count: createRes.data.message_count,
        messages: [],
        createdAt: createRes.data.created_at,
        updatedAt: createRes.data.updated_at,
      } as ChatSession

      // 4. 更新前端状态
      sessionList.value.unshift(newSession) // 插入到列表顶部
      activeSession.value = newSession // 自动切换新会话
      ElMessage.success('会话创建成功')
    }
  } catch (error) {
    console.error('创建会话失败:', error)
    ElMessage.error('创建会话失败')
  }
}

// 更新会话标题
const handleUpdateSession = () => {
  updateSessionTitle({
    sessionId: activeSession.value.session_id,
    new_title: activeSession.value.title,
  })
  isEdit.value = false
}

// 自动将聊天列表滑倒底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 当用户点击会话列表中的会话时，调用此方法切换到一个新的会话
const handleSessionSwitch = async (session: ChatSession) => {
  // 如果已是当前会话则不操作
  if (session.session_id === activeSession.value.session_id) return

  try {
    activeSession.value.messages = []
    loading.value = true

    // 断开与旧会话的 WebSocket 连接
    webSocketService.disconnect()

    // 连接新会话的WebSocket
    await webSocketService.connect(session.session_id)

    // 加载新会话的数据，并更新 activeSession 中的会话信息和消息列表
    const detail = await findChatSessionById(session.session_id)

    // 更新活跃会话
    activeSession.value = {
      ...detail.data,
      messages: detail.data.messages.map((m) => ({
        ...m,
        visibleChars: m.content?.length || 0, // 初始化已显示字符
      })),
    }
  } catch (err) {
    console.error('切换会话失败:', err)
    ElMessage.error('会话加载失败')
  } finally {
    loading.value = false

    // 滚动到消息列表的底部，确保新加载的消息可见
    scrollToBottom()
  }
}
</script>

<style lang="scss" scoped>
.home-view {
  width: 100vw;
  display: flex;
  justify-content: center;

  .chat-panel {
    display: flex;
    border-radius: 20px;
    height: 80vh;
    background-color: white;
    box-shadow: 0 0 20px 20px rgba(black, 0.05);
    margin-top: 70px;
    position: relative;

    .session-panel {
      width: 300px;
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
      padding: 20px;
      position: relative;
      border-right: 1px solid rgba(black, 0.07);
      background-color: rgb(231, 248, 255);
      display: flex;
      flex-direction: column;
      height: 100%;
      /* 标题 */
      .title {
        margin-top: 20px;
        font-size: 20px;
      }

      /* 描述*/
      .description {
        color: rgba(black, 0.7);
        font-size: 14px;
        margin-top: 10px;
      }

      .session-list {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 60px; // 为底部按钮留出空间
        padding-right: 5px; // 避免滚动条挤压内容

        // 自定义滚动条样式
        &::-webkit-scrollbar {
          width: 6px;
          background-color: rgba(0, 0, 0, 0.05);
        }
        &::-webkit-scrollbar-thumb {
          border-radius: 3px;
          background-color: rgba(0, 0, 0, 0.2);
        }
        .session {
          /* 每个会话之间留一些间距 */
          margin-top: 10px;
        }
      }

      .button-wrapper {
        /* session-panel是相对布局，这边的button-wrapper是相对它绝对布局 */
        position: absolute;
        bottom: 20px;
        left: 0;
        background: rgb(231, 248, 255); // 添加背景色防止透明
        z-index: 1; // 确保按钮在滚动内容之上
        display: flex;
        /* 让内部的按钮显示在右侧 */
        justify-content: flex-end;
        /* 宽度和session-panel一样宽*/
        width: 100%;

        /* 按钮于右侧边界留一些距离 */
        .new-session {
          margin-right: 20px;
        }
      }
    }

    /* 右侧消息记录面板*/
    .message-panel {
      width: 700px;
      display: flex;
      flex-direction: column;

      .header {
        padding: 20px 20px 0 20px;
        display: flex;
        /* 会话名称和编辑按钮在水平方向上分布左右两边 */
        justify-content: space-between;

        /* 前部的标题和消息条数 */
        .front {
          .title {
            color: rgba(black, 0.7);
            font-size: 20px;
          }

          .description {
            margin-top: 10px;
            color: rgba(black, 0.5);
          }
        }

        /* 尾部的编辑和取消编辑按钮 */
        .rear {
          display: flex;
          align-items: center;
        }
      }

      .edit-buttons {
        display: flex;
        align-items: center;
        gap: 10px; /* 调整间距 */
      }

      .message-list {
        flex: 1;
        padding: 15px;
        // 消息条数太多时，溢出部分滚动
        overflow-y: scroll;
        // 当切换聊天会话时，消息记录也随之切换的过渡效果
        .list-enter-active,
        .list-leave-active {
          transition: all 0.5s ease;
        }

        .list-enter-from,
        .list-leave-to {
          opacity: 0;
          transform: translateX(30px);
        }
      }
    }
  }
}

.chat-box {
  flex: 1;
  min-height: 0;
  border: 1px solid #ccc;
  margin: 10px 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.chat-box__content {
  height: 100%;
  padding: 10px;
  border-radius: 4px;
}
.chat-box__gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  pointer-events: none; /* 防止遮罩影响点击 */
}

.chat-box .el-scrollbar {
  flex: 1;
  min-height: 0; /* 重要：修复滚动容器高度问题 */
}

.el-scrollbar__wrap {
  overflow-x: hidden;
}

.el-scrollbar__view {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  padding-bottom: 30px; /* 增加底部空间 */
  min-height: 100%; /* 强制填满容器 */
}
</style>
