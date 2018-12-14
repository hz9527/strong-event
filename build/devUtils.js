function resolveRouter(path, root = '/src') {
  const str = path.slice(path.lastIndexOf(root) + root.length)
  return str.replace('/index.htm', '')
}

function parseHtml(html, inject) {
  return html.replace(/<\/body>/, sub => `<script src="${inject}"></script>${sub}`)
}

module.exports = {
  resolveRouter,
  parseHtml
}
