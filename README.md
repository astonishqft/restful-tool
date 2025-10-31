# Postman 平替？这款轻量接口测试工具，本地运行 + 批量回归超实用！

日常做接口测试时，你是不是也有过这样的困扰：用 Postman、Apifox 这类工具，功能太多反而找不到重点，想快速做迭代回归测试却步骤繁琐？今天给大家推荐一款「轻量化」的跨平台 RESTful 接口测试工具 ——**restful-api-test**，基于 Electron + Vue3 开发，聚焦核心需求，让我们的接口测试更高效！

## 为什么选它？4 大核心优势直击痛点

市面上接口测试工具不少，但 restful-api-test 偏偏走出了不一样的路线：它砍掉了冗余功能，只保留最实用的核心能力，尤其适合需要快速验证、本地隔离环境测试的场景。

*   **批量执行 + 结果汇总**：一次跑多个接口，结果直观呈现，迭代回归测试效率直接拉满；

<!---->

*   **结构化测试用例**：把接口测试流程沉淀成用例，支持重复运行，还能做版本化管理；

<!---->

*   **灵活断言表达式**：支持自定义 JavaScript 布尔表达式，复杂校验需求也能满足；

<!---->

*   **本地跨平台运行**：无需依赖云端，边缘环境、隔离网络下也能正常使用，数据更安全。

## 界面总览：3 部分布局，上手无门槛

先看整体界面，restful-api-test 的布局非常简洁，主要分为 3 个部分，即使是新手也能快速熟悉：

*   顶部：标题栏，清晰展示当前操作模块；

<!---->

*   左侧：测试用例列表，所有用例集中管理，一目了然；

<!---->

*   右侧：单接口测试视图 + 批量测试视图，按需切换，操作聚焦。

![整体布局.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/b543534c20ad42b2a8a9943bf2b95520~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgQmVzdEFucw==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTU1NjU2NDE5NzI0ODYwNSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1762525129&x-orig-sign=FjeMG7p%2Bookbi7vrDFKMJncmxJk%3D)

## 核心功能实操：测试用例全流程管理

接下来带大家一步步看看，如何用 restful-api-test 管理测试用例，从导入到执行、导出，全流程都很丝滑～

### 1. 导入测试用例：JSON 格式，字段清晰

想添加新的测试用例，只需点击左侧列表上方的「导入测试用例」按钮即可。不过要注意，导入的用例必须是 JSON 格式，且包含 3 个必填字段：

*   name：测试用例名称，会显示在左侧列表中；

<!---->

*   description：用例描述，说明用例的作用和覆盖场景；

<!---->

*   apis：接口数组，每个接口包含name（接口名）、url（接口地址）、method（请求方法）等必填项，还有headers、params、body、expectedExpression（断言表达式）等可选字段。

![导入测试用例.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/d47c959a0a794278ac73928bc55c5d1b~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgQmVzdEFucw==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTU1NjU2NDE5NzI0ODYwNSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1762525129&x-orig-sign=xyTwYYjWViF01uUzogN5WmbW46k%3D)

给大家放一个完整的测试用例示例，直接复制修改就能用：

    {
      "name": "帖子管理示例接口",
      "description": "通用资源的模拟接口，覆盖 Posts 常用操作。",
      "apis": [
        {
          "name": "获取所有帖子",
          "url": "https://jsonplaceholder.typicode.com/posts",
          "method": "GET",
          "headers": {
            "Accept": "application/json"
          },
          "expectedExpression": "($.status === 200) && Array.isArray($.data) && $.data.length > 0"
        },
        {
          "name": "获取指定帖子 (id=1)",
          "url": "https://jsonplaceholder.typicode.com/posts/1",
          "method": "GET",
          "headers": {
            "Accept": "application/json"
          },
          "expectedExpression": "($.status === 200) && $.data.id === 1"
        }
      ]
    }

### 2. 编辑 / 删除：用例管理更灵活

导入的用例如果需要修改名称或描述，点击左侧列表的「编辑测试用例」按钮就能进入编辑模式；如果某个用例不再需要，点击删除按钮就能快速清理，操作很直观。

删除测试用例：

![删除测试用例.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/759645e8c68f4d39827a362b96039ec2~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgQmVzdEFucw==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTU1NjU2NDE5NzI0ODYwNSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1762525129&x-orig-sign=LqKrar6iRa%2FYXu5UoHl2X4a8594%3D)
编辑测试用例：

![编辑测试用例.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/cf9d07cb0ff3468a9c000774c28a1561~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgQmVzdEFucw==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTU1NjU2NDE5NzI0ODYwNSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1762525129&x-orig-sign=ya43gLVO%2BL%2FTuqe5D%2Fj9K%2Bse5HI%3D)

### 3. 批量执行：一次跑多个用例，结果秒出

做回归测试时，批量执行功能简直是刚需！两种方式可以触发批量测试：

