import type { LayoutItem } from "react-grid-layout";
import type { Widget } from "../types";

function layoutSane(n: number, def: number): number {
  return typeof n === "number" && Number.isFinite(n) ? n : def;
}

/** 저장된 레이아웃이 없을 때 위젯 col/rowSpan으로 순차 배치한 RGL 아이템 */
export function computeInitialLayout(widgets: Widget[], cols: number): LayoutItem[] {
  let nextX = 0;
  let nextY = 0;
  let maxHInRow = 0;
  return widgets.map((w) => {
    const wVal = layoutSane(Number(w.colSpan), 4);
    const hVal = layoutSane(Number(w.rowSpan), 4);
    if (nextX + wVal > cols) {
      nextX = 0;
      nextY += maxHInRow;
      maxHInRow = 0;
    }
    const item: LayoutItem = { i: w.id, x: nextX, y: nextY, w: wVal, h: hVal };
    nextX += wVal;
    maxHInRow = Math.max(maxHInRow, hVal);
    return item;
  });
}
