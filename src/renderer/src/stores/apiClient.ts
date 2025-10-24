import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

export interface ApiTest {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | string[] | number[] | boolean[]>
  body?: Record<string, any> | string | number | boolean | null | Array<any>
  expectedExpression: string
  status?: 'success' | 'fail'
  response?: any
  request?: any
}

export interface TestCase {
  id: string
  name: string
  description?: string
  apis: ApiTest[]
}

export const useApiClientStore = defineStore('apiClient', () => {
  const fileInputEl = ref<HTMLInputElement | null>(null)

  // 保存所有的测试用例
  const testCases = ref<TestCase[]>([])
  const currentTestCaseId = ref<string>('')
  const currentApi = ref<any>(null)
  const isRunning = ref<boolean>(false)
  const resultDialogVisible = ref<boolean>(false)
  const selectedTestResult = ref<ApiTest | null>(null)
  const editCaseDialogVisible = ref<boolean>(false)
  const editCaseName = ref<string>('')
  const editCaseDescription = ref<string>('')
  const editingCaseId = ref<string>('')
  const currentAbortController = ref<AbortController | null>(null)

  const currentTestCase = computed(() => {
    return testCases.value.find((tc) => tc.id === currentTestCaseId.value) || null
  })

  // 初始化
  const initFromStorage = () => {
    const savedTestCases = localStorage.getItem('apiTestCases')
    if (savedTestCases) {
      try {
        testCases.value = JSON.parse(savedTestCases)
      } catch (e) {
        console.error('Failed to parse saved test cases:', e)
      }
    }
  }

  const setFileInput = (el: HTMLInputElement | null) => {
    fileInputEl.value = el
  }

  // 持久化
  const saveTestCases = () => {
    localStorage.setItem('apiTestCases', JSON.stringify(testCases.value))
  }

  // 导入文件
  const importFile = () => {
    fileInputEl.value?.click()
  }

  const handleFileImport = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    try {
      const content = await readFileContent(file)
      const testCaseData = parseFileContent(content)

      const existingIndex = testCases.value.findIndex((tc) => tc.id === testCaseData.id)
      let isUpdate = false

      if (existingIndex !== -1) {
        testCases.value[existingIndex] = testCaseData
        isUpdate = true
      } else {
        testCaseData.id = Date.now().toString()
        testCases.value.push(testCaseData)
      }

      saveTestCases()
      currentTestCaseId.value = testCaseData.id
      ElMessage.success(isUpdate ? '测试用例已更新' : '测试文件导入成功')
    } catch (error) {
      ElMessage.error(`导入失败: ${error instanceof Error ? error.message : String(error)}`)
    }

    // 清空输入框
    if (target) target.value = ''
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  const parseFileContent = (content: string): TestCase => {
    try {
      const parsed = JSON.parse(content)

      if (!parsed.name || !parsed.apis || !Array.isArray(parsed.apis)) {
        ElMessage.error('文件格式不正确，缺少必要字段')
        throw new Error('文件格式不正确，缺少必要字段')
      }

      parsed.apis.forEach((api: any, index: number) => {
        if (!api.url) {
          throw new Error(`API #${index + 1}: 缺少必要字段 'url'`)
        }
        if (
          !api.method ||
          !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(api.method.toUpperCase())
        ) {
          throw new Error(`API #${index + 1}: 缺少或无效的 'method' 字段`)
        }

        if (api.method) api.method = api.method.toUpperCase()
        if (!api.id) api.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      })

      return parsed
    } catch (jsonError) {
      if (jsonError instanceof Error) throw jsonError
      throw new Error('仅支持JSON格式的测试文件')
    }
  }

  const handleCommand = (command: string, data: any) => {
    switch (command) {
      case 'delete':
        deleteTestCase(data.id)
        break
      case 'refresh':
        if (data.apis && data.apis.length > 0) {
          runAllTests()
        } else {
          ElMessage.warning('该测试用例没有API可测试')
        }
        break
      case 'batchTest':
        if (data.apis && data.apis.length > 0) {
          runAllTests()
          ElMessage.info(`开始批量测试 ${data.apis.length} 个接口`)
        } else {
          ElMessage.warning('该测试用例没有API可测试')
        }
        break
      case 'editTestCase':
        openEditTestCase(data)
        break
      case 'exportTestCase':
        exportTestResults(data.id)
        break
      default:
        break
    }
  }

  const exportTestResults = (testCaseId: string) => {
    const testCase = testCases.value.find((tc) => tc.id === testCaseId)
    if (!testCase) {
      ElMessage.error('测试用例不存在')
      return
    }

    const exportData = {
      name: testCase.name,
      description: testCase.description,
      apis: testCase.apis.map((api) => {
        const item: Record<string, any> = {
          name: api.name,
          url: api.url,
          method: api.method
        }

        if (api.headers && Object.keys(api.headers).length > 0) {
          item.headers = api.headers
        }

        if (api.params && Object.keys(api.params).length > 0) {
          item.params = api.params
        }

        if (api.body !== undefined && api.body !== null) {
          if (typeof api.body === 'object') {
            if (Array.isArray(api.body)) {
              if (api.body.length > 0) item.body = api.body
            } else {
              if (Object.keys(api.body).length > 0) item.body = api.body
            }
          } else if (typeof api.body === 'string') {
            if (api.body.trim() !== '') item.body = api.body
          } else {
            item.body = api.body
          }
        }

        if (typeof api.expectedExpression === 'string') {
          if (api.expectedExpression.trim() !== '') item.expectedExpression = api.expectedExpression
        } else if (api.expectedExpression !== undefined && api.expectedExpression !== null) {
          item.expectedExpression = api.expectedExpression
        }

        return item
      })
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${testCase.name}_测试用例_${new Date()
      .toISOString()
      .slice(0, 10)}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()

    ElMessage.success('测试用例已导出')
  }

  // 打开编辑测试用例弹窗并填充初始值
  const openEditTestCase = (data?: any) => {
    const id = data?.id || currentTestCaseId.value
    if (!id) {
      ElMessage.warning('未选择测试用例')
      return
    }
    const tc = testCases.value.find((t) => t.id === id)
    if (!tc) {
      ElMessage.error('测试用例不存在')
      return
    }
    editingCaseId.value = id
    editCaseName.value = tc.name || ''
    editCaseDescription.value = tc.description || ''
    editCaseDialogVisible.value = true
  }

  // 确认编辑并保存测试用例的名称和描述
  const confirmEditCase = () => {
    const id = editingCaseId.value || currentTestCaseId.value
    if (!id) {
      ElMessage.warning('未选择测试用例')
      return
    }
    const index = testCases.value.findIndex((t) => t.id === id)
    if (index === -1) {
      ElMessage.error('测试用例不存在')
      return
    }
    const name = editCaseName.value.trim()
    if (!name) {
      ElMessage.warning('名称不能为空')
      return
    }
    const updated = { ...testCases.value[index] }
    updated.name = name
    updated.description = editCaseDescription.value.trim()
    testCases.value[index] = updated
    saveTestCases()
    editCaseDialogVisible.value = false
    ElMessage.success('测试用例已更新')
  }

  const deleteTestCase = async (testCaseId: string) => {
    try {
      await ElMessageBox.confirm('确定要删除这个测试用例吗？此操作不可恢复。', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const index = testCases.value.findIndex((tc) => tc.id === testCaseId)
      if (index !== -1) {
        testCases.value.splice(index, 1)
        saveTestCases()
        if (currentTestCaseId.value === testCaseId) currentTestCaseId.value = ''
        ElMessage.success('测试用例删除成功')
      }
    } catch (error) {
      console.error('删除测试用例时出错:', error)
      // ElMessage.error('删除测试用例失败')
    }
  }

  const getMethodType = (method: string) => {
    const methodMap: Record<string, any> = {
      GET: 'success',
      POST: 'primary',
      PUT: 'warning',
      DELETE: 'danger',
      PATCH: 'info'
    }
    return methodMap[method] || 'default'
  }

  const runAllTests = async () => {
    if (!currentTestCase.value || currentTestCase.value.apis.length === 0) return

    isRunning.value = true

    try {
      ElMessageBox.confirm(
        `确定要运行当前测试用例的所有 ${currentTestCase.value.apis.length} 个API测试吗？`,
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async () => {
          const controller = new AbortController()
          currentAbortController.value = controller

          // 清空之前的测试结果状态
          if (currentTestCase.value && Array.isArray(currentTestCase.value.apis)) {
            for (const api of currentTestCase.value.apis) {
              api.status = undefined
              api.response = undefined
              api.request = undefined
            }
          }

          try {
            for (const api of currentTestCase.value!.apis) {
              if (controller.signal.aborted) break
              const result = await runApiTest(api, controller.signal)
              Object.assign(api, result)
              if (controller.signal.aborted) break
            }

            saveTestCases()
            if (controller.signal.aborted) {
              ElMessage.info('已取消测试')
            } else {
              ElMessage.success('所有测试已完成')
            }
          } catch (error) {
            if (controller.signal.aborted) {
              ElMessage.info('已取消测试')
            } else {
              ElMessage.error(
                `测试过程中发生错误: ${error instanceof Error ? error.message : String(error)}`
              )
            }
          } finally {
            currentAbortController.value = null
            isRunning.value = false
          }
        })
        .catch(() => {
          isRunning.value = false
          ElMessage.info('已取消测试')
        })
    } catch (error: any) {
      console.error('运行所有测试失败:', error)
      isRunning.value = false
      ElMessage.error('操作失败')
    }
  }

  const runApiTest = async (api: ApiTest, signal?: AbortSignal): Promise<Partial<ApiTest>> => {
    const toQuery = (obj: any): string => {
      if (!obj || typeof obj !== 'object') return ''
      const params: string[] = []
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`)
        } else if (typeof value === 'object' && value !== null) {
          params.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`)
        } else if (value !== undefined && value !== null) {
          params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        }
      }
      return params.join('&')
    }

    const appendParams = (baseUrl: string, params?: any): string => {
      const qs = toQuery(params)
      if (!qs) return baseUrl
      const hasQuery = baseUrl.includes('?')
      return `${baseUrl}${hasQuery ? '&' : '?'}${qs}`
    }

    const evalBooleanExpression = (
      expr: string,
      context: any
    ): { passed: boolean; error?: string } => {
      try {
        const fn = new Function('$', "'use strict'; return !!(" + expr + ')')
        const result = fn(context)
        return { passed: !!result }
      } catch (e: any) {
        return { passed: false, error: e?.message || String(e) }
      }
    }

    try {
      let finalUrl = appendParams(api.url, api.params)

      let bodyToSend: any = undefined
      if (api.method === 'GET') {
        if (api.body && typeof api.body === 'object') {
          const qsBody = toQuery(api.body)
          if (qsBody) {
            finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}${qsBody}`
          }
        }
      } else if (api.body !== undefined && api.body !== null) {
        bodyToSend = typeof api.body === 'string' ? api.body : JSON.stringify(api.body)
      }

      const res = await axios({
        url: finalUrl,
        method: (api.method || 'GET').toLowerCase() as any,
        headers: api.headers || {},
        data: bodyToSend,
        timeout: 15000,
        signal
      })

      const headersObj: Record<string, any> = res.headers || {}
      const data: any = res.data

      const requestInfo = {
        url: finalUrl,
        method: api.method,
        headers: api.headers || {},
        body: api.method === 'GET' ? undefined : (api.body ?? undefined)
      }

      const expr = (api.expectedExpression || '').trim()
      let finalPass = false
      let validation: any = undefined
      if (expr) {
        const { passed, error } = evalBooleanExpression(expr, {
          status: res.status,
          data,
          headers: headersObj,
          request: requestInfo,
          response: { status: res.status, data, headers: headersObj }
        })
        finalPass = passed
        validation = { expression: expr, passed, error: error || undefined }
      }

      return {
        status: finalPass ? 'success' : 'fail',
        request: requestInfo,
        response: {
          status: res.status,
          data,
          headers: headersObj,
          validation
        }
      }
    } catch (error: any) {
      const msg = (() => {
        const message = error?.message || ''
        const isTimeout =
          error?.code === 'ECONNABORTED' || message.toLowerCase().includes('timeout')
        if (isTimeout) {
          return '请求超时（15秒），请检查网络或接口服务'
        }
        return `请求失败：${message || 'Network Error'}`
      })()
      ElMessage.error(msg)
      return {
        status: 'fail',
        request: {
          url: api.url,
          method: api.method,
          headers: api.headers || {},
          body: api.method === 'GET' ? undefined : (api.body ?? undefined)
        },
        response: {
          status: 0,
          data: {
            message: msg,
            timestamp: new Date().toISOString()
          },
          headers: {
            'X-Error': 'true'
          }
        }
      }
    }
  }

  const cancelRunningTests = () => {
    if (currentAbortController.value) {
      currentAbortController.value.abort()
    }
    isRunning.value = false
  }

  return {
    // state
    fileInputEl,
    testCases,
    currentTestCaseId,
    currentApi,
    isRunning,
    resultDialogVisible,
    selectedTestResult,
    editCaseDialogVisible,
    editCaseName,
    editCaseDescription,
    // getters
    currentTestCase,
    // actions
    initFromStorage,
    setFileInput,
    saveTestCases,
    importFile,
    handleFileImport,
    readFileContent,
    parseFileContent,
    handleCommand,
    exportTestResults,
    deleteTestCase,
    getMethodType,
    runAllTests,
    runApiTest,
    openEditTestCase,
    confirmEditCase,
    cancelRunningTests
  }
})
