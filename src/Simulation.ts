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

  public createSmallJob( currentJob: Job) {
      currentJob.type = JobType.Small;
      currentJob.codeSize = this.GenerateRandomNum(40,80);
      currentJob.stackSize = this.GenerateRandomNum(20,40);
      currentJob.runTime = this.GenerateRandomNum(4,6);

      this.HeapGenerator(currentJob, 5);
      
  }

  public createMediumJob( currentJob: Job) {
    currentJob.type = JobType.Medium;
    currentJob.codeSize = this.GenerateRandomNum(60,120);
    currentJob.stackSize = this.GenerateRandomNum(40,80);
    currentJob.runTime = this.GenerateRandomNum(9,11);

    this.HeapGenerator(currentJob, 10);
  }

  public createLargeJob( currentJob: Job) {
    currentJob.type = JobType.Large;
    currentJob.codeSize = this.GenerateRandomNum(120,220);
    currentJob.stackSize = this.GenerateRandomNum(60,120);
    currentJob.runTime = this.GenerateRandomNum(24,26);

    this.HeapGenerator(currentJob, 15);
    
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
                break;
              case ("MEDIUM"):
                console.log("MEDIUM");
                break;
              case ("LARGE"):
                console.log("LARGE");
                break;
              default:
                console.log("SOMETHINGS WRONG");
                break;
            }
        }
  }
}

export { MemorySimulation };
