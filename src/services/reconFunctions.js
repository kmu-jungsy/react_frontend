import axios from 'axios';
import * as fabric from 'fabric';

const IP_ADDR = process.env.REACT_APP_IP_ADDR;
export const getEventsAndStrokes = async (testId, type) =>{
    const response = await axios.post(`${IP_ADDR}/reconstruction/getEventsAndStrokes`, {
        testId, 
        type
    });

    return response.data;
}
export const computeStrokeScale = (strokes, canvas) => {
  // 1. stroke 좌표 범위 구하기
  let maxX = 0, maxY = 0, minX = Infinity, minY = Infinity;
  for (const stroke of strokes) {
    for (const pt of stroke.points) {
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
    }
  }
  
  const strokeWidth = maxX - minX;
  const strokeHeight = maxY - minY;
  
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  
  const scaleX = canvasWidth / (strokeWidth + 20);
  const scaleY = canvasHeight / (strokeHeight + 20);
  const scale = Math.min(scaleX, scaleY);
  
  // 🔥 중앙 정렬을 위한 오프셋 계산
  const offsetX = (canvasWidth - strokeWidth * scale) / 2 - minX * scale;
  const offsetY = (canvasHeight - strokeHeight * scale) / 2 - minY * scale;

  return {scale, offsetX, offsetY};
  
}
export const playTimelapse = async (canvas, strokes, scale, offsetX, offsetY) => {

  strokes.sort((a, b) => a.strokeOrder - b.strokeOrder);

  for (const stroke of strokes) {
    const points = stroke.points;
    const isErasing = stroke.isErasing;
    const strokeColor = `#${stroke.color.slice(-6)}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const delay = curr.t - prev.t;
      await new Promise(resolve => setTimeout(resolve, delay));

      const line = new fabric.Line([
        prev.x * scale + offsetX,
        prev.y * scale + offsetY,
        curr.x * scale + offsetX,
        curr.y * scale + offsetY,
      ], {
        stroke: strokeColor,
        strokeWidth: (prev.p ?? 1),
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        selectable: false,
      });

      line.strokeOrder = stroke.strokeOrder;
      if (isErasing) {
        const pt = new fabric.Point(curr.x * scale + offsetX, curr.y * scale + offsetY);
        canvas.getObjects().forEach(obj => {
          if (obj.containsPoint(pt)) canvas.remove(obj);
        });
      } else {
        canvas.add(line);
      }
    }

    canvas.renderAll();
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

