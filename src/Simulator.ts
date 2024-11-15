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
    for (let i: number = 1; i <= heapObjects; i++) {
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

  public createJob(type: JobType, code: number, stack: number, runTime: number, arrivalTime: number): Job {
    this.totalNumOfJobs++;
    const newJob: Job = {
      id: this.totalNumOfJobs,
      type: type,
      codeSize: code,
      stackSize: stack,
      runTime: runTime,
      arrivalTime: arrivalTime,
      heapElements: [],
      codeLoc: [],
      stackLoc: [],
    };
    return newJob;
  }

  public GenerateRandJobType() {
    let smallInterval: number = this.smallJobPercentage;
    let mediumInterval: number = this.smallJobPercentage + this.mediumJobPercentage;
    let currentNum: number = this.GenerateRandomNum(1, 100);

    if (currentNum <= smallInterval) {
      return "SMALL";
    } else if (currentNum <= mediumInterval) {
      return "MEDIUM";
    } else {
      return "LARGE";
    }
  }

  public fillSimulationJobs(): void {
    let i: number;
    let arrival: number = 0;
    while (arrival < 100) {
      let type: string = this.GenerateRandJobType();
      switch (type) {
        case JobType.Small: {
          const newJob = this.createJob(type, this.GenerateRandomNum(40, 80), this.GenerateRandomNum(20, 40), this.GenerateRandomNum(4, 6), arrival);
          this.HeapGenerator(newJob, newJob.runTime * 5);
          this.jobsQueue.push(newJob);
          this.statsSmallJob++;
          break;
        }
        case JobType.Medium: {
          const newJob = this.createJob(type, this.GenerateRandomNum(60, 120), this.GenerateRandomNum(40, 80), this.GenerateRandomNum(9, 11), arrival);
          this.HeapGenerator(newJob, newJob.runTime * 10);
          this.jobsQueue.push(newJob);
          this.statsMediumJob++;
          break;
        }
        case JobType.Large: {
          const newJob = this.createJob(type, this.GenerateRandomNum(120, 220), this.GenerateRandomNum(60, 120), this.GenerateRandomNum(24, 26), arrival);
          this.HeapGenerator(newJob, newJob.runTime * 15);
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

  public createEvent(type: EventType, arrivalTime: number, job: Job, heapElement: HeapElement | null) {
    const newEvent: Event = {
      type: type,
      arrivalTime: arrivalTime,
      job: job,
      heapElement: heapElement,
    };
    this.eventsQueue.push(newEvent);
    this.logEvents(newEvent);
  }

  public fillEventQueue(): void {
    this.jobsQueue.forEach((job) => {
      // Create Arrival Event
      this.createEvent(EventType.Arrival, job.arrivalTime, job, null);

      let heapArrival = job.arrivalTime;
      let heapAllocatedBatchSize = 0;

      job.heapElements.forEach((heapEl) => {
        if (heapAllocatedBatchSize === 50) {
          heapArrival++;
          heapAllocatedBatchSize = 0;
        }

        // Schedule Heap Allocation Event
        this.createEvent(EventType.HeapAllocation, heapArrival, job, heapEl);

        const heapTerminationTime = this.GenerateRandomNum(heapArrival + 1, job.arrivalTime + job.runTime - 1);

        this.createEvent(EventType.HeapTermination, heapTerminationTime, job, heapEl);

        heapAllocatedBatchSize++;
      });

      this.createEvent(EventType.Termination, job.arrivalTime + job.runTime, job, null);
    });

    this.eventsQueue.sort((eventA, eventB) => eventA.arrivalTime - eventB.arrivalTime);
  }

  public startSimulation(): void {
    this.fillSimulationJobs();
    this.fillEventQueue();

    const FFPool = new MemoryPool(AlgorithmType.FirstFit, this.numberOfUnits, this.memoryUnitSize);
    const NFPool = new MemoryPool(AlgorithmType.NextFit, this.numberOfUnits, this.memoryUnitSize);
    const BFPool = new MemoryPool(AlgorithmType.BestFit, this.numberOfUnits, this.memoryUnitSize);
    const WFPool = new MemoryPool(AlgorithmType.WorstFit, this.numberOfUnits, this.memoryUnitSize);
    this.memoryPools.push(FFPool, NFPool, BFPool, WFPool);

    while (this.eventsQueue.length > 0) {
      let currentEvent: Event = this.eventsQueue.shift()!;

      switch (currentEvent?.type) {
        case EventType.Arrival: {
          this.memoryPools.forEach((pool) => {
            pool.allocatePool(currentEvent.job.codeSize);
            pool.allocatePool(currentEvent.job.stackSize);
          });
          break;
        }
        case EventType.Termination: {
          break;
        }
        case EventType.HeapAllocation: {
          this.memoryPools.forEach((pool) => {
            pool.allocatePool(currentEvent.heapElement!.memoryUnits);
          });
          break;
        }
        case EventType.HeapTermination: {
          break;
        }
        default:
          break;
      }
      //Track statistics?
      this.simClock++;
    }

    console.log(this.eventsQueue);
  }

  public logEvents(event: Event) {
    this.log(`${event.type} Event`);
    this.log(`Arrival Time at ${event.arrivalTime} for Job ${event.job.id}`);
    this.log(`Run Time: ${event.heapElement?.heapLifeTime ?? event.job.runTime}`);
    this.log(`Job Stack Size: ${event.job.stackSize}`);
    this.log(`Job Code Size: ${event.job.codeSize}`);
    this.log(`Heap Memory Size: ${event.heapElement?.heapMemorySize}`);
    this.log(`Heap Memory Units: ${event.heapElement?.memoryUnits}`);
    this.log(`-----------------------------------`);
  }

  public log(message: string): void {
    this.logLines.push(message);
  }

  public logStatistics(memBlock: MemoryPool) {
    let totalMem: number = this.numberOfUnits * this.memoryUnitSize;
    let totalMemUsage: number = (memBlock.allocatedMemoryUnits / totalMem) * 100;

    this.log(`${memBlock.type} MemBlock`);
    this.log(`Number of Small Jobs: ${this.statsSmallJob}`);
    this.log(`Number of Medium Jobs: ${this.statsMediumJob}`);
    this.log(`Number of Large Jobs: ${this.statsLargeJob}`);
    this.log(`Total Memory Defined: ${this.numberOfUnits * this.memoryUnitSize}`);
    this.log(`Total Memory Allocated: ${memBlock.allocatedMemoryUnits}`);
    this.log(`Percentage Memory Use: ${totalMemUsage}`);
    this.log(`Total Internal Fragmentation: ${memBlock.internalFragmentation}`);
    this.log(`Total External Fragmentation: ${memBlock.externalFragmentation}`);
    this.log(`-----------------------------------`);
  }
}

export { MemorySimulation };
