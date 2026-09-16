# 在 VS Code 中打开拾卷源码

## 打开项目

解压 `拾卷_VSCode项目.zip`，在 VS Code 选择“文件 → 打开文件夹”，选择解压后的 `拾卷_VSCode项目` 文件夹。也可以选择“文件 → 从文件打开工作区”，打开其中的 `拾卷.code-workspace`。

如果使用此前的“HTML与完整源码”压缩包，选择其中的 `拾卷/源码` 文件夹。

项目不需要专用 VS Code 扩展。完整的开发代码在 `app`、`lib` 等目录，已经分文件整理；`dist/index.html` 是打包后的成品。

当前源码版本为0.4.1，对应《项目说明》V0.7.1（2026-09-10）。新增IndexedDB自动记忆、保存试卷列表和逐份手动删除，保留Word/PDF公式功能与Buffer兼容修复。常规使用请运行“启动拾卷.cmd”或`pnpm start:local`，固定打开`http://127.0.0.1:17839/`；开发预览地址与此地址的保存记录互不共享。

## 第一次准备

修改和构建源码需要 Node.js 22.13 或更高版本，以及 pnpm。安装这些开发工具后，重新打开 VS Code。

在“终端 → 新建终端”中检查：

```sh
node --version
pnpm --version
```

若已有 Node.js，但没有 pnpm，可自行执行：

```sh
npm install -g pnpm@11.19.0
```

首次安装项目依赖需要联网：

```sh
pnpm install --frozen-lockfile
```

## 预览与修改

```sh
pnpm dev
```

点击终端打印的本地地址，在浏览器中预览。保持这个终端运行，保存代码后页面会更新；停止时在该终端按 `Ctrl+C`。

| 想修改什么 | 打开哪个文件 |
| --- | --- |
| 页面、导入按钮、答题交互 | `app/exam-app.tsx` |
| 颜色、字体、布局与手机适配 | `app/globals.css` |
| 题目与答案的识别规则 | `lib/exam-parser.ts` |
| Word 文件读取 | `lib/word-reader.ts` |
| Word OMML 公式转换 | `lib/word-math.ts` |
| 文字及扫描 PDF 读取 | `lib/pdf-reader.ts` |
| 本地中英文 OCR | `lib/local-ocr.ts` |
| 人工核对编辑界面 | `app/question-editor.tsx` |
| PDF 原页框选及多个图片片段 | `app/pdf-cropper.tsx`、`lib/crop-geometry.ts` |
| 公式标记与排版 | `lib/math-text.ts`、`lib/math-render.ts`、`app/math-text.tsx` |

## 生成可独立使用的 HTML

```sh
pnpm build
```

生成文件为 `dist/index.html`。双击这个 HTML 即可离线使用，可以复制给其他人；不需要把 `node_modules` 或整个源码一同复制过去。

Word/PDF读取器、KaTeX公式排版、中英文OCR模型与引擎均随成品内嵌，当前HTML约16.45MiB（16845KB）。使用成品不需要首次联网下载识别资源；公式显示依赖浏览器原生MathML，扫描识别还需要Web Worker、WebAssembly、OffscreenCanvas和DecompressionStream。目标浏览器的实际导入、点击和框选验收尚未完成，不能用构建成功替代实机验证。

不要直接双击 `.tsx` 文件，也不要直接在 Live Server 中打开 `.tsx`；开发预览使用 `pnpm dev`。离线运行使用构建后的 `dist/index.html`。

## 已配置的 VS Code 快捷任务

- 按 `Ctrl+Shift+B`：生成离线 HTML。
- 菜单“终端 → 运行任务”：选择“拾卷：安装依赖（首次）”或“拾卷：启动开发预览”。
- 需要验证修改时：选择“拾卷：构建并运行全部检查”。

任务不会在打开项目时自动安装软件或启动服务。Windows 下任务调用 `pnpm.cmd`；若终端因 PowerShell 策略拒绝 `pnpm.ps1`，也可以将手动命令中的 `pnpm` 改为 `pnpm.cmd`。

## 修改公式功能后的检查

先运行`pnpm build`，再运行`pnpm test`、`pnpm typecheck`和`pnpm lint`。测试会使用构建后的生产Worker；不要只修改源码而继续测试旧HTML。

核对界面可使用`\(...\)`和`\[...\]`编辑公式并实时预览。Word只对可识别的OMML结构进行转换；PDF公式通过完整题干或单独选项的原图片段保持外观，不承诺任意数学图片都能转成可编辑公式。手工框选时必须排除参考答案、解析和其他题目，跨页内容按阅读顺序添加多个片段。

PDF原页预览的宽、高均不超过2000像素，自动数学片段最多600个；超出后转手工核对或拆分文件。这些限制以及20MB文件、100页PDF和20页OCR上限在修改解析代码时应一起保留或明确调整，不能通过移除资源限制掩盖导入失败。

V0.6最终开发回归已通过：15组49题Word、26项边界、43项Word数学、10项PDF/OCR、5项PDF数学、11项公式界面与裁图、11项离线渲染和生产Worker检查，以及类型检查、lint和构建。它们是开发用例证据，实际浏览器操作与真实试卷准确率仍需单独验收。

识别能力、运行限制、当前验证记录及Word/PDF样例详见`README.md`，项目需求见`项目说明.md`。OCR模型在首次安装依赖时下载，构建后内嵌到HTML，使用成品时不需要联网。
