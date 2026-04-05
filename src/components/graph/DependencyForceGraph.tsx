import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import type { GraphNode, GraphLink, GraphData } from '@/hooks/useDependencyGraph';

// HSL from index.css severity tokens converted to hex for canvas
const RISK_COLORS: Record<string, string> = {
  critical: '#dc2626', // severity-critical
  high: '#f97316',     // severity-high
  medium: '#eab308',   // severity-medium
  low: '#22c55e',      // severity-low
  info: '#3b82f6',     // severity-info / primary
};

const ROOT_COLOR = '#a78bfa'; // purple for project root

interface Props {
  data: GraphData;
  width: number;
  height: number;
  onNodeClick?: (node: GraphNode) => void;
}

export function DependencyForceGraph({ data, width, height, onNodeClick }: Props) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Zoom to fit on data change
  useEffect(() => {
    const timer = setTimeout(() => {
      fgRef.current?.zoomToFit(400, 60);
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  const graphData = useMemo(() => ({
    nodes: data.nodes.map(n => ({ ...n })),
    links: data.links.map(l => ({ ...l })),
  }), [data]);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const gNode = node as GraphNode & { x: number; y: number };
    const isRoot = gNode.id === '__root__';
    const isHovered = hoveredNode?.id === gNode.id;
    const radius = isRoot ? 8 : Math.max(3, gNode.val);
    const color = isRoot ? ROOT_COLOR : RISK_COLORS[gNode.riskLevel] || RISK_COLORS.info;

    // Glow effect for critical/high or hovered nodes
    if (gNode.riskLevel === 'critical' || gNode.riskLevel === 'high' || isHovered) {
      ctx.beginPath();
      ctx.arc(gNode.x, gNode.y, radius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}33`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(gNode.x, gNode.y, radius + 8, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}15`;
      ctx.fill();
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(gNode.x, gNode.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Border
    ctx.strokeStyle = isHovered ? '#ffffff' : `${color}88`;
    ctx.lineWidth = isHovered ? 2 : 1;
    ctx.stroke();

    // Label
    const fontSize = isRoot ? (14 * 1.05) / globalScale : Math.max((10 * 1.05) / globalScale, 3 * 1.05);
    if (globalScale > 0.5 || isRoot || isHovered) {
      ctx.font = `${isRoot ? 'bold ' : ''}${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(
        isRoot ? gNode.name : gNode.name.length > 20 ? gNode.name.slice(0, 18) + '…' : gNode.name,
        gNode.x,
        gNode.y + radius + 2
      );
    }
  }, [hoveredNode]);

  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const gLink = link as GraphLink & { source: { x: number; y: number }; target: { x: number; y: number } };
    if (!gLink.source?.x || !gLink.target?.x) return;

    ctx.beginPath();
    ctx.moveTo(gLink.source.x, gLink.source.y);
    ctx.lineTo(gLink.target.x, gLink.target.y);

    if (gLink.isVulnerablePath) {
      ctx.strokeStyle = '#dc262644';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
    } else {
      ctx.strokeStyle = '#3b82f622';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node as GraphNode | null);
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    const gNode = node as GraphNode;
    if (gNode.id === '__root__') return;
    onNodeClick?.(gNode);
  }, [onNodeClick]);

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={graphData}
      width={width}
      height={height}
      backgroundColor="transparent"
      nodeCanvasObject={nodeCanvasObject}
      nodePointerAreaPaint={(node: any, color, ctx) => {
        const gNode = node as GraphNode & { x: number; y: number };
        const radius = gNode.id === '__root__' ? 10 : Math.max(5, gNode.val + 2);
        ctx.beginPath();
        ctx.arc(gNode.x, gNode.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }}
      linkCanvasObject={linkCanvasObject}
      onNodeHover={handleNodeHover}
      onNodeClick={handleNodeClick}
      cooldownTime={2000}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
      enableNodeDrag={true}
    />
  );
}
