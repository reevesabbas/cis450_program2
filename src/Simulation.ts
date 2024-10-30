enum JobType {
  Small = "SMALL",
  Medium = "MEDIUM",
  Large = "LARGE",
}

interface HeapElement {
  id: number;
  heapMemorySize: number;
  unitLifeTime: number;
  heapMemoryUnit: number;
}

interface Job {
  type: JobType;
  runTime: number;
  codeSize: number;
  stackSize: number;
  heapElements: Array<HeapElement>;
  arrivalTime: number;

}

class MemorySimulation {
  smallJobPercentage: number;
  mediumJobPercentage: number;
  largeJobPercentage: number;
  memoryUnitSize: number;
  numberOfUnits: number;
  includeLostObjects: boolean;
  jobsQueue: Array<Job>;


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

  public HeapGenerator( currentJob: Job, heapobjects: number) {
      let i: number;
      for (i = 0; i < heapobjects; i++) {
        let randomHeap: number = this.GenerateRandomNum(20,50);
        let heapUnitSize: number = Math.ceil(randomHeap / 8);
        let heapObject: HeapElement = 
        { id: i, 
          heapMemorySize: randomHeap, 
          heapMemoryUnit: heapUnitSize, 
          unitLifeTime: 0};
        currentJob.heapElements.push(heapObject);
      }

  }

  public createSmallJob() {
      
      let job : JobType = JobType.Small;
      let code: number = this.GenerateRandomNum(40,80);
      let stack: number = this.GenerateRandomNum(20,40);
      let run: number = this.GenerateRandomNum(4,6);
      let array: Array<HeapElement> = [];
      

      let currentJob: Job = {
        type: job, 
        codeSize: code, 
        stackSize: stack, 
        runTime: run, 
        heapElements: array, 
        arrivalTime: 0
      }

      this.HeapGenerator(currentJob, 5); 
      return currentJob;
  }

  public createMediumJob() {
      
    let job : JobType = JobType.Medium;
    let code: number = this.GenerateRandomNum(60,120);
    let stack: number = this.GenerateRandomNum(40,80);
    let run: number = this.GenerateRandomNum(9,11);
    let array: Array<HeapElement> = [];
    

    let currentJob: Job = {
      type: job, 
      codeSize: code, 
      stackSize: stack, 
      runTime: run, 
      heapElements: array, 
      arrivalTime: 0
    }

    this.HeapGenerator(currentJob, 10); 
    return currentJob;
}


public createLargeJob() {
      
  let job : JobType = JobType.Large;
  let code: number = this.GenerateRandomNum(120,220);
  let stack: number = this.GenerateRandomNum(60,120);
  let run: number = this.GenerateRandomNum(24,26);
  let array: Array<HeapElement> = [];
  

  let currentJob: Job = {
    type: job, 
    codeSize: code, 
    stackSize: stack, 
    runTime: run, 
    heapElements: array, 
    arrivalTime: 0
  }

  this.HeapGenerator(currentJob, 15); 
  return currentJob;
}


  public GenerateRandJobType () {
      let smallInterval: number = this.smallJobPercentage;
      let mediumInterval: number = this.smallJobPercentage + this.mediumJobPercentage;
      let currentNum: number = this.GenerateRandomNum(1, 100);

      if (currentNum <= smallInterval) {
        return "SMALL";
      }
      else if (currentNum <= mediumInterval) {
        return "MEDIUM";
      }
      else {
        return "LARGE";
      }
  }
  public startSimulation(): void {
        let arrival: number = 0;
        let i: number;
        for (i = 0; i < 10; i++) {
            let type: string = this.GenerateRandJobType();

            switch(type) {

              case ("SMALL"):
                console.log("SMALL");
                let newJob: Job = this.createSmallJob();
                newJob.arrivalTime = arrival;
                this.jobsQueue.push(newJob);
                
                break;
              case ("MEDIUM"):
                console.log("MEDIUM");
                let newJobmed: Job = this.createMediumJob();
                newJobmed.arrivalTime = arrival;
                this.jobsQueue.push(newJobmed);
                break;
              case ("LARGE"):
                console.log("LARGE");
                let newJoblg: Job = this.createLargeJob();
                newJoblg.arrivalTime = arrival;
                this.jobsQueue.push(newJoblg);
                break;
              default:
                console.log("SOMETHINGS WRONG");
                break;
            }
            arrival += this.GenerateRandomNum(1,5);
        }
  }
}

export { MemorySimulation };
