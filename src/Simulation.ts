enum JobType {
  Small = "SMALL",
  Medium = "MEDIUM",
  Large = "LARGE",
}

//Setup Event Types and Queues

enum AlgorithmType {
  FirstFit = "FF",
  NextFit = "NF",
  BestFit = "BF",
  WorstFit = "WF",
}

enum EventType {
  Arrival = "Arrival",
  Termination = "Termination",
  HeapAllocation = "HA",
  HeapTermination = "HT",
}

interface Event {
  type: EventType;
  job: Job;
  arrivalTime: number;
  heapElement: HeapElement | null;
}

interface HeapElement {
  id: number;
  heapMemorySize: number;
  memoryUnits: number;
  heapLifeTime: number;
  location: number | null;
}

interface Job {
  type: JobType;
  runTime: number;
  codeSize: number;
  stackSize: number;
  heapElements: Array<HeapElement>;
  arrivalTime: number;
  codeLocation: number | null;
  stackLocation: number | null;
}

interface MemoryBlock {
  location: number;
  size: number;
  free: boolean;
}

class MemorySimulation {
  smallJobPercentage: number;
  mediumJobPercentage: number;
  largeJobPercentage: number;
  memoryUnitSize: number;
  numberOfUnits: number;
  includeLostObjects: boolean;
  jobsQueue: Array<Job> = [];
  eventsQueue: Array<Event> = [];
  logLines: Array<string> = [];
  totalJobs: number = 0; // Counter for # of jobs processed.
  time: number = 0;
  preFillTime: number = 0; // The amount of time to let jobs pre fill prior to sim start
  memoryPool: Array<number> = [];
  allocatedMemoryUnits: number = 0;
  freeMemoryUnits: number;
  firstFitMemoryPool: Array<MemoryBlock> | null = null;
  nextFitMemoryPool: Array<MemoryBlock> | null = null;
  bestFitMemoryPool: Array<MemoryBlock> | null = null;
  worstFitMemoryPool: Array<MemoryBlock> | null = null;

  constructor(
    smallJobNum: number,
    medJobNum: number,
    lgJobNum: number,
    memUnitSize: number,
    numOfUnits: number,
    includeLostObjects: boolean
  ) {
    this.smallJobPercentage = smallJobNum;
    this.mediumJobPercentage = medJobNum;
    this.largeJobPercentage = lgJobNum;
    this.memoryUnitSize = memUnitSize;
    this.numberOfUnits = numOfUnits;
    this.includeLostObjects = includeLostObjects;
  }

  public GenerateRandomNum(min: number, max: number): number {
    return Math.floor(Math.random() * max) + min;
  }

  public HeapGenerator(currentJob: Job, heapObjects: number) {
    for (let i: number = 1; i <= heapObjects; i++) {
      let randomHeap: number = this.GenerateRandomNum(20, 50);
      let heapUnitSize: number = Math.ceil(randomHeap / this.memoryUnitSize);
      let randomTimeUnit: number = this.GenerateRandomNum(
        currentJob.runTime - (currentJob.runTime - 1),
        currentJob.runTime
      );
      let heapObject: HeapElement = {
        id: i,
        heapMemorySize: randomHeap,
        memoryUnits: heapUnitSize,
        heapLifeTime: randomTimeUnit,
        location: null,
      };
      currentJob.heapElements.push(heapObject);
    }
  }

  public createJob(
    type: JobType,
    code: number,
    stack: number,
    runTime: number,
    arrivalTime: number,
    heapElements: Array<HeapElement>
  ): Job {
    const newJob: Job = {
      type: type,
      codeSize: code,
      stackSize: stack,
      runTime: runTime,
      arrivalTime: arrivalTime,
      heapElements: heapElements,
      codeLocation: null,
      stackLocation: null,
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
    for (i = 0; i < 1; i++) {
      let type: string = this.GenerateRandJobType();
      switch (type) {
        case JobType.Small: {
          const newJob = this.createJob(
            type,
            this.GenerateRandomNum(40, 80),
            this.GenerateRandomNum(20, 40),
            this.GenerateRandomNum(4, 6),
            arrival,
            []
          );
          this.HeapGenerator(newJob, newJob.runTime * 50);
          this.jobsQueue.push(newJob);
          this.logJob(newJob);
          break;
        }
        case JobType.Medium: {
          const newJob = this.createJob(
            type,
            this.GenerateRandomNum(60, 120),
            this.GenerateRandomNum(40, 80),
            this.GenerateRandomNum(9, 11),
            arrival,
            []
          );
          this.HeapGenerator(newJob, newJob.runTime * 100);
          this.jobsQueue.push(newJob);
          this.logJob(newJob);
          break;
        }
        case JobType.Large: {
          const newJob = this.createJob(
            type,
            this.GenerateRandomNum(120, 220),
            this.GenerateRandomNum(60, 120),
            this.GenerateRandomNum(24, 26),
            arrival,
            []
          );
          this.HeapGenerator(newJob, newJob.runTime * 250);
          this.jobsQueue.push(newJob);
          this.logJob(newJob);
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
      heapElement: heapElement
    };
    this.eventsQueue.push(newEvent);
  }

  public fillEventQueue(): void {
    this.jobsQueue.forEach((job, index) => {
      this.createEvent(EventType.Arrival, job.arrivalTime, job, null);
      
      var heapArrival = job.arrivalTime;
      var heapAllocatedBatchSize = 0;
      
      job.heapElements.forEach((heapEl) => {
        var heapTermination = heapArrival + heapEl.heapLifeTime;
        this.createEvent(EventType.HeapAllocation, heapArrival, job, heapEl);
        this.createEvent(EventType.HeapTermination, heapTermination, job, heapEl);
        heapAllocatedBatchSize++;
        if (heapAllocatedBatchSize === 50) {
          heapArrival++;
          heapAllocatedBatchSize = 0;
        }
      });
      this.createEvent(
        EventType.Termination,
        job.arrivalTime + job.runTime,
        job,
        null
      );
    });
      this.eventsQueue.sort((eventA, eventB) => eventA.arrivalTime - eventB.arrivalTime);
  }

  public startSimulation(): void {
    this.fillSimulationJobs();
    this.fillEventQueue();
    console.log(this.eventsQueue);
    
  }

  public logJob(newJob: Job) {
    this.log(`${newJob.type} Job`);
    this.log(`Run Time: ${newJob.runTime}`);
    this.log(`Code Size: ${newJob.codeSize}`);
    this.log(`Stack Size: ${newJob.stackSize}`);
    this.log(`Heap Elements: ${newJob.heapElements.length}`);
    newJob!.heapElements.map((el) => {
      this.log(
        `Heap Element ${el.id}: ${el.heapMemorySize} memory            ${el.heapMemorySize} memory units lifetime: ${el.heapLifeTime} time units`
      );
    });
    this.log(`-----------------------------------`);
  }

  public log(message: string): void {
    this.logLines.push(message);
  }
}

export { MemorySimulation };
