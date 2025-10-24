export interface TableColumnConfig {
  prop?: string
  label: string
  width?: string | number
  fixed?: string
  slot?: string
  formatter?: (row: any) => string
}

export const apiTableColumns: TableColumnConfig[] = [
  {
    prop: 'name',
    label: '接口名称',
    width: 180
  },
  {
    prop: 'url',
    label: '请求地址',
    width: 300
  },
  {
    prop: 'method',
    label: '请求方法',
    width: 100,
    slot: 'method'
  },
  {
    prop: 'status',
    label: '测试状态',
    width: 90,
    slot: 'status'
  },
  {
    label: '操作',
    // width: 150,
    fixed: 'right',
    slot: 'actions'
  }
]
