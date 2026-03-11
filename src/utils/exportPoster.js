const FRAME_W = 1191
const FRAME_H = 1684

// Black rectangle (photo cutout) - measured from actual frame pixels
const PHOTO_AREA = {
  top: Math.round(FRAME_H * 0.2049),
  left: Math.round(FRAME_W * 0.1033),
  width: Math.round(FRAME_W * 0.7935),
  height: Math.round(FRAME_H * 0.4092),
}

// Name area (between DEAD OR ALIVE and bounty)
const NAME_AREA = {
  top: Math.round(FRAME_H * 0.71),
  left: Math.round(FRAME_W * 0.1),
  width: Math.round(FRAME_W * 0.8),
  height: Math.round(FRAME_H * 0.09),
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Format name: uppercase + replace spaces with bullet •
function formatPirateName(name) {
  return (name || 'YOUR NAME HERE').toUpperCase().replace(/\s+/g, '•')
}

export async function exportPoster(posterEl, pirateName, photoSrc, photoPosition, nameScale = 1.0) {
  const canvas = document.createElement('canvas')
  canvas.width = FRAME_W
  canvas.height = FRAME_H
  const ctx = canvas.getContext('2d')

  // 1. Draw the frame as the base layer
  const frameImg = await loadImage('/images/wanted-poster-frame.png')
  ctx.drawImage(frameImg, 0, 0, FRAME_W, FRAME_H)

  // 2. Draw user's photo over the black rectangle
  if (photoSrc) {
    const photoImg = await loadImage(photoSrc)

    ctx.save()
    ctx.beginPath()
    ctx.rect(PHOTO_AREA.left, PHOTO_AREA.top, PHOTO_AREA.width, PHOTO_AREA.height)
    ctx.clip()

    const areaAspect = PHOTO_AREA.width / PHOTO_AREA.height
    const imgAspect = photoImg.width / photoImg.height

    let drawW, drawH
    if (imgAspect > areaAspect) {
      drawH = PHOTO_AREA.height
      drawW = drawH * imgAspect
    } else {
      drawW = PHOTO_AREA.width
      drawH = drawW / imgAspect
    }

    // Scale factor between display and export resolution
    const displayWidth = posterEl.offsetWidth
    const scaleFactor = FRAME_W / displayWidth

    const scale = photoPosition.scale
    drawW *= scale
    drawH *= scale

    const centerX = PHOTO_AREA.left + PHOTO_AREA.width / 2
    const centerY = PHOTO_AREA.top + PHOTO_AREA.height / 2
    const drawX = centerX - drawW / 2 + photoPosition.x * scaleFactor
    const drawY = centerY - drawH / 2 + photoPosition.y * scaleFactor

    ctx.drawImage(photoImg, drawX, drawY, drawW, drawH)
    ctx.restore()
  }

  // 3. Draw texture overlay with darken blend mode
  const textureImg = await loadImage('/images/texture-layer.png')
  ctx.save()
  ctx.globalCompositeOperation = 'darken'
  ctx.drawImage(textureImg, 0, 0, FRAME_W, FRAME_H)
  ctx.restore()

  // 4. Draw the pirate name
  const nameText = formatPirateName(pirateName)
  ctx.fillStyle = '#1a1008'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const baseFontSize = Math.round(96 * nameScale)
  let nameFontSize = baseFontSize
  ctx.font = `400 ${nameFontSize}px "Noto Serif Bengali"`
  while (ctx.measureText(nameText).width > NAME_AREA.width - 20 && nameFontSize > 20) {
    nameFontSize -= 2
    ctx.font = `400 ${nameFontSize}px "Noto Serif Bengali"`
  }

  const nameCenterX = NAME_AREA.left + NAME_AREA.width / 2
  const nameCenterY = NAME_AREA.top + NAME_AREA.height / 2
  ctx.fillText(nameText, nameCenterX, nameCenterY)

  // 5. Export and download
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safeName = (pirateName || 'pirate').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
  a.download = `wanted-poster-${safeName}.png`
  a.href = url
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
