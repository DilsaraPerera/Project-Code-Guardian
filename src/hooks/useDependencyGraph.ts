import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GraphNode {
  id: string;
  name: string;
  version: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'info';
  riskScore: number;
  isDirectDependency: boolean;
  depth: number;
  vulnerabilityCount: number;
  weakLinkCount: number;
  val: number; // node size for force-graph
}

export interface GraphLink {
  source: string;
  target: string;
  isVulnerablePath: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  stats: {
    totalNodes: number;
    maxDepth: number;
    circularDeps: number;
    highRiskPaths: number;
  };
}

export function useDependencyGraph(scanId: string | undefined) {
  return useQuery({
    queryKey: ['dependency-graph', scanId],
    queryFn: async (): Promise<GraphData> => {
      if (!scanId) throw new Error('No scan ID');

      // Fetch dependencies with vulnerabilities and weak links
      const { data: deps, error } = await supabase
        .from('dependencies')
        .select(`
          id, name, version, is_direct_dependency, is_dev_dependency,
          depth, risk_score, risk_level, dependency_path,
          vulnerabilities (id, severity),
          weak_links (id, severity)
        `)
        .eq('scan_id', scanId);

      if (error) throw error;
      if (!deps || deps.length === 0) return { nodes: [], links: [], stats: { totalNodes: 0, maxDepth: 0, circularDeps: 0, highRiskPaths: 0 } };

      // Fetch the scan to get the project name for the root node
      const { data: scan } = await supabase
        .from('scans')
        .select('project_name')
        .eq('id', scanId)
        .single();

      const projectName = scan?.project_name || 'Project';

      // Build nodes
      const nodes: GraphNode[] = [];
      const nodeMap = new Map<string, GraphNode>();

      // Root node
      const rootNode: GraphNode = {
        id: '__root__',
        name: projectName,
        version: '',
        riskLevel: 'info',
        riskScore: 0,
        isDirectDependency: true,
        depth: -1,
        vulnerabilityCount: 0,
        weakLinkCount: 0,
        val: 12,
      };
      nodes.push(rootNode);
      nodeMap.set('__root__', rootNode);

      let maxDepth = 0;
      let highRiskPaths = 0;

      for (const dep of deps) {
        const vulnCount = dep.vulnerabilities?.length || 0;
        const weakCount = dep.weak_links?.length || 0;
        const riskLevel = (dep.risk_level || 'info') as GraphNode['riskLevel'];
        const depth = dep.depth || 0;

        if (depth > maxDepth) maxDepth = depth;
        if (riskLevel === 'critical' || riskLevel === 'high') highRiskPaths++;

        const node: GraphNode = {
          id: dep.id,
          name: dep.name,
          version: dep.version,
          riskLevel,
          riskScore: Number(dep.risk_score) || 0,
          isDirectDependency: dep.is_direct_dependency ?? true,
          depth,
          vulnerabilityCount: vulnCount,
          weakLinkCount: weakCount,
          val: Math.max(3, Math.min(10, 3 + vulnCount * 2 + weakCount)),
        };
        nodes.push(node);
        nodeMap.set(dep.name, node);
      }

      // Build links from dependency_path
      const links: GraphLink[] = [];
      const linkSet = new Set<string>();

      for (const dep of deps) {
        const path = dep.dependency_path || [];
        const riskLevel = (dep.risk_level || 'info') as string;
        const isVulnerable = riskLevel === 'critical' || riskLevel === 'high' || riskLevel === 'medium';

        if (path.length === 0 || (path.length === 1 && path[0] === dep.name)) {
          // Direct dependency — link from root
          const targetNode = nodeMap.get(dep.name);
          if (targetNode) {
            const linkKey = `__root__->${dep.name}`;
            if (!linkSet.has(linkKey)) {
              linkSet.add(linkKey);
              links.push({
                source: '__root__',
                target: targetNode.id,
                isVulnerablePath: isVulnerable,
              });
            }
          }
        } else {
          // Transitive — link from parent (second to last in path) to this dep
          const parentName = path[path.length - 2];
          const parentNode = nodeMap.get(parentName);
          const targetNode = nodeMap.get(dep.name);
          if (parentNode && targetNode) {
            const linkKey = `${parentName}->${dep.name}`;
            if (!linkSet.has(linkKey)) {
              linkSet.add(linkKey);
              links.push({
                source: parentNode.id,
                target: targetNode.id,
                isVulnerablePath: isVulnerable,
              });
            }
          }

          // Also ensure root -> first in path exists
          if (path.length >= 1) {
            const firstNode = nodeMap.get(path[0]);
            if (firstNode) {
              const rootLinkKey = `__root__->${path[0]}`;
              if (!linkSet.has(rootLinkKey)) {
                linkSet.add(rootLinkKey);
                links.push({
                  source: '__root__',
                  target: firstNode.id,
                  isVulnerablePath: isVulnerable,
                });
              }
            }
          }
        }
      }

      return {
        nodes,
        links,
        stats: {
          totalNodes: nodes.length - 1, // exclude root
          maxDepth,
          circularDeps: 0,
          highRiskPaths,
        },
      };
    },
    enabled: !!scanId,
  });
}
