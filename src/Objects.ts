export enum JobType {
  Small = "SMALL",
  Medium = "MEDIUM",
  Large = "LARGE",
}

export enum HeapStatus {
  Start = "Start",
  Allocated = "ALLOCATED",
  Freed = "FREED",
}

export enum AlgorithmType {
  FirstFit = "FF",
  NextFit = "NF",
  BestFit = "BF",
  WorstFit = "WF",
}

export interface Location {
  AlgType: AlgorithmType;
  startLoc: number;
}

export enum EventType {
  Arrival = "Arrival",
  Termination = "Termination",
  HeapAllocation = "HA",
  HeapTermination = "HT",
}

export interface Event {
  type: EventType;
  jobId: number;
  arrivalTime: number;
  heapElementId: number | null;
}

export interface HeapElement {
  id: number;
  heapMemorySize: number;
  memoryUnits: number;
  heapLifeTime: number | null;
  HeapLoc: Array<Location>;
  status: HeapStatus;
}

export interface Job {
  type: JobType;
  id: number;
  runTime: number;
  codeSize: number;
  stackSize: number;
  heapElements: Array<HeapElement>;
  arrivalTime: number;
  codeLoc: Array<Location>;
  stackLoc: Array<Location>;
}

export interface MemoryBlock {
  size: number;
  allocatedSize: number;
  free: boolean;
}
