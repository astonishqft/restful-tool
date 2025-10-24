<template>
  <div class="home-container">
    <!-- 头部操作区 -->
    <header class="header">
      <h1>Restful API 测试工具</h1>
    </header>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧菜单 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>测试用例</h2>
          <div class="sidebar-actions">
            <el-button type="primary" circle size="small" title="导入测试用例" @click="importFile">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="sidebar-content">
          <el-tree
            v-if="testCases.length > 0"
            :data="testCases"
            node-key="id"
            :props="treeProps"
            highlight-current
            :expand-on-click-node="false"
            :current-node-key="currentTestCaseId"
            default-expand-all
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node-content">
                <template v-if="data.apis">
                  <span class="node-label">
                    <el-icon><Folder /></el-icon>
                    <div :title="node.label" class="parent-node-titile">{{ node.label }}</div>
                  </span>
                  <div class="node-actions">
                    <el-dropdown @command="(command) => handleCommand(command, data)">
                      <el-button size="small">
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="delete">
                            <el-icon><Delete /></el-icon>
                            <span>删除</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="batchTest">
                            <el-icon><Connection /></el-icon>
                            <span>批量测试</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="editTestCase">
                            <el-icon><Edit /></el-icon>
                            <span>编辑测试用例</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="exportTestCase">
                            <el-icon><Download /></el-icon>
                            <span>导出测试用例</span>
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </template>

                <!-- API接口节点 -->
                <template v-else>
                  <span class="node-label" style="width: 255px">
                    <el-tag size="small" :type="getMethodType(data.method)">{{
                      data.method
                    }}</el-tag>
                    <div :title="node.label" class="child-node-titile">{{ node.label }}</div>
                  </span>
                  <div class="node-actions">
                    <el-dropdown @command="(command) => handleCommand(command, data)">
                      <el-button size="small">
                        <el-icon><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="delete">
                            <el-icon><Delete /></el-icon>
                            <span>删除</span>
                          </el-dropdown-item>
                          <el-dropdown-item command="batchTest">
                            <el-icon><Connection /></el-icon>
                            <span>测试</span>
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </template>
              </div>
            </template>
          </el-tree>
          <div v-else class="empty-state">
            <el-empty description="暂无测试用例，请导入文件"></el-empty>
          </div>
        </div>
      </aside>

      <!-- 右侧测试结果 -->
      <main class="test-results">
        <router-view />
      </main>
    </div>

    <!-- 测试结果弹窗 -->
    <el-dialog v-model="resultDialogVisible" title="响应结果" width="60%">
      <div v-if="selectedTestResult" class="test-result-detail">
        <div class="result-section">
          <h3>响应头信息</h3>
          <pre>{{ JSON.stringify(selectedTestResult.response?.headers, null, 2) }}</pre>
        </div>
        <div class="result-section">
          <h3>响应信息</h3>
          <pre>{{
            JSON.stringify(
              {
                code: selectedTestResult.response?.status,
                data: selectedTestResult.response?.data
              },
              null,
              2
            )
          }}</pre>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑测试用例弹窗（使用 store 状态） -->
    <el-dialog v-model="editCaseDialogVisible" title="编辑测试用例" width="480px">
      <el-form label-position="top">
        <el-form-item label="名称">
          <el-input v-model="editCaseName" placeholder="请输入测试用例名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editCaseDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="editCaseDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="store.confirmEditCase()">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入文件输入框 (隐藏) -->
    <input
      ref="fileInput"
      type="file"
      accept=".json,.yaml,.yml"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import {
  Plus,
  Delete,
  Folder,
  Connection,
  MoreFilled,
  Edit,
  Download
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useApiClientStore } from '../stores/apiClient'
import { storeToRefs } from 'pinia'

const router = useRouter()
const store = useApiClientStore()
const {
  testCases,
  currentTestCaseId,
  currentApi,
  resultDialogVisible,
  selectedTestResult,
  editCaseDialogVisible,
  editCaseName,
  editCaseDescription
} = storeToRefs(store)
const fileInput = ref<HTMLInputElement>()

const treeProps = {
  label: 'name',
  children: 'apis'
}

onMounted(() => {
  // 初始化测试用例与文件输入引用
  store.initFromStorage()
  store.setFileInput(fileInput.value || null)
})

const importFile = () => store.importFile()

const handleFileImport = (event: Event) => store.handleFileImport(event)

const handleCommand = (command: string, data: any) => store.handleCommand(command, data)

const handleNodeClick = (data: any, node: any) => {
  if (data.apis) {
    currentTestCaseId.value = data.id
    currentApi.value = null
    router.push({ name: 'case', params: { caseId: data.id } })
  } else {
    const caseId = node.parent?.data?.id
    currentTestCaseId.value = caseId
    currentApi.value = data
    router.push({ name: 'api', params: { caseId, apiId: data.id } })
  }
}

const getMethodType = (method: string) => store.getMethodType(method)
</script>

