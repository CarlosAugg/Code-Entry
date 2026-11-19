export interface SubnetInfo {
  ip: string;
  prefix: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalAddresses: number;
  usableHosts: number;
  ipClass: "A" | "B" | "C" | "D" | "E";
  isPrivate: boolean;
  binaryIp: string;
  binaryMask: string;
  binaryNetwork: string;
  binaryBroadcast: string;
}

export interface VlsmAllocation {
  name: string;
  requestedHosts: number;
  prefix: number;
  networkAddress: string;
  subnetMask: string;
  firstHost: string;
  lastHost: string;
  broadcastAddress: string;
  usableHosts: number;
}

export function isValidIpv4(ip: string): boolean {
  const parts = String(ip || "").trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every(p => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
}

export function ipToInt(ip: string): number {
  const parts = ip.trim().split(".").map(Number);
  return (((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0);
}

export function intToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

export function ipToBinaryGrouped(ip: string): string {
  return ip
    .trim()
    .split(".")
    .map(oct => Number(oct).toString(2).padStart(8, "0"))
    .join(".");
}

export function cidrToMaskInt(prefix: number): number {
  if (prefix <= 0) return 0;
  if (prefix >= 32) return 0xffffffff >>> 0;
  return ((0xffffffff << (32 - prefix)) >>> 0);
}

export function ipInCidr(ip: string, cidr: string): boolean {
  if (cidr === "0.0.0.0/0" || cidr.toLowerCase() === "any") return true;
  const [netIp, rawPrefix] = cidr.split("/");
  if (!isValidIpv4(ip) || !isValidIpv4(netIp)) return false;
  const prefix = rawPrefix !== undefined ? Number(rawPrefix) : 32;
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
  const mask = cidrToMaskInt(prefix);
  return (ipToInt(ip) & mask) === (ipToInt(netIp) & mask);
}

export function calculateSubnet(ipWithCidr: string): SubnetInfo {
  const trimmed = String(ipWithCidr || "").trim();
  const [rawIp, rawPrefix] = trimmed.split("/");
  if (!isValidIpv4(rawIp)) {
    throw new Error(`Endereço IPv4 inválido: '${rawIp || trimmed}'. Use o formato A.B.C.D/Prefixo.`);
  }
  const prefix = rawPrefix !== undefined ? Number(rawPrefix) : 24;
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error(`Prefixo CIDR inválido '/${rawPrefix}'. Use um valor entre 0 e 32.`);
  }

  const ipInt = ipToInt(rawIp);
  const maskInt = cidrToMaskInt(prefix);
  const wildcardInt = (~maskInt) >>> 0;
  const netInt = (ipInt & maskInt) >>> 0;
  const bcastInt = (netInt | wildcardInt) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);

  let firstHostInt = netInt;
  let lastHostInt = bcastInt;
  let usableHosts = totalAddresses;
  if (prefix <= 30) {
    firstHostInt = (netInt + 1) >>> 0;
    lastHostInt = (bcastInt - 1) >>> 0;
    usableHosts = totalAddresses - 2;
  } else if (prefix === 31) {
    usableHosts = 2;
  } else {
    usableHosts = 1;
  }

  const firstOctet = (ipInt >>> 24) & 255;
  const secondOctet = (ipInt >>> 16) & 255;
  const ipClass: SubnetInfo["ipClass"] =
    firstOctet < 128 ? "A" : firstOctet < 192 ? "B" : firstOctet < 224 ? "C" : firstOctet < 240 ? "D" : "E";
  const isPrivate =
    firstOctet === 10 ||
    (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ||
    (firstOctet === 192 && secondOctet === 168);

  const networkAddress = intToIp(netInt);
  const broadcastAddress = intToIp(bcastInt);
  const subnetMask = intToIp(maskInt);

  return {
    ip: rawIp,
    prefix,
    subnetMask,
    wildcardMask: intToIp(wildcardInt),
    networkAddress,
    broadcastAddress,
    firstHost: intToIp(firstHostInt),
    lastHost: intToIp(lastHostInt),
    totalAddresses,
    usableHosts,
    ipClass,
    isPrivate,
    binaryIp: ipToBinaryGrouped(rawIp),
    binaryMask: ipToBinaryGrouped(subnetMask),
    binaryNetwork: ipToBinaryGrouped(networkAddress),
    binaryBroadcast: ipToBinaryGrouped(broadcastAddress),
  };
}

export function calculateVlsm(
  baseCidr: string,
  requirements: { name: string; hosts: number }[]
): VlsmAllocation[] {
  const base = calculateSubnet(baseCidr);
  const sorted = [...requirements].sort((a, b) => b.hosts - a.hosts);
  let cursor = ipToInt(base.networkAddress);
  const baseEnd = ipToInt(base.broadcastAddress);
  const allocations: VlsmAllocation[] = [];

  for (const req of sorted) {
    const needed = Math.max(1, req.hosts) + 2;
    let hostBits = 2;
    while (2 ** hostBits < needed && hostBits < 30) hostBits++;
    const prefix = 32 - hostBits;
    const blockSize = 2 ** hostBits;
    if (cursor + blockSize - 1 > baseEnd) {
      throw new Error(`Bloco ${baseCidr} não tem endereços suficientes para a sub-rede '${req.name}' (${req.hosts} hosts).`);
    }
    const sub = calculateSubnet(`${intToIp(cursor)}/${prefix}`);
    allocations.push({
      name: req.name,
      requestedHosts: req.hosts,
      prefix,
      networkAddress: sub.networkAddress,
      subnetMask: sub.subnetMask,
      firstHost: sub.firstHost,
      lastHost: sub.lastHost,
      broadcastAddress: sub.broadcastAddress,
      usableHosts: sub.usableHosts,
    });
    cursor = (cursor + blockSize) >>> 0;
  }

  return allocations;
}
