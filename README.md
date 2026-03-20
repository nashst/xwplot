# Xwplot Pro 📊

Xwplot Pro 是一款专业、现代化且易于使用的在线数据可视化与分析工具。通过简单的拖拽和配置，用户可以快速将 CSV 或 JSON 数据转化为高质量的图表，并支持导出为 PNG 或 SVG 格式，适用于学术报告、商业分析和日常数据探索。

## ✨ 核心功能

- **📂 便捷的数据导入**：支持上传 CSV 或 JSON 格式的数据文件。
- **📈 丰富的数据概览**：自动生成数据概括报告，包含数值型和类别型数据的分布直方图，支持鼠标悬浮查看具体数值。
- **🎨 多样化的图表类型**：
  - 散点图 (Scatter Plot)
  - 折线图 (Line Graph)
  - 柱状图 (Bar Chart)
  - 面积图 (Area Chart)
  - 饼图 (Pie Chart)
  - 雷达图 (Radar Chart)
- **⚙️ 强大的自定义配置**：
  - 自由选择 X 轴和多个 Y 轴数据。
  - 自定义坐标轴标签、刻度间隔（X轴标签间隔、Y轴刻度数量）。
  - 支持按类别进行颜色分组 (Color By)。
  - 图例位置调整、数据标签显示、平滑曲线切换。
  - 图表宽高比 (Aspect Ratio) 调整。
  - 底部缩放滑块 (Brush) 支持，方便查看局部数据细节。
- **💾 高清图表导出**：一键导出包含完整标题和坐标轴标签的 PNG 或 SVG 高清图片。

## 🛠️ 技术栈

- **前端框架**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **图表库**: [Recharts](https://recharts.org/)
- **图标**: [Lucide React](https://lucide.dev/)
- **导出工具**: `html-to-image`

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
