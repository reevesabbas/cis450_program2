import { AlgorithmType, MemoryBlock } from "./Objects";

export class MemoryPool {
  memoryBlocks: Array<MemoryBlock> = [];
  type: AlgorithmType;
  totalMemoryUnits: number;
  freeMemoryUnits: number;
  allocatedMemoryUnits: number = 0;
  requiredMemoryUnits: number = 0;
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

    for (var i = 0; i < this.totalMemoryUnits; i++) {
      var newBlock: MemoryBlock = {
        allocatedSize: 0,
        size: memoryUnitSize,
        free: true,
      };
      this.memoryBlocks.push(newBlock);
    }
  }

  public freeFF(location: number): void {}

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

  public mallocFF(sizeRequested: number): number | null {
    this.requiredMemoryUnits += sizeRequested;
    const startingPosition = 0;
    let freeUnitCount = 0;

    for (let i = startingPosition; i < this.memoryBlocks.length-1; i++) {
      const memoryBlock = this.memoryBlocks[i];
      if (memoryBlock.free) {
        freeUnitCount += memoryBlock.size;
        if (freeUnitCount >= sizeRequested) {
          this.allocatedMemoryUnits += freeUnitCount;
          const finalBlockLoc = i;
          const requiredBlocks = Math.ceil(sizeRequested / memoryBlock.size);
          for (let n = finalBlockLoc; n >= requiredBlocks - (finalBlockLoc+1); n--) {
            this.memoryBlocks[n].free = false;
          }
          return i - finalBlockLoc;
        }
      } else {
        freeUnitCount = 0;
      }
    }
    this.failedAllocations++;
    return null;
  }

  public mallocNF(size: number): number | null {
    this.requiredMemoryUnits += size;
    const startingPosition = this.nextFitPointer;
    let freeUnitCount = 0;

    for (let i = startingPosition; i < this.memoryBlocks.length-1; i++) {
      const memoryBlock = this.memoryBlocks[i];
      if (memoryBlock.free) {
        freeUnitCount += memoryBlock.size;
        if (freeUnitCount >= size) {
          this.allocatedMemoryUnits += freeUnitCount;
          for (let i = 0; i < size; i++) {
            this.memoryBlocks[i].free = false;
          }
          this.nextFitPointer = i;
          return i;
        }
      } else {
        freeUnitCount = 0;
      }
    }
    return null;
  }

  public mallocWF(size: number): number | null {
    const freeBlocksMap : Map<number,number> = this.GenerateMap();
    this.requiredMemoryUnits += size;
    let largestFreeBlockStart: number | null = null;
    let largestBlockSize = 0;

    for (const [startLocation, blockSize] of freeBlocksMap.entries()) {
      if (blockSize >= size && blockSize > largestBlockSize) {
        largestFreeBlockStart = startLocation;
        largestBlockSize = blockSize;
      }
    }

    if (largestFreeBlockStart === null) {
      return null;
    }
    this.allocatedMemoryUnits += largestBlockSize;
    let remainingSize = size;
    for (let i = largestFreeBlockStart; remainingSize > 0 && i < this.memoryBlocks.length; i++) {
      if (this.memoryBlocks[i].free) {
        this.memoryBlocks[i].free = false;
        remainingSize -= this.memoryBlocks[i].size;
      }
    }

    return largestFreeBlockStart;
  }

  public mallocBF(size: number): number | null {
    this.requiredMemoryUnits += size;
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

    let smallestFreeBlockStart: number | null = null;
    let smallestBlockSize = Infinity;

    for (const [startLocation, blockSize] of freeBlocksMap.entries()) {
      if (blockSize >= size && blockSize < smallestBlockSize) {
        smallestFreeBlockStart = startLocation;
        smallestBlockSize = blockSize;
      }
    }

    if (smallestFreeBlockStart === null) {
      return null;
    }

    this.allocatedMemoryUnits += smallestBlockSize;
    let remainingSize = size;
    for (let i = smallestFreeBlockStart; remainingSize > 0 && i < this.memoryBlocks.length; i++) {
      if (this.memoryBlocks[i].free) {
        this.memoryBlocks[i].free = false;
        remainingSize -= this.memoryBlocks[i].size;
      }
    }

    return smallestFreeBlockStart;
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
