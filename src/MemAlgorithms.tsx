// MemoryAlgorithms.ts

import {JobType, AlgorithmType, EventType, Event, HeapElement, Job, MemoryBlock, MemoryPool} from './Objects';

export function mallocFF(memoryPool: MemoryPool, size: number): number | null {
  const startingPosition = 0;
  let freeUnitCount = 0;

  for (let i = 0; i < memoryPool.memoryBlocks.length; i++) {
    const memoryBlock = memoryPool.memoryBlocks[startingPosition];
    if (memoryBlock.free) {
      freeUnitCount += memoryBlock.size;
      if (freeUnitCount === size) {
        for (let i = 0; i < size; i++) {
          memoryPool.memoryBlocks[memoryBlock.location + i].free = false;
        }
        return memoryBlock.location;
      }
    } else {
      freeUnitCount = 0;
    }
  }
  return null;
}

export function mallocNF(memoryPool: MemoryPool, size: number): number | null {
  const startingPosition = memoryPool.nextFitPointer;
  let freeUnitCount = 0;

  for (let i = 0; i < memoryPool.memoryBlocks.length; i++) {
    const memoryBlock = memoryPool.memoryBlocks[startingPosition];
    if (memoryBlock.free) {
      freeUnitCount += memoryBlock.size;
      if (freeUnitCount === size) {
        for (let i = 0; i < size; i++) {
          memoryPool.memoryBlocks[memoryBlock.location + i].free = false;
        }
        memoryPool.nextFitPointer = memoryBlock.location;
        return memoryBlock.location;
      }
    } else {
      freeUnitCount = 0;
    }
  }
  return null;
}

export function mallocWF(memoryPool: MemoryPool, size: number): number | null {
  const freeBlocksMap: Map<number, number> = new Map();

  for (let i = 0; i < memoryPool.memoryBlocks.length; i++) {
    const currBlock = memoryPool.memoryBlocks[i];
    if (currBlock.free) {
      let startLocation = i;
      let blockSize = 0;

      while (i < memoryPool.memoryBlocks.length && memoryPool.memoryBlocks[i].free) {
        blockSize += memoryPool.memoryBlocks[i].size;
        i++;
      }

      freeBlocksMap.set(startLocation, blockSize);
    }
  }

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

  let remainingSize = size;
  for (let i = largestFreeBlockStart; remainingSize > 0 && i < memoryPool.memoryBlocks.length; i++) {
    if (memoryPool.memoryBlocks[i].free) {
      memoryPool.memoryBlocks[i].free = false;
      remainingSize -= memoryPool.memoryBlocks[i].size;
    }
  }

  return largestFreeBlockStart;
}

export function mallocBF(memoryPool: MemoryPool, size: number): number | null {
  const freeBlocksMap: Map<number, number> = new Map();

  for (let i = 0; i < memoryPool.memoryBlocks.length; i++) {
    const currBlock = memoryPool.memoryBlocks[i];
    if (currBlock.free) {
      let startLocation = i;
      let blockSize = 0;

      while (i < memoryPool.memoryBlocks.length && memoryPool.memoryBlocks[i].free) {
        blockSize += memoryPool.memoryBlocks[i].size;
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

  let remainingSize = size;
  for (let i = smallestFreeBlockStart; remainingSize > 0 && i < memoryPool.memoryBlocks.length; i++) {
    if (memoryPool.memoryBlocks[i].free) {
      memoryPool.memoryBlocks[i].free = false;
      remainingSize -= memoryPool.memoryBlocks[i].size;
    }
  }

  return smallestFreeBlockStart;
}
