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
  
export enum EventType {
  Arrival = "Arrival",
  Termination = "Termination",
  HeapAllocation = "HA",
  HeapTermination = "HT",
}
  
export interface Event {
  type: EventType;
  job: Job;
  arrivalTime: number;
  heapElement: HeapElement | null;
}
  
export interface HeapElement {
  id: number;
  heapMemorySize: number;
  memoryUnits: number;
  heapLifeTime: number | null;
  locationFF: number | null;
  locationNF: number | null;
  locationWF: number | null;
  locationBF: number | null;
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
  codeLocation: number | null;
  stackLocation: number | null;
}
  
export  interface MemoryBlock {
  location: number;
  size: number;
  free: boolean;
}
  
export class MemoryPool {
  memoryBlocks: Array<MemoryBlock> = [];
  type: AlgorithmType;
  totalMemoryUnits: number;
  freeMemoryUnits: number;
  allocatedMemoryUnits: number = 0;
  totalJobsProcessed: number = 0;
  nextFitPointer: number = 0;
  internalFragmentation: number = 0; //Tracks wasted space within allocated memory units.
  externalFragmentation: number = 0; //Tracks scattered free blocks that cannot satisfy a request.

  constructor(type: AlgorithmType, totalSize: number) {
    this.type = type;
    this.totalMemoryUnits = totalSize;
    this.freeMemoryUnits = totalSize;
  }

  public logPool(): Array<string> {
    const rows: string[] = [];
    const rowSize = 15;

    for (let i = 0; i < this.memoryBlocks.length; i += rowSize) {
      const rowBlocks = this.memoryBlocks.slice(i, i + rowSize);

      let rowString = "[ ";
      rowBlocks.forEach((block, index) => {
          rowString += `[${block.free ? " " : "X"}] `;
          if (index < rowBlocks.length - 1) {
              rowString += "| ";
          }
      });
      rowString += "]";

      rows.push(rowString);
    }

    return rows;
  }
}