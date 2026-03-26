# Xwplot Pro 📊

Xwplot Pro 是一款专业、现代化且易于使用的在线数据可视化与商业智能 (BI) 分析工具。通过简单的拖拽和配置，用户可以快速将 CSV 数据转化为高质量的图表，并支持构建可自由排版的数据看板 (Dashboard)。适用于学术报告、商业分析和日常数据探索。

## 📸 界面预览

### 1. 数据探索 (Data Exploration)
自动生成数据质量报告，包含数值型和类别型数据的分布直方图、缺失值检测和统计摘要。
![Data Exploration](https://placehold.co/800x450/f8fafc/0f172a?text=Data+Exploration+View)

### 2. 图表构建 (Chart Builder)
强大的可视化引擎，支持多轴配置、颜色分组、趋势线拟合以及丰富的样式自定义。
![Chart Builder](https://placehold.co/800x450/f8fafc/0f172a?text=Chart+Builder+View)

### 3. 数据看板 (Dashboard)
可自由拖拽、缩放的网格布局，轻松打造属于您的专属数据分析报告。
![Dashboard](https://placehold.co/800x450/f8fafc/0f172a?text=Interactive+Dashboard)

## ✨ 核心功能

- **🚀 极致性能 (Web Workers)**：将繁重的数据解析和统计逻辑移入后台多线程，即使上传数十万行的大型 CSV 文件，页面依然丝滑流畅，告别卡顿。
- **🧩 交互式数据看板 (Dashboard)**：引入专业的网格布局引擎，核心指标卡片、图表分析、相关性矩阵均可自由拖拽、缩放，像使用 Tableau 一样排版您的数据报告。
- **📈 深度数据画像 (Data Profiling)**：自动计算数据缺失率、唯一值、均值/极值，并生成分布直方图。
- **🎨 多样化的图表类型**：
  - 散点图 (Scatter Plot)
  - 折线图 (Line Graph)
  - 柱状图 (Bar Chart)
  - 面积图 (Area Chart)
  - 饼图 (Pie Chart)
  - 雷达图 (Radar Chart)
- **⚙️ 强大的自定义配置**：
  - 自由选择 X 轴和多个 Y 轴数据。
  - 支持按类别进行颜色分组 (Color By)。
  - 图例位置调整、数据标签显示、平滑曲线切换、线性回归趋势线。
- **💾 高清图表导出**：一键导出包含完整标题和坐标轴标签的 PNG 或 SVG 高清图片。

## 🛠️ 技术栈

- **前端框架**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **状态管理**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) (轻量级、高性能的全局状态管理)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **图表引擎**: [Plotly.js](https://plotly.com/javascript/) (`react-plotly.js`)
- **布局引擎**: [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout)
- **数据处理**: [PapaParse](https://www.papaparse.com/) + Web Workers
- **图标**: [Lucide React](https://lucide.dev/)

## 🚀 本地运行

1. 克隆项目到本地：
   ```bash
   git clone <your-repo-url>
   cd xwplot-pro
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中打开 `http://localhost:3000` 即可预览。

## 📦 部署指南 (Vercel)

本项目非常适合部署在 Vercel 上：

1. 将代码推送到您的 GitHub 仓库。
2. 登录 [Vercel](https://vercel.com/)，点击 **Add New... -> Project**。
3. 导入您的 GitHub 仓库。
4. 保持默认的构建设置（Build Command: `npm run build`, Output Directory: `dist`）。
5. 点击 **Deploy**，等待部署完成即可获得在线访问链接。

## 📄 许可证

[MIT License](LICENSE)
