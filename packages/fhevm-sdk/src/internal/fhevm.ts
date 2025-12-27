import { isAddress, Eip1193Provider, JsonRpcProvider } from "ethers";
import { publicKeyStorageGet, publicKeyStorageSet } from "./PublicKeyStorage";
import { FhevmInstance, FhevmInstanceConfig } from "../fhevmTypes";

// Dynamic import to avoid SSR issues
let relayerSDK: {
  initSDK: () => Promise<boolean>;
  createInstance: (config: FhevmInstanceConfig) => Promise<FhevmInstance>;
  SepoliaConfig: FhevmInstanceConfig;
} | null = null;

async function loadRelayerSDK() {
  if (relayerSDK) return relayerSDK;

  if (typeof window === "undefined") {
    throw new Error("RelayerSDK can only be loaded in browser environment");
  }

  console.log("[loadRelayerSDK] Dynamically importing @zama-fhe/relayer-sdk/web...");
  const sdk = await import("@zama-fhe/relayer-sdk/web");
  relayerSDK = {
    initSDK: sdk.initSDK,
    createInstance: sdk.createInstance,
    SepoliaConfig: sdk.SepoliaConfig,
  };
  console.log("[loadRelayerSDK] SDK loaded successfully");
  return relayerSDK;
}

export class FhevmReactError extends Error {
  code: string;
  constructor(code: string, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
    this.name = "FhevmReactError";
  }
}

function throwFhevmError(
  code: string,
  message?: string,
  cause?: unknown
): never {
  throw new FhevmReactError(code, message, cause ? { cause } : undefined);
}

// Track SDK initialization state
let _sdkInitialized = false;

const isFhevmInitialized = (): boolean => {
  return _sdkInitialized;
};

const fhevmInitSDK = async (): Promise<boolean> => {
  console.log("[fhevmInitSDK] Calling relayerInitSDK...");
  try {
    const sdk = await loadRelayerSDK();
    const result = await sdk.initSDK();
    console.log("[fhevmInitSDK] initSDK result:", result);
    _sdkInitialized = result;
    if (!result) {
      throw new Error("relayerInitSDK failed.");
    }
    return true;
  } catch (error) {
    console.error("[fhevmInitSDK] Error:", error);
    throw error;
  }
};

function checkIsAddress(a: unknown): a is `0x${string}` {
  if (typeof a !== "string") {
    return false;
  }
  if (!isAddress(a)) {
    return false;
  }
  return true;
}

export class FhevmAbortError extends Error {
  constructor(message = "FHEVM operation was cancelled") {
    super(message);
    this.name = "FhevmAbortError";
  }
}

type FhevmRelayerStatusType =
  | "sdk-loading"
  | "sdk-loaded"
  | "sdk-initializing"
  | "sdk-initialized"
  | "creating";

async function getChainId(
  providerOrUrl: Eip1193Provider | string
): Promise<number> {
  if (typeof providerOrUrl === "string") {
    const provider = new JsonRpcProvider(providerOrUrl);
    return Number((await provider.getNetwork()).chainId);
  }
  const chainId = await providerOrUrl.request({ method: "eth_chainId" });
  return Number.parseInt(chainId as string, 16);
}

async function getWeb3Client(rpcUrl: string) {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const version = await rpc.send("web3_clientVersion", []);
    return version;
  } catch (e) {
    throwFhevmError(
      "WEB3_CLIENTVERSION_ERROR",
      `The URL ${rpcUrl} is not a Web3 node or is not reachable. Please check the endpoint.`,
      e
    );
  } finally {
    rpc.destroy();
  }
}

async function tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl: string): Promise<
  | {
      ACLAddress: `0x${string}`;
      InputVerifierAddress: `0x${string}`;
      KMSVerifierAddress: `0x${string}`;
    }
  | undefined