*   直接点击测试用例列表的「批量测试」按钮；

<!---->

*   选中用例后，在右侧批量测试视图点击「运行所有测试用例」按钮。

执行完成后，会清晰展示每个用例的测试结果，通过率一目了然，省去了逐个执行的麻烦。

![批量执行测试用例.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/8bb13fc1289343bab7a9eda0fb6f1df7~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgQmVzdEFucw==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTU1NjU2NDE5NzI0ODYwNSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1762525129&x-orig-sign=nV8uaHF0jf2MH8pNTC295Ucajq0%3D)

### 4. 导出用例：版本管理 + 分享更方便

编辑后的测试用例，点击左侧列表的「导出测试用例」按钮，就能导出成 JSON 文件。这样一来，不仅方便做版本控制（比如用 Git 管理用例版本），还能轻松分享给团队成员，协作更高效。

![导出测试用例.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/bab26798a1634559b39e7a6cf0822c86~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgQmVzdEFucw==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTU1NjU2NDE5NzI0ODYwNSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1762525129&x-orig-sign=ZN04J12vhIAiy0sjB4kut3OsaWo%3D)

## 单接口测试：细节拉满，满足复杂需求

一个测试用例通常包含多个接口，选中左侧列表中的具体接口，就能进入单接口测试视图。这个视图由 4 部分组成：顶部操作栏、请求详情、请求头、请求参数 / 请求体，每个部分都考虑到了实际测试场景的需求。

![接口测试用例的管理.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/18fe57046a2a4d3cb6c1396d027701d3~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAgQmVzdEFucw==:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTU1NjU2NDE5NzI0ODYwNSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1762525129&x-orig-sign=r%2BvYew4OBgZoHbLdGjBg1TEoTJo%3D)

### 重点：预期断言表达式，精准校验结果

判断接口测试是否通过，关键就在「预期表达式」的配置。restful-api-test 支持标准 JavaScript 布尔表达式，运行时通过`new Function('$', "use strict"; return !!(expr))`执行，其中`$`是上下文对象，包含 5 个核心字段：

*   \$.status：HTTP 状态码（如 200、404）；

<!---->

*   \$.data：接口响应体（通常是 JSON 格式）；

<!---->

*   \$.headers：响应头信息；

<!---->

*   \$.request：请求信息（含 url、method、headers、body）；

<!---->

*   \$.response：完整响应对象，包含status、data、headers。

给大家举几个常用的表达式示例，方便参考：

1.  校验响应结构和长度：

```typescript
($.status === 200) && Array.isArray($.data.items) && $.data.items.length > 0
```

2.  校验字段值和类型：

```typescript
$.data.ok === true && typeof $.data.total === 'number' && $.data.total >= 10
```

3.  校验响应头：

```typescript
$.headers['content-type']?.includes('application/json')
```

4.  校验回显参数：

```typescript
Boolean($.response.data.args?.startTime && $.response.data.args?.endTime)
```

只要是 JavaScript 支持的判断逻辑和方法，都能写进表达式，比如`Array.isArray()`、`typeof`、`includes()`等，灵活应对各种复杂的校验场景。

### 其他配置：URL、请求头、请求参数、请求方法、请求消息体配置

除了断言表达式，单接口视图还支持配置接口 URL、请求头（比如设置 Authorization、Content-Type）、URL 参数（GET 请求常用）、请求体（POST/PUT 请求传参，默认 JSON 格式），满足不同接口的请求需求。

## 资源获取：一键下载，快速上手

看完功能介绍，如果你想立刻体验这款工具，可以通过以下链接获取资源：

*   **项目仓库地址**：<https://github.com/astonishqft/restful-tool>（可查看源码、提交 Issues、了解更新日志）

<!---->

*   **Windows 版本下载**：<https://github.com/astonishqft/restful-tool/releases/download/v1.0.9/restful-api-test-1.0.9-arm64.dmg>

<!---->

*   **Mac（x86 架构）版本下载**：<https://github.com/astonishqft/restful-tool/releases/download/v1.0.9/restful-api-test-1.0.9-x64.dmg>

<!---->

*   **Mac（ARM 架构）版本下载**：<https://github.com/astonishqft/restful-tool/releases/download/v1.0.9/restful-api-test-1.0.9-arm64.dmg>

## 最后：期待你的支持！

这款工具目前处于持续迭代中，如果你在使用过程中觉得它帮你解决了实际问题，或者有新的功能需求，欢迎到 GitHub 仓库给项目点一个「Star」🌟！你的支持是我持续优化工具的最大动力，也能让更多有需要的人发现这款实用的接口测试工具～

如果遇到使用问题，也可以在仓库的 Issues 区留言，我会及时回复并修复，一起让这款工具变得更完善！

**更多精彩文章，欢迎关注我的公众号：`前端架构师笔记`**
