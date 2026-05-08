import React from 'react';

/** 가로 막대 차트: 가장 긴 Y축(카테고리) 텍스트 길이에 맞춰 동적으로 너비 계산 */
export const HorizontalBarChartYAxisMeasure: React.FC<{
  currentData: any[];
  xAxisKey: string;
  contentSize: number;
  children: (yAxisWidth: number) => React.ReactNode;
}> = (props) => {
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [yAxisWidth, setYAxisWidth] = React.useState(28);
  const longestLabel = React.useMemo(() => {
    const strs = (props.currentData || []).map((d: any) => String(d[props.xAxisKey] ?? ''));
    return strs.length ? strs.reduce((a, b) => (a.length >= b.length ? a : b), '') : '';
  }, [props.currentData, props.xAxisKey]);

  React.useLayoutEffect(() => {
    if (!measureRef.current) {
      setYAxisWidth(28);
      return;
    }
    const w = measureRef.current.offsetWidth;
    setYAxisWidth(Math.max(24, Math.min(220, w + 8)));
  }, [longestLabel, props.contentSize]);

  return (
    <>
      <span
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: props.contentSize,
          fontWeight: 500,
        }}
      >
        {longestLabel || '0'}
      </span>
      {props.children(yAxisWidth)}
    </>
  );
};

/** Recharts 선형/영역/세로막대/혼합: Y축 숫자 레이블 길이에 맞춰 동적으로 너비 계산. showYAxis false면 0 전달해 플롯이 헤더와 정렬 */
export const RechartsNumericYAxisMeasure: React.FC<{
  currentData: any[];
  localSeries: { key: string; label: string; color?: string }[];
  contentSize: number;
  showYAxis?: boolean;
  children: (yAxisWidth: number) => React.ReactNode;
}> = (props) => {
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [yAxisWidth, setYAxisWidth] = React.useState(28);
  const maxVal = React.useMemo(() => {
    let m = 0;
    if (props.currentData?.length && props.localSeries?.length) {
      for (const d of props.currentData) {
        for (const s of props.localSeries) {
          const v = Number(d[s.key]);
          if (!Number.isNaN(v)) m = Math.max(m, v);
        }
      }
    }
    if (m === 0 && props.currentData?.length) {
      for (const d of props.currentData) {
        if (!d || typeof d !== 'object') continue;
        for (const [k, val] of Object.entries(d)) {
          if (typeof val === 'object' || k === 'name') continue;
          const v = Number(val);
          if (!Number.isNaN(v)) m = Math.max(m, v);
        }
      }
    }
    return m;
  }, [props.currentData, props.localSeries]);

  const widestTickLabel = React.useMemo(() => {
    const m = maxVal;
    const candidates = [m.toLocaleString(), String(Math.round(m)), m >= 1000 ? m.toLocaleString('en-US') : ''].filter(Boolean) as string[];
    return candidates.reduce((a, b) => (a.length >= b.length ? a : b), '0');
  }, [maxVal]);

  React.useLayoutEffect(() => {
    if (!measureRef.current) {
      setYAxisWidth(32);
      return;
    }
    const w = measureRef.current.offsetWidth;
    setYAxisWidth(Math.max(32, Math.min(140, Math.ceil(w + 12))));
  }, [widestTickLabel, props.contentSize]);

  const effectiveWidth = props.showYAxis !== false ? yAxisWidth : 0;
  return (
    <>
      <span
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: props.contentSize,
          fontWeight: 500,
        }}
      >
        {widestTickLabel}
      </span>
      {props.children(effectiveWidth)}
    </>
  );
};
