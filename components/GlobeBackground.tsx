import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/** Natural Earth 110m — GeoJSON (topojson-client 불필요) */
const WORLD_GEOJSON_URL = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson';

/** 지구 배경 — 마우스 드래그로 회전, 관성 지원. project 3 등 배경용 */
const GlobeBackground: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [zoom] = useState(0.85);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [worldData, setWorldData] = useState<GeoJSON.FeatureCollection | null>(null);

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastTimestamp = useRef(0);
  const inertiaFrame = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    d3.json(WORLD_GEOJSON_URL).then((data: unknown) => {
      if (data && typeof data === 'object' && 'type' in data && (data as GeoJSON.FeatureCollection).type === 'FeatureCollection')
        setWorldData(data as GeoJSON.FeatureCollection);
    });
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !worldData) return;

    const { width, height } = dimensions;
    const baseRadius = Math.min(width, height) / 2.2;
    const currentRadius = baseRadius * zoom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('shape-rendering', 'geometricPrecision');

    const projection = d3
      .geoOrthographic()
      .scale(currentRadius)
      .translate([width / 2, height / 2])
      .rotate(rotation);

    const path = d3.geoPath().projection(projection);
    const mainGroup = svg.append('g');

    mainGroup
      .append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', currentRadius * 1.35)
      .attr('fill', '#0ea5e9')
      .style('filter', `blur(${80}px)`)
      .style('opacity', 0.12);

    mainGroup
      .append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', currentRadius * 1.08)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(56, 189, 248, 0.35)')
      .attr('stroke-width', 2)
      .style('filter', 'blur(4px)');

    mainGroup
      .append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', currentRadius * 0.98)
      .attr('fill', '#020617')
      .attr('stroke', '#0f172a');

    const graticule = d3.geoGraticule();
    mainGroup
      .append('path')
      .datum(graticule())
      .attr('d', path as unknown as string)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(14, 165, 233, 0.14)')
      .attr('stroke-width', 0.5);

    mainGroup
      .append('path')
      .datum(worldData)
      .attr('d', path as unknown as string)
      .attr('fill', 'rgba(14, 165, 233, 0.28)')
      .attr('stroke', 'rgba(56, 189, 248, 0.45)')
      .attr('stroke-width', 0.5)
      .attr('stroke-linejoin', 'round');
  }, [rotation, zoom, dimensions, worldData]);

  const applyInertia = () => {
    const friction = 0.95;
    const threshold = 0.01;
    if (Math.abs(velocity.current.x) < threshold && Math.abs(velocity.current.y) < threshold) {
      if (inertiaFrame.current) cancelAnimationFrame(inertiaFrame.current);
      inertiaFrame.current = null;
      return;
    }
    setRotation((prev) => [prev[0] + velocity.current.x, prev[1] - velocity.current.y, prev[2]]);
    velocity.current.x *= friction;
    velocity.current.y *= friction;
    inertiaFrame.current = requestAnimationFrame(applyInertia);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    lastTimestamp.current = performance.now();
    velocity.current = { x: 0, y: 0 };
    if (inertiaFrame.current) {
      cancelAnimationFrame(inertiaFrame.current);
      inertiaFrame.current = null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    velocity.current = { x: dx * 0.3, y: dy * 0.3 };
    setRotation((prev) => [prev[0] + dx * 0.3, prev[1] - dy * 0.3, prev[2]]);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    lastTimestamp.current = performance.now();
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    inertiaFrame.current = requestAnimationFrame(applyInertia);
  };

  useEffect(() => () => {
    if (inertiaFrame.current) cancelAnimationFrame(inertiaFrame.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      aria-hidden
    >
      <svg ref={svgRef} className="w-full h-full" style={{ willChange: 'transform' }} />
    </div>
  );
};

export default GlobeBackground;
