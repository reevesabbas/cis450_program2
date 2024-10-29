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

  public startSimulation(): void {
 
  }
}

export { MemorySimulation };
