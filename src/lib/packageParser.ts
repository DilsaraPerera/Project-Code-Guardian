import type { ParsedPackageJson, Dependency } from '@/types/security';

export function parsePackageJson(content: string): ParsedPackageJson {
  try {
    const pkg = JSON.parse(content);
    return {
      name: pkg.name || 'unknown',
      version: pkg.version || '0.0.0',
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
      scripts: pkg.scripts || {},
    };
  } catch (error) {
    throw new Error('Invalid package.json format');
  }
}

export function extractDependencies(parsed: ParsedPackageJson): Dependency[] {
  const dependencies: Dependency[] = [];
  
  // Extract production dependencies
  for (const [name, version] of Object.entries(parsed.dependencies)) {
    dependencies.push({
      name,
      version: cleanVersion(version),
      isDevDependency: false,
      directDependency: true,
    });
  }
  
  // Extract dev dependencies
  for (const [name, version] of Object.entries(parsed.devDependencies)) {
    dependencies.push({
      name,
      version: cleanVersion(version),
      isDevDependency: true,
      directDependency: true,
    });
  }
  
  return dependencies;
}

// Clean version string (remove ^, ~, >=, etc.)
function cleanVersion(version: string): string {
  // Handle various version formats
  if (version.startsWith('npm:')) {
    // Handle npm aliases like "npm:package@version"
    const match = version.match(/@([^@]+)$/);
    return match ? cleanVersion(match[1]) : 'latest';
  }
  
  if (version.startsWith('git') || version.startsWith('http') || version.startsWith('file:')) {
    return 'latest';
  }
  
  // Remove common prefixes
  return version.replace(/^[\^~>=<]+/, '').split(' ')[0] || 'latest';
}

export function parseLockfile(content: string): Record<string, { version: string; dependencies?: Record<string, string> }> {
  try {
    const lockfile = JSON.parse(content);
    
    // Handle package-lock.json v2/v3 format
    if (lockfile.packages) {
      const result: Record<string, { version: string; dependencies?: Record<string, string> }> = {};
      for (const [path, pkg] of Object.entries(lockfile.packages as Record<string, any>)) {
        if (!path || path === '') continue; // Skip root package
        const name = path.replace(/^node_modules\//, '').split('node_modules/').pop() || '';
        if (name && pkg.version) {
          result[name] = {
            version: pkg.version,
            dependencies: pkg.dependencies,
          };
        }
      }
      return result;
    }
    
    // Handle package-lock.json v1 format
    if (lockfile.dependencies) {
      return Object.fromEntries(
        Object.entries(lockfile.dependencies as Record<string, any>).map(([name, pkg]) => [
          name,
          { version: pkg.version, dependencies: pkg.dependencies },
        ])
      );
    }
    
    return {};
  } catch (error) {
    console.error('Failed to parse lockfile:', error);
    return {};
  }
}

export function flattenDependencies(
  lockfileData: Record<string, { version: string; dependencies?: Record<string, string> }>,
  directDeps: Dependency[]
): Array<{
  name: string;
  version: string;
  isDevDependency: boolean;
  isDirectDependency: boolean;
  depth: number;
  dependencyPath: string[];
}> {
  const result: Map<string, {
    name: string;
    version: string;
    isDevDependency: boolean;
    isDirectDependency: boolean;
    depth: number;
    dependencyPath: string[];
  }> = new Map();
  
  const directDepsMap = new Map(directDeps.map(d => [d.name, d]));
  
  // Add direct dependencies first
  for (const dep of directDeps) {
    const lockEntry = lockfileData[dep.name];
    const version = lockEntry?.version || dep.version;
    const key = `${dep.name}@${version}`;
    
    result.set(key, {
      name: dep.name,
      version,
      isDevDependency: dep.isDevDependency,
      isDirectDependency: true,
      depth: 0,
      dependencyPath: [dep.name],
    });
  }
  
  // Walk transitive dependencies (limit depth to avoid infinite loops)
  function walkDeps(
    deps: Record<string, string> | undefined,
    currentPath: string[],
    depth: number,
    isDevChain: boolean
  ) {
    if (!deps || depth > 10) return;
    
    for (const [name, _] of Object.entries(deps)) {
      const lockEntry = lockfileData[name];
      if (!lockEntry) continue;
      
      const key = `${name}@${lockEntry.version}`;
      const newPath = [...currentPath, name];
      
      if (!result.has(key)) {
        result.set(key, {
          name,
          version: lockEntry.version,
          isDevDependency: isDevChain,
          isDirectDependency: false,
          depth,
          dependencyPath: newPath,
        });
        
        walkDeps(lockEntry.dependencies, newPath, depth + 1, isDevChain);
      }
    }
  }
  
  // Walk from direct dependencies
  for (const dep of directDeps) {
    const lockEntry = lockfileData[dep.name];
    if (lockEntry?.dependencies) {
      walkDeps(lockEntry.dependencies, [dep.name], 1, dep.isDevDependency);
    }
  }
  
  return Array.from(result.values());
}

export function detectProjectName(packageJson: ParsedPackageJson): string {
  return packageJson.name || 'Unnamed Project';
}