export default interface RegistryEntry {
    path: string;
    parent: string | null;
    level: number;
}