<style scoped lang="less">
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-color-page);

  .header {
    background: var(--bg-color);
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color-lighter);
    box-shadow: var(--box-shadow-base);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    height: 70px;

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      &::before {
        content: '🚀';
        font-size: 32px;
        -webkit-text-fill-color: initial;
      }
    }
  }

  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: calc(100vh - 72px);
    gap: 1px;
    background: var(--border-color-extra-light);

    .sidebar {
      width: 360px;
      background: var(--bg-color);
      display: flex;
      flex-direction: column;
      height: calc(100vh -72px);
      border-radius: 0 var(--spacing-sm) 0 0;
      box-shadow: var(--box-shadow-base);

      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-lg) var(--spacing-md);
        height: 70px;
        background: linear-gradient(135deg, var(--bg-color-light), var(--bg-color));
        border-bottom: 1px solid var(--border-color-extra-light);

        h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-color-primary);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          &::before {
            content: '📋';
            font-size: 20px;
          }
        }

        .sidebar-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .el-button {
            border-radius: var(--border-radius-circle);
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
            border: none;
            color: white;
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-2px) scale(1.05);
              box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
            }
          }
        }
      }

      .sidebar-content {
        overflow-y: auto;
        // padding: var(--spacing-md);
        height: calc(100vh - 151px);

        .empty-state {
          padding: var(--spacing-xl) var(--spacing-lg);
          text-align: center;
          color: var(--text-color-secondary);

          .el-icon {
            font-size: 48px;
            margin-bottom: var(--spacing-md);
            opacity: 0.6;
            animation: float 3s ease-in-out infinite;
          }

          p {
            margin: var(--spacing-sm) 0;
            font-weight: 500;
          }
        }

        .tree-node-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: var(--spacing-sm) 0;
          border-radius: var(--border-radius-base);
          transition: all 0.3s ease;
          position: relative;

          .node-label {
            display: flex;
            box-sizing: border-box;
            align-items: center;
            white-space: nowrap;
            margin-right: var(--spacing-sm);
            font-weight: 500;

            .el-icon {
              margin-right: var(--spacing-sm);
              color: var(--primary-color);
              font-size: 18px;
            }

            .parent-node-titile {
              width: 248px;
              margin-left: var(--spacing-xs);
              overflow: hidden;
              text-overflow: ellipsis;
              color: var(--text-color-primary);
            }

            .child-node-titile {
              overflow: hidden;
              text-overflow: ellipsis;
              color: var(--text-color-regular);
            }
          }

          .node-actions {
            display: flex;
            gap: var(--spacing-xs);
            opacity: 0;
            transition: opacity 0.3s ease;

            .el-button {
              padding: 0;
              width: 24px;
              height: 24px;
              border-radius: var(--border-radius-circle);
              border: 1px solid var(--border-color-light);
              background: var(--bg-color);
              transition: all 0.3s ease;

              &:hover {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
                transform: scale(1.1);
              }
            }
          }

          &:hover .node-actions {
            opacity: 1;
          }
        }
      }
    }

    .test-results {
      width: calc(100% - 360px);
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: var(--spacing-lg);
      background: var(--bg-color);
      border-radius: var(--spacing-sm) 0 0 0;
      box-shadow: var(--box-shadow-base);
      height: calc(100vh - 72px);
      .test-case-details {
        display: flex;
        flex-direction: column;
        height: 100%;

        .test-case-header {
          margin-bottom: var(--spacing-lg);
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, var(--bg-color-light), var(--bg-color));
          border-radius: var(--border-radius-base);
          border: 1px solid var(--border-color-extra-light);
          box-shadow: var(--box-shadow-base);

          h2 {
            margin: 0 0 var(--spacing-sm) 0;
            font-size: 24px;
            font-weight: 700;
            color: var(--text-color-primary);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);

            &::before {
              content: '🎯';
              font-size: 28px;
            }
          }

          .test-case-description {
            color: var(--text-color-secondary);
            font-size: 15px;
            line-height: 1.6;
            font-weight: 500;
          }
        }

        .api-list {
          flex: 1;
          overflow-y: auto;
          background: var(--bg-color);
          border-radius: var(--border-radius-base);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color-extra-light);
          box-shadow: var(--box-shadow-base);
        }
      }

      .no-selection {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        flex-direction: column;
        color: var(--text-color-secondary);
        background: radial-gradient(circle at center, var(--bg-color-light), var(--bg-color));
        border-radius: var(--border-radius-base);

        .el-icon {
          font-size: 64px;
          margin-bottom: var(--spacing-lg);
          opacity: 0.6;
          animation: float 3s ease-in-out infinite;
        }

        p {
          font-size: 16px;
          font-weight: 500;
          margin: var(--spacing-sm) 0;
        }
      }
    }
  }

  .test-result-detail {
    .result-section {
      margin-bottom: var(--spacing-lg);
      background: var(--bg-color);
      border-radius: var(--border-radius-base);
      padding: var(--spacing-md);
      border: 1px solid var(--border-color-extra-light);
      box-shadow: var(--box-shadow-base);

      h3 {
        margin: 0 0 var(--spacing-md) 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color-primary);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        &::before {
          content: '📊';
          font-size: 20px;
        }
      }

      pre {
        background: linear-gradient(135deg, var(--bg-color-light), var(--bg-color-page));
        border: 1px solid var(--border-color-lighter);
        border-radius: var(--border-radius-base);
        padding: var(--spacing-md);
        overflow-x: auto;
        font-size: 13px;
        margin: 0;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        line-height: 1.5;
        color: var(--text-color-regular);
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
      }
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .home-container .main-content .sidebar {
    width: 320px;
  }
}

@media (max-width: 768px) {
  .home-container {
    .header h1 {
      font-size: 22px;
    }

    .main-content {
      flex-direction: column;

      .sidebar {
        width: 100%;
        height: 250px;
        border-radius: var(--spacing-sm) var(--spacing-sm) 0 0;
      }

      .test-results {
        border-radius: 0;
      }
    }
  }
}

@media (max-width: 480px) {
  .home-container {
    .header {
      padding: var(--spacing-md);

      h1 {
        font-size: 20px;
      }
    }

    .main-content {
      .sidebar {
        height: 200px;
      }

      .test-results {
        padding: var(--spacing-md);
      }
    }
  }
}
</style>
