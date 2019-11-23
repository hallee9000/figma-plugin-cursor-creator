// 十六进制颜色转换为 RGB 颜色函数，#000000 -> rgb(0, 0, 0)
const cutHex = h => (h.charAt(0)=="#") ? h.substring(1,7) : h
const hexToR = h => parseInt((cutHex(h)).substring(0,2), 16) / 256
const hexToG = h => parseInt((cutHex(h)).substring(2,4), 16) / 256
const hexToB = h => parseInt((cutHex(h)).substring(4,6), 16) / 256

// 画一个光标
const cursorCode = color => `
  <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d)">
      <path d="M7.5 17L5 4L16 10.5L10.5 12L7.5 17Z" fill="${color}"/>
      <path d="M6.99999 17.1L7.25999 18.38L7.92999 17.26L10.83 12.43L16.13 10.98L17.27 10.68L16.25 10.07L5.24999 3.57001L4.29999 3.01001L4.49999 4.09001L6.99999 17.09V17.1Z" stroke="white" stroke-linecap="square"/>
    </g>
    <defs>
      <filter id="filter0_d" x="0.608521" y="0.0220032" width="20.9383" height="23.7218" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
        <feOffset dy="1"/>
        <feGaussianBlur stdDeviation="1.5"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
    </defs>
  </svg>
`

// 来左边跟我一起画个名儿
const createName = async (nodes, name) => {
  // 画之前先要把字体加载好
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
  const text = figma.createText()
  text.x = 24
  text.y = 21
  text.characters = name
  text.fills = [{type: 'SOLID', color: {r: 1, g: 1, b: 1}}]
  // 将文字添加到当前页面
  figma.currentPage.appendChild(text)
  nodes.push(text)
  return text
}

// 在你右边画一个矩形
const createRect = (nodes, rgb) => {
  const rect = figma.createRectangle()
  rect.x = 17
  rect.y = 17
  rect.fills = [{type: 'SOLID', color: rgb}]
  figma.currentPage.appendChild(rect)
  nodes.push(rect)
  return rect
}

// 在中间比划一个光标
const createSVG = (nodes, color) => {
  const cursor = figma.createNodeFromSvg(cursorCode(color))
  cursor.x = 0
  cursor.y = 0
  figma.currentPage.appendChild(cursor)
  nodes.push(cursor)
  return cursor
}

// 齐活儿，开始整吧
const main = async msg => {
  const nodes: SceneNode[] = []
  // 将接收到的颜色转化为 RGB 格式
  const rgb = {r: hexToR(msg.color), g: hexToG(msg.color), b: hexToB(msg.color)}
  const name = msg.name
  // 画光标
  createSVG(nodes, msg.color)
  // 画矩形
  const rect = createRect(nodes, rgb)
  // 画名儿
  const text = await createName(nodes, name)
  // 根据名儿的宽度调整矩形宽度
  rect.resize(text.width + 14, 22)
  // 打包到一起
  figma.group(nodes, figma.currentPage)
  // 选中它们
  figma.currentPage.selection = nodes
  // 将视图滚动到它们的位置
  figma.viewport.scrollAndZoomIntoView(nodes)
}

// 整一个界面儿
figma.showUI(__html__)

figma.ui.onmessage = msg => {
  if (msg.type === 'create-cursor') {
    // 收到信号就开始比划
    main(msg)
      .then(() => {
        // 画完了，关了
        figma.closePlugin()
      })
  } else if (msg.type === 'cancel') {
    // 收到信号说要取消，关了
    figma.closePlugin()
  }
};
