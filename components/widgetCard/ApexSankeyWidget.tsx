import React from 'react';

export const ApexSankeyWidget: React.FC<{
  data: { nodes: { id: string; title: string }[]; edges: { source: string; target: string; value: number }[] };
  fontColor?: string;
  nodeWidth?: number;
}> = ({ data, fontColor = 'var(--text-main)', nodeWidth = 20 }) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mountedRef = React.useRef(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let rafId: number | null = null;
    const updateSize = () => {
      if (!wrapper) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = wrapper.getBoundingClientRect();
        const w = Math.round(rect.width) || 0;
        const h = Math.round(rect.height) || 0;
        if (w > 0 && h > 0) {
          setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
        }
      });
    };
    const ro = new ResizeObserver(updateSize);
    ro.observe(wrapper);
    updateSize();
    const t2 = setTimeout(updateSize, 150);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      clearTimeout(t2);
    };
  }, []);

  React.useEffect(() => {
    setLoadError(null);
    mountedRef.current = true;
    const el = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!el || !data.nodes.length) return;
    const w = size.w > 0 ? size.w : (wrapper ? Math.round(wrapper.getBoundingClientRect().width) : 0) || el.offsetWidth || 400;
    const h = size.h > 0 ? size.h : (wrapper ? Math.round(wrapper.getBoundingClientRect().height) : 0) || el.offsetHeight || 300;
    if (w <= 0 || h <= 0) return;

    (async () => {
      try {
        const mod = await import('apexsankey');
        if (!mountedRef.current || !el) return;
        const ApexSankeyLib = (mod as any).default ?? mod;
        if (!ApexSankeyLib) return;
        const licenseKey = (import.meta as any).env?.VITE_APEXSANKEY_LICENSE;
        if (typeof ApexSankeyLib.setLicense === 'function' && licenseKey) {
          ApexSankeyLib.setLicense(licenseKey);
        }
        el.style.width = '';
        el.style.height = '';
        el.style.minWidth = '';
        el.style.minHeight = '';
        const sankey = new ApexSankeyLib(el, {
          width: w,
          height: h,
          fontColor,
          nodeWidth,
          enableTooltip: true,
          edgeOpacity: 0.5,
          canvasStyle: 'border: none; background: transparent;',
          enableToolbar: false,
        });
        sankey.render(data);
        if (!licenseKey && mountedRef.current && el) {
          const hideWatermark = (node: HTMLElement) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const elem = node as HTMLElement;
            const text = elem.textContent?.trim().replace(/\s+/g, ' ') ?? '';
            const onlyApex = /^(APEXCHARTS\s*)+$/i.test(text) || text === 'APEXCHARTS';
            if (elem.children.length === 0 && onlyApex) {
              elem.style.display = 'none';
              return;
            }
            Array.from(elem.children).forEach((c) => hideWatermark(c as HTMLElement));
          };
          const run = () => {
            if (!mountedRef.current || !el) return;
            hideWatermark(el);
          };
          requestAnimationFrame(run);
          setTimeout(run, 150);
        }
      } catch (err) {
        if (mountedRef.current) {
          setLoadError('apexsankey 로드 실패. 터미널에서 npm install 후 dev 서버를 다시 실행하세요.');
          if (el) el.innerHTML = '';
        }
      }
    })();

    return () => {
      mountedRef.current = false;
      if (el) el.innerHTML = '';
    };
    // Avoid re-running on every slight size change if possible, or throttle
  }, [data, fontColor, nodeWidth, size.w, size.h]);

  if (loadError) {
    return (
      <div
        className="w-full h-full flex items-center justify-center p-4 text-center text-sm rounded"
        style={{
          minHeight: 'var(--widget-error-min-height)',
          color: 'var(--widget-error-text)',
          backgroundColor: 'var(--widget-error-bg)',
        }}
      >
        {loadError}
      </div>
    );
  }
  return (
    <div
      ref={wrapperRef}
      className="w-full h-full min-w-0"
      style={{ minHeight: 'var(--widget-error-min-height)' }}
    >
      <div ref={containerRef} className="apex-sankey-container w-full h-full" />
    </div>
  );
};
