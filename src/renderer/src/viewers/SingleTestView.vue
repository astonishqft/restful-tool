<template>
  <div v-if="state?.currentApi?.value" class="single-api-details">
    <div class="test-case-header">
      <div class="test-case-title">
        <div class="test-case-name" :title="state.currentApi.value.name">
          {{ state.currentApi.value.name }}-接口测试
        </div>
        <el-tag
          v-if="state.isRunning.value || state.currentApi.value.status === 'testing'"
          type="warning"
        >
          测试中
        </el-tag>
        <el-tag
          v-else-if="state.currentApi.value.status"
          :type="state.currentApi.value.status === 'success' ? 'success' : 'danger'"
          style="margin-left: 8px"
        >
          {{ state.currentApi.value.status === 'success' ? '通过' : '失败' }}
        </el-tag>
        <span v-else style="margin-left: 8px; font-size: 14px; color: #909399">未测试</span>
      </div>
      <div class="test-case-button-group">
        <el-button type="primary" @click="goBack">
          <el-icon><Back /></el-icon>
          返回批量测试
        </el-button>
        <el-button
          type="primary"
          :loading="state.isRunning.value"
          @click="runSingleTest(state.currentApi.value.id)"
        >
          <el-icon><Refresh /></el-icon>
          测试接口
        </el-button>
        <el-button
          v-if="state.currentApi.value.status"
          type="info"
          @click="showTestResult(state.currentApi.value.id)"
        >
          <el-icon><View /></el-icon>
          查看结果
        </el-button>
      </div>
    </div>

    <div class="api-detail-card">
      <div class="api-details">
        <div class="api-detail-title">请求详情</div>
        <el-table :data="detailsRows" border style="width: 100%">
          <el-table-column prop="label" label="字段" width="160" />
          <el-table-column label="值">
            <template #default="{ row }">
              <el-tag
                v-if="row.key === 'method'"
                :type="store.getMethodType(getDetailsDisplay(row.key))"
              >
                {{ getDetailsDisplay(row.key) }}
              </el-tag>
              <span v-else class="cell-text">{{ getDetailsDisplay(row.key) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="openEditDetails(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="api-details">
        <div class="api-detail-title">请求头</div>
        <el-table :data="headerRows" border style="width: 100%">
          <el-table-column prop="key" label="Key" width="220">
            <template #default="{ row }">
              <span class="cell-text">{{ row.key }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="Value">
            <template #default="{ row }">
              <span class="cell-text">{{ row.value }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ $index }">
              <el-button type="primary" size="small" @click="openEditHeader($index)"
                >编辑</el-button
              >
              <el-button
                type="danger"
                size="small"
                style="margin-left: 8px"
                @click="removeHeader($index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <div class="kv-actions">
          <el-button type="primary" size="small" @click="addHeader">新增Header</el-button>
        </div>
      </div>

      <div class="api-details">
        <div class="api-detail-title">请求参数 params</div>
        <el-table :data="paramRows" border style="width: 100%">
          <el-table-column prop="key" label="Param Key" width="220">
            <template #default="{ row }">
              <span class="cell-text">{{ row.key }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="Param Value">
            <template #default="{ row }">
              <span class="cell-text">{{ row.value }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ $index }">
              <el-button type="primary" size="small" @click="openEditParam($index)">编辑</el-button>
              <el-button
                type="danger"
                size="small"
                style="margin-left: 8px"
                @click="removeParam($index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <div class="kv-actions">
          <el-button type="primary" size="small" @click="addParam">新增Param</el-button>
        </div>
      </div>

      <div v-if="state.currentApi.value.method !== 'GET'" class="api-details">
        <div class="api-detail-title">请求体 body (JSON)</div>
        <el-input v-model="bodyInput" type="textarea" :rows="8" placeholder="请输入JSON字符串" />
        <div class="kv-actions">
          <el-button type="primary" size="small" @click="applyBody">保存请求体</el-button>
        </div>
      </div>

      <el-dialog v-model="editDialogVisible" :title="editDialogTitle" width="520px">
        <div v-if="editMode === 'details'">
          <template v-if="editingFieldKey === 'method'">
            <el-select v-model="editingValue" placeholder="选择方法" style="width: 180px">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
              <el-option label="PATCH" value="PATCH" />
            </el-select>
          </template>
          <template v-else-if="editingFieldKey === 'expectedExpression'">
            <el-input
              v-model="editingValue"
              type="textarea"
              :rows="4"
              placeholder="status === 200 && data.success === true"
            />
          </template>
          <template v-else>
            <el-input v-model="editingValue" />
          </template>
        </div>
        <div v-else-if="editMode === 'header'">
          <div class="kv-row">
            <el-input
              v-model="editingKey"
              placeholder="Header Key"
              style="width: 200px; margin-right: 8px"
            />
            <el-input v-model="editingValue" placeholder="Header Value" />
          </div>
        </div>
        <div v-else-if="editMode === 'param'">
          <div class="kv-row">
            <el-input
              v-model="editingKey"
              placeholder="Param Key"
              style="width: 200px; margin-right: 8px"
            />
            <el-input v-model="editingValue" placeholder="Param Value" />
          </div>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmEdit">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
  <div v-else class="no-selection">
    <el-empty description="请选择或导入测试用例"></el-empty>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiClientStore } from '../stores/apiClient'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

const store = useApiClientStore()
const {
  currentTestCase,
  currentApi,
  isRunning,
  selectedTestResult,
  resultDialogVisible,
  currentTestCaseId
} = storeToRefs(store)
const route = useRoute()
const router = useRouter()

onMounted(() => {
  const caseId = route.params.caseId as string | undefined
  const apiId = route.params.apiId as string | undefined
  if (caseId) {
    currentTestCaseId.value = caseId
  }
  if (apiId && currentTestCase.value) {
    const api = currentTestCase.value.apis.find((a: any) => a.id === apiId)
    if (api) currentApi.value = api
  }
})

watch(
  () => route.params.apiId,
  (apiId) => {
    if (!apiId || !currentTestCase.value) return
    const api = currentTestCase.value.apis.find((a: any) => a.id === (apiId as string))
    if (api) currentApi.value = api
  }
)

const goBack = () => {
  const caseId = route.params.caseId as string
  router.push({ name: 'case', params: { caseId } })
}

const runSingleTest = async (apiId: string) => {
  if (!currentTestCase.value) return
  const api = currentTestCase.value.apis.find((a: any) => a.id === apiId)
  if (!api) return
  // 先清理旧状态
  api.response = undefined
  api.request = undefined
  // 使用 isRunning 控制“测试中”显示，不修改 status 为 'testing'
  isRunning.value = true
  try {
    const result = await store.runApiTest(api)
    Object.assign(api, result)
    store.saveTestCases()
  } catch (error) {
    console.error(error)
  } finally {
    isRunning.value = false
  }
}

const showTestResult = (apiId: string) => {
  if (!currentTestCase.value) return
  const api = currentTestCase.value.apis.find((a: any) => a.id === apiId)
  if (api && api.status) {
    selectedTestResult.value = api
    resultDialogVisible.value = true
  }
}

const state = {
  currentApi,
  isRunning,
  currentTestCase,
  selectedTestResult,
  resultDialogVisible
}

// 可编辑字段的本地行数据
const detailsRows = [
  { key: 'method', label: '请求方法' },
  { key: 'url', label: 'URL' },
  { key: 'expectedExpression', label: '预期表达式' }
]
const headerRows = ref<Array<{ key: string; value: string }>>([])
const paramRows = ref<Array<{ key: string; value: string }>>([])
const bodyInput = ref<string>('')

// 编辑弹窗状态
const editDialogVisible = ref(false)
const editMode = ref<'details' | 'header' | 'param'>('details')
const editingFieldKey = ref<string>('')
const editingFieldLabel = ref<string>('')
const editingIndex = ref<number>(-1)
const editingKey = ref<string>('')
const editingValue = ref<string>('')
const editingNumber = ref<number | null>(null)

const editDialogTitle = computed(() => {
  if (editMode.value === 'details') return `编辑：${editingFieldLabel.value}`
  if (editMode.value === 'header') return '编辑请求头'
  if (editMode.value === 'param') return '编辑请求参数'
  return '编辑'
})

const getDetailsDisplay = (key: string) => {
  if (!currentApi.value) return ''
  switch (key) {
    case 'name':
      return currentApi.value.name ?? ''
    case 'method':
      return currentApi.value.method ?? ''
    case 'url':
      return currentApi.value.url ?? ''
    case 'expectedExpression':
      return currentApi.value.expectedExpression ?? ''
    default:
      return ''
  }
}

const openEditDetails = (row: { key: string; label: string }) => {
  editMode.value = 'details'
  editingFieldKey.value = row.key
  editingFieldLabel.value = row.label
  if (!currentApi.value) return
  editingNumber.value = null
  editingValue.value = String((currentApi.value as any)[row.key] ?? '')
  editDialogVisible.value = true
}

const openEditHeader = (index: number) => {
  editMode.value = 'header'
  editingIndex.value = index
  const row = headerRows.value[index]
  editingKey.value = row?.key ?? ''
  editingValue.value = row?.value ?? ''
  editDialogVisible.value = true
}

const openEditParam = (index: number) => {
  editMode.value = 'param'
  editingIndex.value = index
  const row = paramRows.value[index]
  editingKey.value = row?.key ?? ''
  editingValue.value = row?.value ?? ''
  editDialogVisible.value = true
}

const confirmEdit = () => {
  if (editMode.value === 'details') {
    if (!currentApi.value) return
    const key = editingFieldKey.value
    ;(currentApi.value as any)[key] = editingValue.value
  } else if (editMode.value === 'header') {
    if (editingIndex.value >= 0) {
      headerRows.value[editingIndex.value] = { key: editingKey.value, value: editingValue.value }
    } else {
      headerRows.value.push({ key: editingKey.value, value: editingValue.value })
    }
    applyHeaders()
  } else if (editMode.value === 'param') {
    if (editingIndex.value >= 0) {
      paramRows.value[editingIndex.value] = { key: editingKey.value, value: editingValue.value }
    } else {
      paramRows.value.push({ key: editingKey.value, value: editingValue.value })
    }
    applyParams()
  }
  editDialogVisible.value = false
}
const initEditableRows = () => {
  if (!currentApi.value) return
  const headersObj = currentApi.value.headers || {}
  headerRows.value = Object.entries(headersObj).map(([k, v]) => ({ key: k, value: String(v) }))
  const paramsObj = currentApi.value.params || {}
  paramRows.value = Object.entries(paramsObj).map(([k, v]) => ({
    key: k,
    value: Array.isArray(v) ? v.join(',') : String(v)
  }))
  const bodyVal = currentApi.value.body
  bodyInput.value = typeof bodyVal === 'string' ? bodyVal : JSON.stringify(bodyVal ?? {}, null, 2)
}

onMounted(() => {
  initEditableRows()
})

watch(currentApi, () => {
  initEditableRows()
})

const addHeader = () => {
  editMode.value = 'header'
  editingIndex.value = -1
  editingKey.value = ''
  editingValue.value = ''
  editDialogVisible.value = true
}
const removeHeader = (idx: number) => headerRows.value.splice(idx, 1)
const applyHeaders = () => {
  const obj: Record<string, string> = {}
  for (const row of headerRows.value) {
    if (row.key) obj[row.key] = row.value
  }
  if (!currentApi.value) return
  currentApi.value.headers = obj
}

const addParam = () => {
  editMode.value = 'param'
  editingIndex.value = -1
  editingKey.value = ''
  editingValue.value = ''
  editDialogVisible.value = true
}
const removeParam = (idx: number) => paramRows.value.splice(idx, 1)
const parseParamValue = (val: string): any => {
  const s = String(val).trim()
  if (s.includes(',')) {
    return s.split(',').map((v) => v.trim())
  }
  if (/^(true|false)$/i.test(s)) return /^true$/i.test(s)
  if (!isNaN(Number(s))) return Number(s)
  return s
}
const applyParams = () => {
  const obj: Record<string, any> = {}
  for (const row of paramRows.value) {
    if (row.key) obj[row.key] = parseParamValue(row.value)
  }
  if (!currentApi.value) return
  currentApi.value.params = obj
}

const applyBody = () => {
  if (!currentApi.value) return
  const txt = bodyInput.value
  try {
    const parsed = JSON.parse(txt)
    currentApi.value.body = parsed
    ElMessage.success('请求体保存成功！')
  } catch {
    ElMessage.error('JSON 解析失败，请重新输入！')
  }
}
</script>

<style scoped lang="less">
.test-case-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

  .test-case-title {
    height: auto;
    display: flex;
    align-items: center;
    font-size: 24px;
    color: var(--text-color-primary);
    font-weight: 700;
    gap: var(--spacing-sm);

    &::before {
      content: '🎯';
      font-size: 28px;
    }
    .test-case-name {
      width: 380px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .el-tag {
      margin-left: var(--spacing-sm);
      border-radius: var(--border-radius-round);
      font-weight: 600;
      font-size: 12px;
      padding: 4px 12px;
      border: none;

      &.el-tag--success {
        background: linear-gradient(135deg, var(--success-color), #85ce61);
        color: white;
      }

      &.el-tag--danger {
        background: linear-gradient(135deg, var(--danger-color), #f78989);
        color: white;
      }

      &.el-tag--warning {
        background: linear-gradient(135deg, var(--warning-color), #ebb563);
        color: white;
      }
    }
  }

  .el-button {
    border-radius: var(--border-radius-round);
    font-weight: 600;
    padding: 12px 8px;
    transition: all 0.3s ease;

    &.el-button--primary {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      border: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
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
  }
}

.api-details {
  .api-detail-title {
    height: 50px;
    display: flex;
    align-items: center;
    font-size: 18px;
    color: var(--text-color-primary);
    font-weight: 700;
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-md);
    background: linear-gradient(135deg, var(--bg-color-light), var(--bg-color));
    border-radius: var(--border-radius-base);
    border-left: 4px solid var(--primary-color);
    box-shadow: var(--box-shadow-base);
    gap: var(--spacing-sm);

    &::before {
      content: '⚙️';
      font-size: 20px;
    }
  }
}

.api-detail-card {
  height: calc(100vh - 210px);
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-light);
  overflow-y: auto;
  background: var(--bg-color);
  border: 1px solid var(--border-color-extra-light);

  .el-card {
    margin-bottom: var(--spacing-md);
    border-radius: var(--border-radius-base);
    border: 1px solid var(--border-color-extra-light);
    box-shadow: var(--box-shadow-base);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: var(--box-shadow-light);
      transform: translateY(-2px);
    }

    .el-card__header {
      background: linear-gradient(135deg, var(--bg-color-light), var(--bg-color));
      border-bottom: 1px solid var(--border-color-extra-light);
      padding: var(--spacing-md) var(--spacing-lg);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        color: var(--text-color-primary);
        font-size: 16px;

        .el-button {
          border-radius: var(--border-radius-round);
          font-weight: 500;
          transition: all 0.3s ease;

          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }

    .el-card__body {
      padding: var(--spacing-lg);
    }
  }

  .el-form-item {
    margin-bottom: var(--spacing-md);

    .el-form-item__label {
      font-weight: 600;
      color: var(--text-color-primary);
    }

    .el-input,
    .el-select,
    .el-input-number {
      .el-input__wrapper {
        border-radius: var(--border-radius-base);
        border: 1px solid var(--border-color-light);
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--primary-light);
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
        }

        &.is-focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
    }

    .el-textarea {
      .el-textarea__inner {
        border-radius: var(--border-radius-base);
        border: 1px solid var(--border-color-light);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--primary-light);
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
        }

        &:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
    }
  }

  .el-table {
    border-radius: var(--border-radius-base);
    overflow: hidden;

    .el-table__header {
      background: var(--bg-color-light);

      th {
        background: var(--bg-color-light);
        color: var(--text-color-primary);
        font-weight: 600;
        border-bottom: 2px solid var(--border-color-light);
      }
    }

    .el-table__body {
      tr {
        transition: all 0.3s ease;

        &:hover {
          background: var(--bg-color-hover);
        }

        td {
          border-bottom: 1px solid var(--border-color-extra-light);
        }
      }
    }
  }
}

.kv-row {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-color-light);
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-color-extra-light);
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-color-hover);
    box-shadow: var(--box-shadow-base);
  }

  .el-input {
    margin-right: var(--spacing-sm);

    .el-input__wrapper {
      border-radius: var(--border-radius-base);
    }
  }

  .el-button {
    border-radius: var(--border-radius-circle);
    width: 32px;
    height: 32px;
    padding: 0;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }

    &.el-button--danger {
      background: linear-gradient(135deg, var(--danger-color), #f78989);
      border: none;
      color: white;
    }
  }
}

