import { MemoryPool } from "./MemoryPool";
import { JobType, AlgorithmType, EventType, Event, HeapElement, Job, MemoryBlock, HeapStatus } from "./Objects";

class MemorySimulation {
  smallJobPercentage: number;
  mediumJobPercentage: number;
  largeJobPercentage: number;
  statsSmallJob: number;
  statsMediumJob: number;
  statsLargeJob: number;
  memoryUnitSize: number;
  numberOfUnits: number;
  includeLostObjects: boolean;
  totalNumOfJobs: number = 0;
  jobsQueue: Array<Job> = [];
  eventsQueue: Array<Event> = [];
  simClock: number = 0;
  logLines: Array<string> = [];
  time: number = 0;
  preFillTime: number = 2000; // The amount of time to let jobs pre fill prior to sim start
  memoryPools: Array<MemoryPool> = [];

  constructor(smallJobNum: number, medJobNum: number, lgJobNum: number, memUnitSize: number, numOfUnits: number, includeLostObjects: boolean) {
    this.smallJobPercentage = smallJobNum;
    this.mediumJobPercentage = medJobNum;
    this.largeJobPercentage = lgJobNum;
    this.memoryUnitSize = memUnitSize;
    this.numberOfUnits = numOfUnits;
    this.includeLostObjects = includeLostObjects;
    this.statsSmallJob = 0;
    this.statsMediumJob = 0;
    this.statsLargeJob = 0;
  }

