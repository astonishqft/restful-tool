<template>
  <div class="all-tests-view">
    <div v-if="!state?.currentTestCase?.value" class="no-selection">
      <el-empty description="请选择或导入测试用例"></el-empty>
    </div>

    <div v-else class="test-case-details">
      <div class="test-case-header">
        <h2 class="test-case-name" :title="state.currentTestCase.value!.name">
          {{ state.currentTestCase.value!.name }} - 批量测试
        </h2>
        <div class="test-case-description">
          {{ state.currentTestCase.value!.description || '无描述' }}
        </div>
      </div>

      <div class="test-case-actions" style="margin-bottom: 20px">
        <el-button
          v-if="state.currentTestCase.value && state.currentTestCase.value.apis.length > 0"
          type="success"
          :loading="state.isRunning.value"
          @click="actions.runAllTests()"
        >
          <el-icon><Refresh /></el-icon>
          运行所有测试 ({{ state.currentTestCase.value.apis.length }})
        </el-button>
        <el-button v-if="state.isRunning.value" type="danger" @click="actions.cancelRunningTests()">
          取消测试
        </el-button>
      </div>

      <div class="api-list">
        <el-divider>API 列表</el-divider>
        <el-table :data="state.currentTestCase.value.apis" border style="width: 100%">
          <el-table-column
            v-for="column in apiTableColumns"
            :key="column.label"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :fixed="column.fixed"
          >
            <!-- 请求方法列 -->
            <template v-if="column.slot === 'method'" #default="scope">
              <el-tag :type="actions.getMethodType(scope.row.method)">{{
                scope.row.method
              }}</el-tag>
            </template>

            <!-- 测试状态列 -->
            <template v-else-if="column.slot === 'status'" #default="scope">
              <el-tag
                v-if="scope.row.status"
                :type="scope.row.status === 'success' ? 'success' : 'danger'"
              >
                {{ scope.row.status === 'success' ? '通过' : '失败' }}
              </el-tag>
              <span v-else>未测试</span>
            </template>

            <!-- 操作列 -->
            <template v-else-if="column.slot === 'actions'" #default="scope">
              <div style="display: flex; gap: 0px">
                <el-button
                  v-if="scope.row.status"
                  size="small"
                  type="info"
                  @click="showTestResult(scope.row.id)"
                >
                  <el-icon><View /></el-icon>
                  查看结果
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  style="margin-left: 4px"
                  @click="goToApi(scope.row.id)"
                >
                  查看用例
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiTableColumns } from '../config/tableConfig'
import { useApiClientStore } from '../stores/apiClient'
import { storeToRefs } from 'pinia'

const router = useRouter()
const store = useApiClientStore()
const { currentTestCase, isRunning, selectedTestResult, resultDialogVisible, currentTestCaseId } =
  storeToRefs(store)
const route = useRoute()

onMounted(() => {
  const caseId = route.params.caseId as string | undefined
  if (caseId) {
    currentTestCaseId.value = caseId
  }
})

watch(
  () => route.params.caseId,
  (caseId) => {
    if (caseId) {
      currentTestCaseId.value = caseId as string
    }
  }
)

const showTestResult = (apiId: string) => {
  if (!currentTestCase.value) return
  const api = currentTestCase.value.apis.find((a: any) => a.id === apiId)
  if (api && api.status) {
    selectedTestResult.value = api
    resultDialogVisible.value = true
  }
}

const goToApi = (apiId: string) => {
  const caseId = currentTestCaseId.value
  if (!caseId) return
  router.push({ name: 'api', params: { caseId, apiId } })
}

// 兼容原模板引用
const actions = {
  runAllTests: store.runAllTests,
  getMethodType: store.getMethodType,
  cancelRunningTests: store.cancelRunningTests
}

const state = {
  currentTestCase,
  isRunning,
  selectedTestResult,
  resultDialogVisible,
  currentTestCaseId
}
</script>