.kv-actions {
  margin-top: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);

  .el-button {
    border-radius: var(--border-radius-round);
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--box-shadow-base);
    }

    &.el-button--primary {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      border: none;
    }

    &.el-button--success {
      background: linear-gradient(135deg, var(--success-color), #85ce61);
      border: none;
    }
  }
}

.dialog-footer {
  display: inline-flex;
  gap: var(--spacing-sm);

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

/* 对话框样式 */
.el-dialog {
  border-radius: var(--border-radius-base);
  box-shadow: var(--box-shadow-light);

  .el-dialog__header {
    background: linear-gradient(135deg, var(--bg-color-light), var(--bg-color));
    border-bottom: 1px solid var(--border-color-extra-light);
    border-radius: var(--border-radius-base) var(--border-radius-base) 0 0;

    .el-dialog__title {
      font-weight: 600;
      color: var(--text-color-primary);
    }
  }

  .el-dialog__body {
    padding: var(--spacing-lg);
  }

  .el-dialog__footer {
    background: var(--bg-color-light);
    border-top: 1px solid var(--border-color-extra-light);
    border-radius: 0 0 var(--border-radius-base) var(--border-radius-base);
    padding: var(--spacing-md) var(--spacing-lg);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .test-case-header {
    height: auto;
    flex-direction: column;
    gap: var(--spacing-md);

    .test-case-title {
      font-size: 20px;
    }
  }

  .api-detail-card {
    height: calc(100vh - 250px);
  }

  .kv-row {
    flex-direction: column;
    gap: var(--spacing-sm);

    .el-input {
      margin-right: 0;
      width: 100%;
    }
  }
}

@media (max-width: 480px) {
  .test-case-header {
    padding: var(--spacing-md);

    .test-case-title {
      font-size: 18px;
    }
  }

  .api-details .api-detail-title {
    font-size: 16px;
    padding: var(--spacing-sm);
  }

  .api-detail-card .el-card .el-card__body {
    padding: var(--spacing-md);
  }
}
</style>
