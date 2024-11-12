import {JobType, AlgorithmType, EventType, Event, HeapElement, Job, MemoryBlock, MemoryPool, HeapStatus} from './Objects'; 

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
  time: number = 0;
  preFillTime: number = 2000; // The amount of time to let jobs pre fill prior to sim start 
  memoryPools: Array<MemoryPool> | null = null;

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
        locationFF: null, locationBF: null, locationWF: null, locationNF: null,
        status: HeapStatus.Start, };
      currentJob.heapElements.push(heapObject);
    }
  }

  public createJob(
    type: JobType,
    code: number,
    stack: number,
    runTime: number,
    arrivalTime: number,
    
  ): Job {
    const newJob: Job = {
      type: type,
      codeSize: code,
      stackSize: stack,
      runTime: runTime,
      arrivalTime: arrivalTime,
      heapElements: [],
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
    while (arrival < 100) {
      let type: string = this.GenerateRandJobType();
      switch (type) {
        case JobType.Small: {
          const newJob = this.createJob(
            type,
            this.GenerateRandomNum(40, 80),
            this.GenerateRandomNum(20, 40),
            this.GenerateRandomNum(4, 6),
            arrival
          );
          this.HeapGenerator(newJob, newJob.runTime * 5);
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
            arrival
          );
          this.HeapGenerator(newJob, newJob.runTime * 10);
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
            arrival
          );
          this.HeapGenerator(newJob, newJob.runTime * 15);
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
    this.jobsQueue.forEach((job) => {
      // Create Arrival Event
      this.createEvent(EventType.Arrival, job.arrivalTime, job, null);
  
      // Create Termination Event (job's run time)
      this.createEvent(EventType.Termination, job.arrivalTime + job.runTime, job, null);
  
      let heapArrival = job.arrivalTime;
      let heapAllocatedBatchSize = 0;
  
      job.heapElements.forEach((heapEl) => {
        
        if (heapAllocatedBatchSize === 50) {
          heapArrival++; 
          heapAllocatedBatchSize = 0;
        }
  
        // Schedule Heap Allocation Event
        this.createEvent(EventType.HeapAllocation, heapArrival, job, heapEl);
       
        const heapTerminationTime = this.GenerateRandomNum(
          heapArrival + 1,  
          (job.arrivalTime + job.runTime - 1)
        );
  
       
        this.createEvent(EventType.HeapTermination, heapTerminationTime, job, heapEl);
  
        
        heapAllocatedBatchSize++;
      });
    });
  
   
    this.eventsQueue.sort((eventA, eventB) => eventA.arrivalTime - eventB.arrivalTime);
  }
  
  public startSimulation(): void {
    let SimClock: number = 0;
    this.fillSimulationJobs();
    this.fillEventQueue();

    // While EventsList isn't empty
    //Pop off the next event and decrement based on its event type
    //When allocating, you must allocate that object

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
