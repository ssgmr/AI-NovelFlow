/**
 * ChapterGenerate 页面辅助函数
 */

/**
 * 根据画面比例计算图片容器尺寸
 */
export const getAspectRatioStyle = (aspectRatio: string): React.CSSProperties => {
  const baseSize = 120;
  
  switch (aspectRatio) {
    case '16:9':
      return { width: baseSize, height: Math.round(baseSize * 9 / 16) };
    case '9:16':
      return { width: Math.round(baseSize * 9 / 16), height: baseSize };
    case '4:3':
      return { width: baseSize, height: Math.round(baseSize * 3 / 4) };
    case '3:4':
      return { width: Math.round(baseSize * 3 / 4), height: baseSize };
    case '1:1':
      return { width: baseSize, height: baseSize };
    case '21:9':
      return { width: baseSize, height: Math.round(baseSize * 9 / 21) };
    case '2.35:1':
      return { width: baseSize, height: Math.round(baseSize / 2.35) };
    default:
      return { width: baseSize, height: Math.round(baseSize * 9 / 16) };
  }
};

/**
 * 验证分镜场景是否在场景库中
 */
export const getInvalidSceneShots = (editableJson: string, scenes: { name: string }[]): any[] => {
  if (!editableJson.trim() || scenes.length === 0) return [];
  try {
    const parsed = JSON.parse(editableJson);
    if (!parsed.shots || !Array.isArray(parsed.shots)) return [];
    const sceneNames = scenes.map(s => s.name);
    return parsed.shots.filter((shot: any) => shot.scene && !sceneNames.includes(shot.scene));
  } catch (e) {
    return [];
  }
};

/**
 * 合并角色图片
 */
export const mergeCharacterImages = async (
  shotCharacters: string[],
  getCharacterImage: (name: string) => string | undefined
): Promise<string | null> => {
  const imageUrls = shotCharacters.map((name: string) => getCharacterImage(name)).filter(Boolean) as string[];
  
  if (imageUrls.length === 0) {
    return null;
  }

  const count = imageUrls.length;
  let cols = 1;
  let rows = 1;
  
  if (count === 1) {
    cols = 1; rows = 1;
  } else if (count <= 3) {
    cols = 1; rows = count;
  } else if (count === 4) {
    cols = 2; rows = 2;
  } else if (count <= 6) {
    cols = 3; rows = 2;
  } else {
    cols = 3; rows = Math.ceil(count / 3);
  }

  const images = await Promise.all(
    imageUrls.map(url => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    }))
  );

  const canvas = document.createElement('canvas');
  const cellWidth = 200;
  const cellHeight = 200;
  const nameHeight = 30;
  const padding = 10;
  
  canvas.width = cols * (cellWidth + padding) + padding;
  canvas.height = rows * (cellHeight + nameHeight + padding) + padding;
  
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  images.forEach((img, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = padding + col * (cellWidth + padding);
    const y = padding + row * (cellHeight + nameHeight + padding);
    
    const scale = Math.min(cellWidth / img.width, cellHeight / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const drawX = x + (cellWidth - drawWidth) / 2;
    const drawY = y + (cellHeight - drawHeight) / 2;
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(shotCharacters[index], x + cellWidth / 2, y + cellHeight + 20);
  });
  
  return canvas.toDataURL('image/png');
};
