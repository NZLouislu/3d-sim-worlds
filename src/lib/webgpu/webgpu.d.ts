/**
 * WebGPU Type Definitions
 * Provides basic type support for projects without @webgpu/types
 */

declare global {
  interface Navigator {
    gpu?: GPU;
  }
}

/**
 * WebGPU GPU Interface
 */
interface GPU {
  requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
  getPreferredCanvasFormat(): GPUTextureFormat;
}

interface GPURequestAdapterOptions {
  powerPreference?: 'low-power' | 'high-performance';
  forceFallbackAdapter?: boolean;
}

/**
 * WebGPU Adapter Interface
 */
interface GPUAdapter {
  requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
  requestAdapterInfo(): Promise<GPUAdapterInfo>;
  readonly features: GPUSupportedFeatures;
  readonly limits: GPUSupportedLimits;
  readonly isFallbackAdapter: boolean;
}

interface GPUDeviceDescriptor {
  requiredFeatures?: Iterable<GPUFeatureName>;
  requiredLimits?: Record<string, number>;
  defaultQueue?: GPUQueueDescriptor;
}

interface GPUQueueDescriptor {
  label?: string;
}

interface GPUAdapterInfo {
  readonly vendor: string;
  readonly architecture: string;
  readonly device: string;
  readonly description: string;
}

/**
 * WebGPU Device Interface
 */
interface GPUDevice extends EventTarget {
  readonly features: GPUSupportedFeatures;
  readonly limits: GPUSupportedLimits;
  readonly queue: GPUQueue;
  destroy(): void;
  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
  createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
  createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
  createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
  createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
  createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
  createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
  readonly lost: Promise<GPUDeviceLostInfo>;
  pushErrorScope(filter: GPUErrorFilter): void;
  popErrorScope(): Promise<GPUError | null>;
}

interface GPUSupportedFeatures extends ReadonlySet<string> {}

interface GPUSupportedLimits {
  readonly maxTextureDimension1D: number;
  readonly maxTextureDimension2D: number;
  readonly maxTextureDimension3D: number;
  readonly maxTextureArrayLayers: number;
  readonly maxBindGroups: number;
  readonly maxBindingsPerBindGroup: number;
  readonly maxDynamicUniformBuffersPerPipelineLayout: number;
  readonly maxDynamicStorageBuffersPerPipelineLayout: number;
  readonly maxSampledTexturesPerShaderStage: number;
  readonly maxSamplersPerShaderStage: number;
  readonly maxStorageBuffersPerShaderStage: number;
  readonly maxStorageTexturesPerShaderStage: number;
  readonly maxUniformBuffersPerShaderStage: number;
  readonly maxUniformBufferBindingSize: number;
  readonly maxStorageBufferBindingSize: number;
  readonly maxVertexBuffers: number;
  readonly maxVertexAttributes: number;
  readonly maxVertexBufferArrayStride: number;
  readonly maxInterStageShaderComponents: number;
  readonly maxComputeWorkgroupStorageSize: number;
  readonly maxComputeInvocationsPerWorkgroup: number;
  readonly maxComputeWorkgroupSizeX: number;
  readonly maxComputeWorkgroupSizeY: number;
  readonly maxComputeWorkgroupSizeZ: number;
  readonly maxComputeWorkgroupsPerDimension: number;
}

// Basic type placeholders
interface GPUQueue {}
interface GPUBuffer {}
interface GPUTexture {}
interface GPUShaderModule {}
interface GPURenderPipeline {}
interface GPUComputePipeline {}
interface GPUBindGroupLayout {}
interface GPUPipelineLayout {}
interface GPUBindGroup {}
interface GPUCommandEncoder {}
interface GPUDeviceLostInfo {}
interface GPUError {}

interface GPUBufferDescriptor {
  size: number;
  usage: number;
  mappedAtCreation?: boolean;
}

interface GPUTextureDescriptor {
  size: GPUExtent3DDict | Iterable<number>;
  format: GPUTextureFormat;
  usage: number;
  mipLevelCount?: number;
  sampleCount?: number;
  dimension?: GPUTextureDimension;
  viewFormats?: Iterable<GPUTextureFormat>;
}

interface GPUExtent3DDict {
  width: number;
  height?: number;
  depthOrArrayLayers?: number;
}

interface GPUShaderModuleDescriptor {
  code: string;
  hints?: Record<string, GPUShaderModuleCompilationHint>;
}

interface GPUShaderModuleCompilationHint {
  layout?: GPUPipelineLayout | 'auto';
}

interface GPURenderPipelineDescriptor {
  layout: GPUPipelineLayout | 'auto';
  vertex: GPUVertexState;
  fragment?: GPUFragmentState;
  primitive?: GPUPrimitiveState;
  depthStencil?: GPUDepthStencilState;
  multisample?: GPUMultisampleState;
}

interface GPUComputePipelineDescriptor {
  layout: GPUPipelineLayout | 'auto';
  compute: GPUProgrammableStage;
}

interface GPUBindGroupLayoutDescriptor {
  entries: Iterable<GPUBindGroupLayoutEntry>;
}

interface GPUPipelineLayoutDescriptor {
  bindGroupLayouts: Iterable<GPUBindGroupLayout>;
}

interface GPUBindGroupDescriptor {
  layout: GPUBindGroupLayout;
  entries: Iterable<GPUBindGroupEntry>;
}

interface GPUCommandEncoderDescriptor {}

// Simplified type placeholders
interface GPUVertexState {}
interface GPUFragmentState {}
interface GPUPrimitiveState {}
interface GPUDepthStencilState {}
interface GPUMultisampleState {}
interface GPUProgrammableStage {}
interface GPUBindGroupLayoutEntry {}
interface GPUBindGroupEntry {}

type GPUTextureFormat = string;
type GPUTextureDimension = '1d' | '2d' | '3d';
type GPUFeatureName = string;
type GPUErrorFilter = 'validation' | 'out-of-memory' | 'internal';

export {};