<style scoped lang="less">
.all-tests-view {
  height: 100%;

  .test-case-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, var(--bg-color), var(--bg-color-light));
    border-radius: var(--border-radius-base);
    margin-bottom: var(--spacing-lg);
    border: 1px solid var(--border-color-extra-light);
    box-shadow: var(--box-shadow-base);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(
        90deg,
        var(--primary-color),
        var(--primary-light),
        var(--primary-color)
      );
      background-size: 200% 100%;
      animation: shimmer 3s ease-in-out infinite;
    }
    .test-case-name {
      width: 500px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .test-case-description {
      width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      float: right;
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: var(--text-color-primary);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      &::before {
        content: '🚀';
        font-size: 28px;
      }
    }
  }

  .test-case-actions {
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(135deg, var(--bg-color-light), var(--bg-color));
    border-radius: var(--border-radius-base);
    margin-bottom: var(--spacing-lg);
    border: 1px solid var(--border-color-extra-light);
    box-shadow: var(--box-shadow-base);

    .actions-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .status-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
        color: var(--text-color-regular);

        .status-icon {
          width: 12px;
          height: 12px;
          border-radius: var(--border-radius-circle);
          background: var(--success-color);
          animation: pulse 2s infinite;

          &.running {
            background: var(--warning-color);
          }

          &.error {
            background: var(--danger-color);
          }
        }
      }
    }

    .actions-right {
      display: flex;
      gap: var(--spacing-sm);

      .el-button {
        border-radius: var(--border-radius-round);
        font-weight: 600;
        padding: 12px 24px;
        transition: all 0.3s ease;

        &.el-button--primary {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
          border: none;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
          }
        }

        &.el-button--danger {
          background: linear-gradient(135deg, var(--danger-color), #f78989);
          border: none;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(245, 108, 108, 0.3);
          }
        }

        &.el-button--success {
          background: linear-gradient(135deg, var(--success-color), #85ce61);
          border: none;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(103, 194, 58, 0.3);
          }
        }

        &:disabled {
          opacity: 0.6;
          transform: none !important;
          box-shadow: none !important;
        }
      }
    }
  }

  .api-list {
    height: calc(100vh - 362px);
    background: var(--bg-color);
    border-radius: var(--border-radius-base);
    border: 1px solid var(--border-color-extra-light);
    box-shadow: var(--box-shadow-light);
    overflow-y: scroll;

    .el-table {
      border-radius: var(--border-radius-base);

      .el-table__header-wrapper {
        background: linear-gradient(135deg, var(--bg-color-light), var(--bg-color));

        .el-table__header {
          th {
            background: transparent;
            color: var(--text-color-primary);
            font-weight: 700;
            font-size: 14px;
            border-bottom: 2px solid var(--border-color-light);
            padding: var(--spacing-md) var(--spacing-sm);

            .cell {
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);

              &::before {
                content: '';
                width: 4px;
                height: 4px;
                border-radius: var(--border-radius-circle);
                background: var(--primary-color);
              }
            }
          }
        }
      }

      .el-table__body-wrapper {
        .el-table__body {
          tr {
            transition: all 0.3s ease;

            &:hover {
              background: linear-gradient(135deg, var(--bg-color-hover), var(--bg-color-light));
              transform: scale(1.01);
              box-shadow: var(--box-shadow-base);
            }

            td {
              border-bottom: 1px solid var(--border-color-extra-light);
              padding: var(--spacing-md) var(--spacing-sm);

              .cell {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);

                .method-tag {
                  padding: 4px 8px;
                  border-radius: var(--border-radius-round);
                  font-size: 12px;
                  font-weight: 600;
                  color: white;
                  min-width: 50px;
                  text-align: center;

                  &.GET {
                    background: linear-gradient(135deg, var(--success-color), #85ce61);
                  }

                  &.POST {
                    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
                  }

                  &.PUT {
                    background: linear-gradient(135deg, var(--warning-color), #ebb563);
                  }

                  &.DELETE {
                    background: linear-gradient(135deg, var(--danger-color), #f78989);
                  }

                  &.PATCH {
                    background: linear-gradient(135deg, var(--info-color), #b3b3b3);
                  }
                }

                .api-name {
                  font-weight: 600;
                  color: var(--text-color-primary);
                  flex: 1;
                }

                .api-url {
                  color: var(--text-color-secondary);
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                  font-size: 13px;
                  background: var(--bg-color-light);
                  padding: 2px 8px;
                  border-radius: var(--border-radius-small);
                }

                .status-indicator {
                  width: 12px;
                  height: 12px;
                  border-radius: var(--border-radius-circle);

                  &.success {
                    background: var(--success-color);
                    box-shadow: 0 0 8px rgba(103, 194, 58, 0.4);
                  }

                  &.error {
                    background: var(--danger-color);
                    box-shadow: 0 0 8px rgba(245, 108, 108, 0.4);
                  }

                  &.testing {
                    background: var(--warning-color);
                    animation: pulse 1.5s infinite;
                    box-shadow: 0 0 8px rgba(230, 162, 60, 0.4);
                  }

                  &.pending {
                    background: var(--border-color);
                  }
                }

                .el-button {
                  border-radius: var(--border-radius-round);
                  font-weight: 500;
                  transition: all 0.3s ease;

                  &:hover {
                    transform: scale(1.05);
                  }

                  &.el-button--primary {
                    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
                    border: none;
                  }

                  &.el-button--success {
                    background: linear-gradient(135deg, var(--success-color), #85ce61);
                    border: none;
                  }

                  &.el-button--info {
                    background: linear-gradient(135deg, var(--info-color), #b3b3b3);
                    border: none;
                  }
                }
              }
            }
          }
        }
      }

      .el-table__empty-block {
        background: radial-gradient(circle at center, var(--bg-color-light), var(--bg-color));

        .el-table__empty-text {
          color: var(--text-color-secondary);
          font-size: 16px;
          font-weight: 500;

          &::before {
            content: '📋';
            font-size: 48px;
            display: block;
            margin-bottom: var(--spacing-md);
            opacity: 0.6;
            animation: float 3s ease-in-out infinite;
          }
        }
      }
    }
  }
}

/* 对话框样式 */
.el-dialog {
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-light);

  .el-dialog__header {
    background: linear-gradient(135deg, var(--bg-color-light), var(--bg-color));
    border-bottom: 1px solid var(--border-color-extra-light);
    border-radius: var(--border-radius-base) var(--border-radius-base) 0 0;

    .el-dialog__title {
      font-weight: 700;
      color: var(--text-color-primary);
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      &::before {
        content: '📊';
        font-size: 20px;
      }
    }
  }

  .el-dialog__body {
    padding: var(--spacing-lg);
    background: var(--bg-color);

    .result-section {
      margin-bottom: var(--spacing-lg);

      h4 {
        margin: 0 0 var(--spacing-md) 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color-primary);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        &::before {
          content: '🔍';
          font-size: 18px;
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

  .el-dialog__footer {
    background: var(--bg-color-light);
    border-top: 1px solid var(--border-color-extra-light);
    border-radius: 0 0 var(--border-radius-base) var(--border-radius-base);
    padding: var(--spacing-md) var(--spacing-lg);

    .el-button {
      border-radius: var(--border-radius-round);
      font-weight: 500;
      padding: 10px 20px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: var(--box-shadow-base);
      }

      &.el-button--primary {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
        border: none;
      }
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
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
  .all-tests-view {
    .test-case-actions {
      flex-direction: column;
      height: auto;
      gap: var(--spacing-md);

      .actions-left,
      .actions-right {
        width: 100%;
        justify-content: center;
      }
    }

    .api-list {
      height: calc(100% - 220px);
    }
  }
}

@media (max-width: 768px) {
  .all-tests-view {
    padding: var(--spacing-md);

    .test-case-header {
      height: auto;
      flex-direction: column;
      gap: var(--spacing-md);

      h2 {
        font-size: 20px;
      }
    }

    .test-case-actions {
      .actions-right {
        flex-wrap: wrap;
        gap: var(--spacing-xs);

        .el-button {
          padding: 8px 16px;
          font-size: 14px;
        }
      }
    }

    .api-list {
      .el-table {
        .cell {
          .api-url {
            display: none;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .all-tests-view {
    padding: var(--spacing-sm);

    .test-case-header {
      padding: var(--spacing-md);

      h2 {
        font-size: 18px;
      }
    }

    .test-case-actions {
      padding: var(--spacing-sm);

      .actions-right .el-button {
        padding: 6px 12px;
        font-size: 12px;
      }
    }

    .api-list {
      .el-table {
        font-size: 12px;

        .cell {
          .method-tag {
            font-size: 10px;
            padding: 2px 6px;
            min-width: 40px;
          }

          .api-name {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