> {
  const version = await getWeb3Client(rpcUrl);
  if (
    typeof version !== "string" ||
    !version.toLowerCase().includes("hardhat")
  ) {
    // Not a Hardhat Node
    return undefined;
  }
  try {
    const metadata = await getFHEVMRelayerMetadata(rpcUrl);
    if (!metadata || typeof metadata !== "object") {
      return undefined;
    }
    if (
      !(
        "ACLAddress" in metadata &&
        typeof metadata.ACLAddress === "string" &&
        metadata.ACLAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    if (
      !(
        "InputVerifierAddress" in metadata &&
        typeof metadata.InputVerifierAddress === "string" &&
        metadata.InputVerifierAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    if (
      !(
        "KMSVerifierAddress" in metadata &&
        typeof metadata.KMSVerifierAddress === "string" &&
        metadata.KMSVerifierAddress.startsWith("0x")
      )
    ) {
      return undefined;
    }
    return metadata;
  } catch {
    // Not a FHEVM Hardhat Node
    return undefined;
  }
}

async function getFHEVMRelayerMetadata(rpcUrl: string) {
  const rpc = new JsonRpcProvider(rpcUrl);
  try {
    const version = await rpc.send("fhevm_relayer_metadata", []);
    return version;
  } catch (e) {
    throwFhevmError(
      "FHEVM_RELAYER_METADATA_ERROR",
      `The URL ${rpcUrl} is not a FHEVM Hardhat node or is not reachable. Please check the endpoint.`,
      e
    );
  } finally {
    rpc.destroy();
  }
}

type MockResolveResult = { isMock: true; chainId: number; rpcUrl: string };
type GenericResolveResult = { isMock: false; chainId: number; rpcUrl?: string };
type ResolveResult = MockResolveResult | GenericResolveResult;

async function resolve(
  providerOrUrl: Eip1193Provider | string,
  mockChains?: Record<number, string>
): Promise<ResolveResult> {
  // Resolve chainId
  const chainId = await getChainId(providerOrUrl);

  // Resolve rpc url
  let rpcUrl = typeof providerOrUrl === "string" ? providerOrUrl : undefined;

  const _mockChains: Record<number, string> = {
    31337: "http://localhost:8545",
    ...(mockChains ?? {}),
  };

  // Help Typescript solver here:
  if (Object.hasOwn(_mockChains, chainId)) {
    if (!rpcUrl) {
      rpcUrl = _mockChains[chainId];
    }

    return { isMock: true, chainId, rpcUrl };
  }

  return { isMock: false, chainId, rpcUrl };
}

export const createFhevmInstance = async (parameters: {
  provider: Eip1193Provider | string;
  mockChains?: Record<number, string>;
  signal: AbortSignal;
  onStatusChange?: (status: FhevmRelayerStatusType) => void;
}): Promise<FhevmInstance> => {
  const throwIfAborted = () => {
    if (signal.aborted) throw new FhevmAbortError();
  };

  const notify = (status: FhevmRelayerStatusType) => {
    if (onStatusChange) onStatusChange(status);
  };

  const {
    signal,
    onStatusChange,
    provider: providerOrUrl,
    mockChains,
  } = parameters;

  console.log("[createFhevmInstance] Starting with provider:", typeof providerOrUrl === 'string' ? providerOrUrl : 'Eip1193Provider');

  // Resolve chainId
  let resolveResult;
  try {
    resolveResult = await resolve(providerOrUrl, mockChains);
    console.log("[createFhevmInstance] Resolved:", resolveResult);
  } catch (resolveError) {
    console.error("[createFhevmInstance] Failed to resolve provider:", resolveError);
    throw resolveError;
  }

  const { isMock, rpcUrl, chainId } = resolveResult;

  if (isMock) {
    // Throws an error if cannot connect or url does not refer to a Web3 client
    const fhevmRelayerMetadata =
      await tryFetchFHEVMHardhatNodeRelayerMetadata(rpcUrl);

    if (fhevmRelayerMetadata) {
      // fhevmRelayerMetadata is defined, which means rpcUrl refers to a FHEVM Hardhat Node
      notify("creating");

      //////////////////////////////////////////////////////////////////////////
      //
      // WARNING!!
      // ALWAY USE DYNAMIC IMPORT TO AVOID INCLUDING THE ENTIRE FHEVM MOCK LIB
      // IN THE FINAL PRODUCTION BUNDLE!!
      //
      //////////////////////////////////////////////////////////////////////////
      const fhevmMock = await import("./mock/fhevmMock");
      const mockInstance = await fhevmMock.fhevmMockCreateInstance({
        rpcUrl,
        chainId,
        metadata: fhevmRelayerMetadata,
      });

      throwIfAborted();

      return mockInstance;
    }
  }

  throwIfAborted();

  console.log("[createFhevmInstance] Starting SDK initialization...");

  // Load SDK dynamically
  notify("sdk-loading");
  console.log("[createFhevmInstance] Loading SDK dynamically...");
  const sdk = await loadRelayerSDK();
  console.log("[createFhevmInstance] SDK loaded from package");
  notify("sdk-loaded");

  if (!isFhevmInitialized()) {
    notify("sdk-initializing");
    console.log("[createFhevmInstance] Calling initSDK...");

    try {
      await fhevmInitSDK();
      console.log("[createFhevmInstance] initSDK completed successfully");
    } catch (initError) {
      console.error("[createFhevmInstance] initSDK failed:", initError);
      throw initError;
    }
    throwIfAborted();

    notify("sdk-initialized");
  } else {
    console.log("[createFhevmInstance] SDK already initialized");
  }

  console.log("[createFhevmInstance] SepoliaConfig:", JSON.stringify(sdk.SepoliaConfig, null, 2));

  const aclAddress = sdk.SepoliaConfig.aclContractAddress;
  if (!checkIsAddress(aclAddress)) {
    throw new Error(`Invalid ACL address: ${aclAddress}`);
  }

  console.log("[createFhevmInstance] Getting cached public key for ACL:", aclAddress);
  let pub;
  try {
    pub = await publicKeyStorageGet(aclAddress);
    console.log("[createFhevmInstance] Cached public key:", pub.publicKey ? "found" : "not found");
    console.log("[createFhevmInstance] Cached public params:", pub.publicParams ? "found" : "not found");
  } catch (storageError) {
    console.warn("[createFhevmInstance] Error getting cached key:", storageError);
    pub = { publicParams: null };
  }
  throwIfAborted();

  // Use working RPC URL - the SDK's default RPC might be dead
  const WORKING_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

  // Build config - let SDK fetch public key if not cached
  const config: FhevmInstanceConfig = {
    ...sdk.SepoliaConfig,
    network: typeof providerOrUrl === 'string' ? providerOrUrl : WORKING_RPC,
    ...(pub.publicKey && { publicKey: pub.publicKey }),
    ...(pub.publicParams && { publicParams: pub.publicParams }),
  };

  console.log("[createFhevmInstance] Config prepared:");
  console.log("  - network:", config.network);
  console.log("  - aclContractAddress:", config.aclContractAddress);
  console.log("  - kmsContractAddress:", config.kmsContractAddress);
  console.log("  - publicKey provided:", !!pub.publicKey);
  console.log("  - publicParams provided:", !!pub.publicParams);

  // notify that state === "creating"
  notify("creating");
  console.log("[createFhevmInstance] Calling sdk.createInstance...");

  let instance;
  try {
    instance = await sdk.createInstance(config);
    console.log("[createFhevmInstance] Instance created successfully!");
  } catch (createError) {
    console.error("[createFhevmInstance] Failed to create instance:", createError);
    throw createError;
  }

  // Save the key even if aborted
  try {
    const pubKey = instance.getPublicKey();
    const pubParams = instance.getPublicParams(2048);
    console.log("[createFhevmInstance] Saving public key to cache...");
    await publicKeyStorageSet(aclAddress, pubKey, pubParams);
    console.log("[createFhevmInstance] Public key saved to cache");
  } catch (saveError) {
    console.warn("[createFhevmInstance] Failed to save public key to cache:", saveError);
    // Don't throw - instance is still valid
  }

  throwIfAborted();

  console.log("[createFhevmInstance] Returning instance");
  return instance;
};
