import { AlgorithmType, MemoryBlock } from "./Objects";

export class MemoryPool {
  memoryBlocks: Array<MemoryBlock> = [];
  type: AlgorithmType;
  totalMemoryUnits: number;
  freeMemoryUnits: number;
  allocatedMemoryUnits: number = 0;
  requiredMemoryUnits: number = 0;
  memUnitSize:number  = 0;
  totalJobsProcessed: number = 0;
  nextFitPointer: number = 0;
  failedAllocations: number = 0;
  AlgorithmOperations: number = 0;
  totalInternalFragmentation: number = 0; //Tracks wasted space within allocated memory units.
  totalexternalFragmentation: number = 0; //Tracks scattered free blocks that cannot satisfy a request.

  constructor(type: AlgorithmType, totalSize: number, memoryUnitSize: number) {
    this.type = type;
    this.totalMemoryUnits = totalSize;
    this.freeMemoryUnits = totalSize;
    this.memUnitSize = memoryUnitSize;

    for (var i = 0; i < this.totalMemoryUnits; i++) {
      var newBlock: MemoryBlock = {
        size: memoryUnitSize,
        free: true,
      };
      this.memoryBlocks.push(newBlock);
    }
  }

  public freeFF(location: number, size: number): void {
    var startBlock = this.memoryBlocks[location];
    var numOfBlocks = size / startBlock.size;

    var tempLocation = location;

    while(numOfBlocks > 0 && tempLocation < this.memoryBlocks.length) {
      this.memoryBlocks[tempLocation].free = true;
      numOfBlocks--;
      tempLocation++;
    }

  }

  public handlePoolAllocation(size: number): number | null {
    switch (this.type) {
      case AlgorithmType.FirstFit: {
        return this.mallocFF(size);
      }
      case AlgorithmType.NextFit: {
        return this.mallocNF(size);
      }
      case AlgorithmType.BestFit: {
        return this.mallocBF(size);
      }
      case AlgorithmType.WorstFit: {
        return this.mallocWF(size);
      }
    }
  }

  public GenerateMap(): Map<number,number>  {
    const freeBlocksMap: Map<number, number> = new Map();
    for (let i = 0; i < this.memoryBlocks.length; i++) {
      const currBlock = this.memoryBlocks[i];
      if (currBlock.free) {
        let startLocation = i;
        let blockSize = 0;

        while (i < this.memoryBlocks.length && this.memoryBlocks[i].free) {
          blockSize += this.memoryBlocks[i].size;
          i++;
        }

        freeBlocksMap.set(startLocation, blockSize);
      }
    }
    return freeBlocksMap;
  }

  public mallocNF(sizeRequested: number): number | null {
    let TempMap : Map<number,number> = this.GenerateMap();
    this.requiredMemoryUnits += sizeRequested;

    for (const [startLocation, blockSize] of TempMap.entries()) {
      this.AlgorithmOperations++;
      if (blockSize >= sizeRequested && startLocation >= this.nextFitPointer) {
        let allocSize : number = Math.ceil(sizeRequested / this.memUnitSize) * this.memUnitSize;
        this.allocatedMemoryUnits += allocSize;
        this.nextFitPointer = startLocation;
        let i: number = this.nextFitPointer;
        let tempSize : number = allocSize;
        while (tempSize > 0) {
          this.memoryBlocks[i].free = false;
          tempSize -= this.memUnitSize;
          i++;
        }
        return startLocation;
      }
    }
    this.failedAllocations++;
    return null;
  }
  

  public mallocFF(sizeRequested: number): number | null {
    let TempMap : Map<number,number> = this.GenerateMap();
    this.requiredMemoryUnits += sizeRequested;

    for (const [startLocation, blockSize] of TempMap.entries()) {
      this.AlgorithmOperations++;
      if (blockSize >= sizeRequested) {
        let allocSize : number = Math.ceil(sizeRequested / this.memUnitSize) * this.memUnitSize;
        this.allocatedMemoryUnits += allocSize;
        let i : number = startLocation;
        let tempSize: number = allocSize;
        while (tempSize > 0) {
          this.memoryBlocks[i].free = false;
          tempSize -= this.memUnitSize;
          i++;
        }
        return startLocation;
      }
    }
    this.failedAllocations++;
    return null;
  }

  public mallocWF(sizeRequested: number): number | null {
    let TempMap : Map<number,number> = this.GenerateMap();
    this.requiredMemoryUnits += sizeRequested;
    let largestBlockSize : number = 0, startLoc : number = 0;

    for (const [startLocation, blockSize] of TempMap.entries()) {
      this.AlgorithmOperations++;
      if (blockSize >= sizeRequested && blockSize > largestBlockSize) {
        largestBlockSize = blockSize;
        startLoc = startLocation;
      }
    }
    if (largestBlockSize > 0) {
      let allocSize : number = Math.ceil(sizeRequested / this.memUnitSize) * this.memUnitSize;
      this.allocatedMemoryUnits += allocSize;
      let i :number = startLoc;
      let tempSize: number = allocSize;
      while (tempSize > 0) {
        this.memoryBlocks[i].free = false;
        tempSize -= this.memUnitSize;
        i++;
      }

      return startLoc;
    }
    else {
      this.failedAllocations++;
      return null;}
  }

  public mallocBF(sizeRequested: number): number | null {
    let TempMap : Map<number,number> = this.GenerateMap();
    this.requiredMemoryUnits += sizeRequested;
    let smallestBlockSize : number = Infinity, startLoc : number = 0;

    for (const [startLocation, blockSize] of TempMap.entries()) {
      this.AlgorithmOperations++;
      if (blockSize >= sizeRequested && blockSize < smallestBlockSize) {
        smallestBlockSize = blockSize;
        startLoc = startLocation;
      }
    }
    if (smallestBlockSize < Infinity) {
      let allocSize : number = Math.ceil(sizeRequested / this.memUnitSize) * this.memUnitSize;
      this.allocatedMemoryUnits += allocSize;
      let i :number = startLoc;
      let tempSize: number = allocSize;
      while (tempSize > 0) {
        this.memoryBlocks[i].free = false;
        tempSize -= this.memUnitSize;
        i++;
      }

      return startLoc;
    }
    else {
      this.failedAllocations++;
      return null;}
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
