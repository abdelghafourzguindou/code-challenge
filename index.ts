import RegistryEntry from './domain/RegistryEntry';
import User from './domain/User';

const ROOT_BASE_PATH: string = '/';

/**
 * Create a list of all paths and their minimum access level
 * @param {Array<Object>} Registry array of routes
 * @returns {Array<Object>} modified registry
 */
export const getAllPaths = (registry: RegistryEntry[]): RegistryEntry[] => {
  const pathsMap: Map<string, RegistryEntry> = new Map<string, RegistryEntry>();

  // Helper function to add the path and all its parent paths to the map
  function addPath(entry: RegistryEntry, basePath: string): void {
    const fullPath = basePath === ROOT_BASE_PATH ? entry.path : `${basePath}${entry.path}`;

    if (!pathsMap.has(fullPath)) {
      pathsMap.set(fullPath, { ...entry, parent: basePath, path: fullPath });
    }

    const children = registry.filter(e => e.parent === entry.path);
    children.forEach(child => addPath(child, fullPath));
  }

  const root = registry.find(entry => entry.parent === null);
  addPath(root, ROOT_BASE_PATH)

  return Array.from(pathsMap.values());
}

/**
 * Check accessibilty for a user
 * @param {Object} User { name: string, level: number }
 * @param {String} Path path to check
 * @param {Array<Object>} ModifiedRegistry getAllPaths() result
 * @returns {Boolean} if the user has acces
 */
export const hasAccess = (user: User, path: string, paths: RegistryEntry[]): boolean => {
  const pathsMap = new Map<string, RegistryEntry>(paths.map(p => [p.path, p]));

  let parentPath = pathsMap.get(path);
  while (parentPath.parent !== ROOT_BASE_PATH) {
    if (user.level < parentPath?.level) {
      return false;
    }
    parentPath = pathsMap.get(parentPath.parent);
  }

  // Check the root path
  return user.level >= parentPath?.level;
}

/**
 * Get all paths a user has access too
 * @param {Object} User { name: string, level: number }
 * @param {Array<Object>} ModifiedRegistry getAllPaths() result
 * @returns {Array<Object>} filtered array of routes
 */
export const getUserPaths = (user: User, paths: RegistryEntry[]): RegistryEntry [] => {
  return paths.filter(p => hasAccess(user, p.path, paths));
}