  public GenerateRandomNum(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public HeapGenerator(currentJob: Job, heapObjects: number) {
    for (let i: number = 0; i < heapObjects; i++) {
      let randomHeap: number = this.GenerateRandomNum(20, 50);
      let heapUnitSize: number = Math.ceil(randomHeap / this.memoryUnitSize);

      let heapObject: HeapElement = {
        id: i,
        heapMemorySize: randomHeap,
        memoryUnits: heapUnitSize,
        heapLifeTime: null,
        HeapLoc: [],
        status: HeapStatus.Start,
      };
      currentJob.heapElements.push(heapObject);
    }
  }

  public createJob(type: JobType, arrivalTime: number): Job {
    const runTime = this.GenerateRandomNum(type === JobType.Small ? 4 : type === JobType.Medium ? 9 : 24, type === JobType.Small ? 6 : type === JobType.Medium ? 11 : 26);
    const codeSize = this.GenerateRandomNum(type === JobType.Small ? 40 : type === JobType.Medium ? 60 : 120, type === JobType.Small ? 120 : type === JobType.Medium ? 160 : 220);
    const stackSize = this.GenerateRandomNum(type === JobType.Small ? 20 : type === JobType.Medium ? 40 : 60, type === JobType.Small ? 40 : type === JobType.Medium ? 80 : 120);

    const newJob: Job = {
      id: this.totalNumOfJobs,
      type: type,
      codeSize: codeSize,
      stackSize: stackSize,
      runTime: runTime,
      arrivalTime: arrivalTime,
      heapElements: [],
      codeLoc: [],
      stackLoc: [],
    };
    this.totalNumOfJobs++;
    return newJob;
  }

  public GenerateRandJobType() {
    let smallInterval: number = this.smallJobPercentage;
    let mediumInterval: number = this.smallJobPercentage + this.mediumJobPercentage;
    let currentNum: number = this.GenerateRandomNum(1, 100);

    if (currentNum <= smallInterval) {
      return JobType.Small;
    } else if (currentNum <= mediumInterval) {
      return JobType.Medium;
    } else {
      return JobType.Large;
    }
  }

  public fillSimulationJobs(): void {
    let arrival: number = 0;
    while (arrival < 100) {
      let type: JobType = this.GenerateRandJobType();
      switch (type) {
        case JobType.Small: {
          const newJob = this.createJob(type, arrival);
          this.HeapGenerator(newJob, newJob.runTime * 5);
          this.jobsQueue.push(newJob);
          this.statsSmallJob++;
          break;
        }
        case JobType.Medium: {
          const newJob = this.createJob(type, arrival);
          this.HeapGenerator(newJob, newJob.runTime * 10);
          this.jobsQueue.push(newJob);
          this.statsMediumJob++;
          break;
        }
        case JobType.Large: {
          const newJob = this.createJob(type, arrival);
          this.HeapGenerator(newJob, newJob.runTime * 25);
          this.jobsQueue.push(newJob);
          this.statsLargeJob++;
          break;
        }
        default:
          console.log("SOMETHINGS WRONG");
          break;
      }
      arrival += this.GenerateRandomNum(1, 5);
    }
  }

  public createEvent(type: EventType, arrivalTime: number, jobId: number, heapElementId: number | null) {
    const newEvent: Event = {
      type: type,
      arrivalTime: arrivalTime,
      jobId: jobId,
      heapElementId: heapElementId,
    };
    this.eventsQueue.push(newEvent);
  }

  public fillEventQueue(): void {
    this.jobsQueue.forEach((job) => {
      // Create Arrival Event
      this.createEvent(EventType.Arrival, job.arrivalTime, job.id, null);

      let heapArrival = job.arrivalTime;
      let heapAllocatedBatchSize = 0;

      job.heapElements.forEach((heapEl) => {
        if (heapAllocatedBatchSize === 50) {
          heapArrival++;
          heapAllocatedBatchSize = 0;
        }
        // Schedule Heap Allocation Event
        this.createEvent(EventType.HeapAllocation, heapArrival, job.id, heapEl.id);

        const heapTerminationTime = this.GenerateRandomNum(heapArrival + 1, job.arrivalTime + job.runTime - 1);
        this.createEvent(EventType.HeapTermination, heapTerminationTime, job.id, heapEl.id);

        heapAllocatedBatchSize++;
      });
      this.createEvent(EventType.Termination, job.arrivalTime + job.runTime, job.id, null);
    });
    this.eventsQueue.sort((eventA, eventB) => eventA.arrivalTime - eventB.arrivalTime);
  }

  public logInputs() {
    this.log(`---------- INPUTS ----------`);
    this.log(`Small Job %: ${this.smallJobPercentage}%`);
    this.log(`Med Job %: ${this.mediumJobPercentage}%`);
    this.log(`Large Job %: ${this.largeJobPercentage}%`);
    this.log(`Memory Unit Size: ${this.memoryUnitSize}`);
    this.log(`Total Memory Units: ${this.numberOfUnits}`);
    this.log(`Allow Lost Objects: ${this.includeLostObjects}`);
    this.log(`-----------------------------`);
  }

  public logStatistics(memoryPool: MemoryPool) {
    let totalMem: number = this.numberOfUnits * this.memoryUnitSize;
    let totalMemUsage: number = (memoryPool.allocatedMemoryUnits / totalMem) * 100;
    const FinalMap : Map<number,number> = memoryPool.GenerateMap();
    let externalFragmentation: number = FinalMap.size;
    let smallestFree = Infinity;
    let largestFree = -Infinity; // Start with an infinitely large value
    
    for (const value of FinalMap.values()) {
      if (value < smallestFree) {
      smallestFree = value;
      }
    }

    for (const value of FinalMap.values()) {
      if (value > largestFree) {
        largestFree = value;
      }
    }

    this.log(`${memoryPool.type} Pool`);
    this.log(`Number of Small Jobs: ${this.statsSmallJob}`);
    this.log(`Number of Medium Jobs: ${this.statsMediumJob}`);
    this.log(`Number of Large Jobs: ${this.statsLargeJob}`);
    this.log(`Total Memory Defined: ${this.numberOfUnits * this.memoryUnitSize}`);
    this.log(`Total Memory Allocated: ${memoryPool.allocatedMemoryUnits}`);
    this.log(`Percentage Memory Use: ${totalMemUsage}`);
    this.log(`Total Internal Fragmentation: ${memoryPool.totalInternalFragmentation}`);
    this.log(`Total External Fragmentation: ${externalFragmentation}`);
    this.log(`Smallest Free Space: ${smallestFree}`);
    this.log(`Largest Free Space: ${largestFree}`);
    this.log(`Failed Allocations: ${memoryPool.failedAllocations}`);
    this.log(`Algorithm Operations: ${memoryPool.AlgorithmOperations}`);
    this.log(`-----------------------------------`);
  }

  public startSimulation(): void {
    this.logInputs();
    this.fillSimulationJobs();
    this.fillEventQueue();

    const FFPool = new MemoryPool(AlgorithmType.FirstFit, this.numberOfUnits, this.memoryUnitSize);
    const NFPool = new MemoryPool(AlgorithmType.NextFit, this.numberOfUnits, this.memoryUnitSize);
    const BFPool = new MemoryPool(AlgorithmType.BestFit, this.numberOfUnits, this.memoryUnitSize);
    const WFPool = new MemoryPool(AlgorithmType.WorstFit, this.numberOfUnits, this.memoryUnitSize);
    this.memoryPools.push(FFPool, NFPool, BFPool, WFPool);

    //Prefill Memory for 2000 time units.
    //this.preFillMemory();

    var statisticBatchSize = 0;

    while (this.eventsQueue.length > 0) {
      const currentEvent: Event = this.eventsQueue.shift()!;
      const currentJob: Job = this.jobsQueue.find((job) => job.id === currentEvent.jobId)!;
      const currentHeapEl = currentJob.heapElements.find((heapEl) => heapEl.id === currentEvent.heapElementId);

      if (statisticBatchSize === 20) {
        statisticBatchSize = 0;
         this.memoryPools.forEach((pool) => {
          this.logStatistics(pool);
        });
      }

      switch (currentEvent.type) {
        case EventType.Arrival: {
          this.memoryPools.forEach((pool) => {
            const codeLoc = pool.handlePoolAllocation(currentJob.codeSize);
            const stackLoc = pool.handlePoolAllocation(currentJob.stackSize);
            if (codeLoc !== null && stackLoc !== null) {
              this.jobsQueue[currentJob.id].codeLoc.push({AlgType: pool.type, startLoc: codeLoc});
              this.jobsQueue[currentJob.id].stackLoc.push({AlgType: pool.type, startLoc: stackLoc});
              this.log(`${this.time}: Job ${currentJob.id} allocated Code at location ${codeLoc}, allocated Stack at location ${stackLoc} in ${pool.type} pool`);
            } else if (codeLoc !== null) {
              this.log(`${this.time}: ERROR ALLOCATING Stack for Job ${currentJob.id} in ${pool.type} pool`);
            } else {
              this.log(`${this.time}: ERROR ALLOCATING Code for Job ${currentJob.id} in ${pool.type} pool`);
            }
          });
          break;
        }
        case EventType.Termination: {
          this.memoryPools.forEach((pool) => {
            const codeLoc = currentJob.codeLoc.find((loc) => loc.AlgType === pool.type);
            const stackLoc = currentJob.stackLoc.find((loc) => loc.AlgType === pool.type);
            if (codeLoc !== undefined && stackLoc !== undefined) {
              pool.freeFF(codeLoc.startLoc, currentJob.codeSize);
              pool.freeFF(stackLoc.startLoc, currentJob.stackSize);
              this.log(`${this.time}: Job ${currentJob.id} freed Code at location ${codeLoc.startLoc}, freed Stack at location ${stackLoc.startLoc} in ${pool.type} pool`);
            } else if (codeLoc !== undefined && stackLoc === undefined) {
              pool.freeFF(codeLoc.startLoc, currentJob.codeSize);
              this.log(`${this.time}: Job ${currentJob.id} freed Code at location ${codeLoc.startLoc} in ${pool.type} pool`);
              this.log(`${this.time}: ERROR and Stack for Job ${currentJob.id} in ${pool.type} pool`);
            } else if (codeLoc === undefined && stackLoc !== undefined) {
              pool.freeFF(stackLoc.startLoc, currentJob.stackSize);
              this.log(`${this.time}: Job ${currentJob.id} freed Stack at location ${stackLoc.startLoc} in ${pool.type} pool`);
              this.log(`${this.time}: ERROR Freeing Code for Job ${currentJob.id} in ${pool.type} pool`);
            } else {
              this.log(`${this.time}: ERROR Freeing Code and Stack for Job ${currentJob.id} in ${pool.type} pool`);
            }
          });
          break;
        }
        case EventType.HeapAllocation: {
          this.memoryPools.forEach((pool) => {
            const heapLoc = pool.handlePoolAllocation(currentHeapEl!.memoryUnits);
            if (heapLoc !== null) {
              this.jobsQueue[currentJob.id].heapElements[currentHeapEl!.id].HeapLoc.push({AlgType: pool.type, startLoc: heapLoc});
              this.log(`${this.time}: Job ${currentEvent.jobId} allocated Heap El #${currentEvent.heapElementId} at location ${heapLoc} in ${pool.type} pool`);
            } else {
              this.log(`${this.time}: ERROR ALLOCATING heap element #${currentEvent.heapElementId} in ${pool.type} pool`);
            }
          });
          break;
        }
        case EventType.HeapTermination: {
           this.memoryPools.forEach((pool) => {
            const heapLocation = currentHeapEl!.HeapLoc.find((loc) => loc.AlgType === pool.type);
            if (heapLocation !== undefined) {
              pool.freeFF(heapLocation.startLoc, currentHeapEl!.heapMemorySize);
              this.log(`${this.time}: Job ${currentEvent.jobId} freed Heap El #${currentHeapEl?.id} at location ${heapLocation.startLoc} in ${pool.type} pool`);
            } else {
              this.log(`${this.time}: ERROR Terminating heap element #${currentHeapEl?.id} for Job ${currentEvent.jobId}`)
            }
          });
          break;
        }
        default:
          this.log(`${this.time}: ERROR handling Event`);
          break;
      }
      //Update statistics for each pool here.
      this.time++;
      statisticBatchSize++;
    }

    //End of loop, log each pool stats here.
    this.memoryPools.forEach((pool) => {
      this.logStatistics(pool);
    });
  }

  private preFillMemory() {
    //Prefill each pool here.
    var preFillCount = 0;
    while (preFillCount < this.preFillTime) {
      let type: JobType = this.GenerateRandJobType();
      const newJob = this.createJob(type, preFillCount);
      this.memoryPools.forEach(pool => {
       switch(pool.type) {
        case AlgorithmType.FirstFit: {
          pool.mallocFF(newJob.codeSize);
          pool.mallocFF(newJob.stackSize);
          break;  
        }
        case AlgorithmType.NextFit: {
          pool.mallocNF(newJob.codeSize);
          pool.mallocNF(newJob.stackSize);
          break;
        }
         case AlgorithmType.BestFit: {
          pool.mallocBF(newJob.codeSize);
          pool.mallocBF(newJob.stackSize);
          break;  
        }
          case AlgorithmType.WorstFit: {
          pool.mallocWF(newJob.codeSize);
          pool.mallocWF(newJob.stackSize);
        }    
       }
      });
      preFillCount += this.GenerateRandomNum(1, 5);
    }
  }

  public log(message: string): void {
    this.logLines.push(message);
  }

 
}

export { MemorySimulation };
