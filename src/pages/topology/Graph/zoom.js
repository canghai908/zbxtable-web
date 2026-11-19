/**
 * 安全地将拓扑内容适配到视口。
 * 避免容器宽高为 0 或内容 bbox 非法时，X6 zoomToFit 写入非有限 SVGMatrix。
 */
export function fitGraphContent(graph, options = {}) {
  if (!graph) return false

  const { padding = 100, maxScale = 1, retries = 8 } = options

  const tryFit = (attempt) => {
    const container = graph.container
    if (!container) return false

    const width = container.clientWidth || container.offsetWidth
    const height = container.clientHeight || container.offsetHeight
    if (!(width > 0 && height > 0) || !Number.isFinite(width) || !Number.isFinite(height)) {
      if (attempt < retries) {
        requestAnimationFrame(() => tryFit(attempt + 1))
      }
      return false
    }

    try {
      graph.resize(width, height)
    } catch (e) {
      // ignore resize failures; zoom may still work if size already synced
    }

    const cells = typeof graph.getCells === 'function' ? graph.getCells() : []
    if (!cells || cells.length === 0) {
      return false
    }

    let bbox
    try {
      bbox = graph.getContentBBox()
    } catch (e) {
      return false
    }
    if (
      !bbox ||
      !(bbox.width > 0) ||
      !(bbox.height > 0) ||
      !Number.isFinite(bbox.width) ||
      !Number.isFinite(bbox.height)
    ) {
      if (attempt < retries) {
        requestAnimationFrame(() => tryFit(attempt + 1))
      }
      return false
    }

    try {
      graph.centerContent()
      graph.zoomToFit({ padding, maxScale })
      return true
    } catch (e) {
      console.warn('fitGraphContent failed:', e)
      return false
    }
  }

  return tryFit(0)
}

/** 从 DOM 容器读取数值宽高，供 Graph 初始化使用（禁止传入 '100%'）。 */
export function getContainerSize(container, fallback = { width: 800, height: 600 }) {
  if (!container) {
    return { ...fallback }
  }
  const width = container.clientWidth || container.offsetWidth || fallback.width
  const height = container.clientHeight || container.offsetHeight || fallback.height
  return {
    width: Number.isFinite(width) && width > 0 ? width : fallback.width,
    height: Number.isFinite(height) && height > 0 ? height : fallback.height,
  }
}
