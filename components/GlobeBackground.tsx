import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

/** Natural Earth 110m — GeoJSON (topojson-client 불필요) */
const WORLD_GEOJSON_URL = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson';

import { ThemeMode } from '../types';

/** 지구 배경 — 마우스 드래그로 회전, 관성 지원. project 3 등 배경용 */
const GlobeBackground: React.FC<{ mode: ThemeMode }> = ({ mode }) => {
  const isLight = mode === ThemeMode.LIGHT;
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

  const l = isLight ? 'light' : 'dark';

  // Optimization: Cache styles outside of the main effects to avoid repeated DOM queries
  const themeStyles = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const s = getComputedStyle(document.documentElement);
    return {
        glow: s.getPropertyValue(`--globe-glow-fill-${l}`).trim(),
        ring: s.getPropertyValue(`--globe-ring-stroke-${l}`).trim(),
        sphere: s.getPropertyValue(`--globe-sphere-fill-${l}`).trim(),
        sphereStroke: s.getPropertyValue(`--globe-sphere-stroke-${l}`).trim(),
        graticule: s.getPropertyValue(`--globe-graticule-stroke-${l}`).trim(),
        land: s.getPropertyValue(`--globe-land-fill-${l}`).trim(),
        landStroke: s.getPropertyValue(`--globe-land-stroke-${l}`).trim(),
        blurOuter: s.getPropertyValue('--globe-blur-outer').trim() || '80px',
        blurInner: s.getPropertyValue('--globe-blur-inner').trim() || '4px'
    };
  }, [l]);

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

  // 1. Initial Setup: Create static elements once
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('shape-rendering', 'geometricPrecision');

    const mainGroup = svg.append('g').attr('class', 'globe-group');
    
    // Add layers back to front
    mainGroup.append('circle').attr('class', 'outer-glow');
    mainGroup.append('circle').attr('class', 'inner-ring');
    mainGroup.append('circle').attr('class', 'sphere');
    mainGroup.append('path').attr('class', 'graticule');
    mainGroup.append('path').attr('class', 'land');
  }, [dimensions]);

  // 2. Continuous Update: Update attributes only (No DOM creation/deletion)
  useEffect(() => {
    if (!svgRef.current || !worldData || !themeStyles) return;
    const { width, height } = dimensions;
    const baseRadius = Math.min(width, height) / 2.2;
    const currentRadius = baseRadius * zoom;

    const projection = d3.geoOrthographic()
      .scale(currentRadius)
      .translate([width / 2, height / 2])
      .rotate(rotation);

    const path = d3.geoPath().projection(projection);
    const svg = d3.select(svgRef.current);
    const mainGroup = svg.select('.globe-group');

    // Radii
    const outerRadius = currentRadius * 1.35;
    const innerRadius = currentRadius * 1.08;
    const sphereRadius = currentRadius * 0.98;

    // Update Outer Glow
    mainGroup.select('.outer-glow')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', outerRadius)
      .attr('fill', themeStyles.glow)
      .style('filter', `blur(${themeStyles.blurOuter})`)
      .style('opacity', isLight ? 0.3 : 0.12);

    // Update Inner Ring
    mainGroup.select('.inner-ring')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', innerRadius)
      .attr('fill', 'none')
      .attr('stroke', themeStyles.ring)
      .attr('stroke-width', 2)
      .style('filter', `blur(${themeStyles.blurInner})`);

    // Update Sphere
    mainGroup.select('.sphere')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', sphereRadius)
      .attr('fill', themeStyles.sphere)
      .attr('stroke', themeStyles.sphereStroke);

    // Update Graticule
    const graticule = d3.geoGraticule();
    mainGroup.select('.graticule')
      .datum(graticule())
      .attr('d', path as unknown as string)
      .attr('fill', 'none')
      .attr('stroke', themeStyles.graticule)
      .attr('stroke-width', 0.5);

    // Update Land
    mainGroup.select('.land')
      .datum(worldData)
      .attr('d', path as unknown as string)
      .attr('fill', themeStyles.land)
      .attr('stroke', themeStyles.landStroke)
      .attr('stroke-width', 0.5)
      .attr('stroke-linejoin', 'round');

  }, [rotation, zoom, dimensions, worldData, isLight, themeStyles]);

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

export default React.memo(GlobeBackground);
