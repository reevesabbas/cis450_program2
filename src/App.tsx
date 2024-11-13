import { memo, useState } from "react";
import { MemorySimulation } from "./Simulator";

function App() {
  const [jobAllocation, setJobAllocation] = useState("");
  const [memoryUnitSize, setMemoryUnitSize] = useState(0);
  const [numberOfUnits, setNumberOfUnits] = useState(0);
  const [lostObjects, setLostObjects] = useState(false);
  const [testName, setTestName] = useState("");
  const [completedInput, setCompletedInput] = useState(false);
  const [simulation, setSimulation] = useState<MemorySimulation | null>(null);

  const startSimulation = (
    jobAllocation: string,
    memoryUnitSize: number,
    numberOfUnits: number,
    lostObjects: boolean
  ): void => {
    const jobAllocations = jobAllocation.trim().split("\n");
    const smallJobPercentage = parseInt(jobAllocations.shift()!);
    const mediumJobPercentage = parseInt(jobAllocations.shift()!);
    const largeJobPercentage = parseInt(jobAllocations.shift()!);
    const newSimulation = new MemorySimulation(
      smallJobPercentage,
      mediumJobPercentage,
      largeJobPercentage,
      memoryUnitSize,
      numberOfUnits,
      lostObjects
    );
    setSimulation(newSimulation);
    newSimulation.startSimulation();
  };

  return (
    <div className="flex-1 h-screen w-screen place-content-center bg-[#0c1227]">
      <h1 className="text-white text-center text-2xl mb-20">
        Welcome to Assignment 2 CIS 450
      </h1>
      <div className="flex justify-center">
        <div className="flex-col col-span-1 space-y-5">
          <div className="flex flex-col col-span-1">
            <label className="text-white">Enter Job Allocations</label>
            <textarea
              onChange={(event) => {
                setJobAllocation(event.target.value);
              }}
              className="bg-[#fdfdff] rounded-sm h-24 w-100 mb-5"
              name={"JobAllocationInput"}
              required
            />
          </div>
          <div className="flex flex-col col-span-1">
            <label className="text-white">
              Enter Memory Unit Size (multiple of 8)
            </label>
            <input
              onChange={(event) => {
                setMemoryUnitSize(parseInt(event.target.value));
              }}
              className="bg-[#fdfdff] rounded-sm"
              name={"MemoryUnitSizeInput"}
              type="number"
              required
            />
          </div>
          <div className="flex flex-col col-span-1">
            <label className="text-white">Enter Total Memory Units</label>
            <input
              onChange={(event) => {
                setNumberOfUnits(parseInt(event.target.value));
              }}
              className="bg-[#fdfdff] rounded-sm"
              name={"TotalMemoryUnitsInput"}
              type="number"
              required
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-white">Allow Lost Objects?</label>
            <input
              onChange={(event) => {
                setLostObjects(event.target.checked);
              }}
              className="bg-[#fdfdff] size-5 rounded-sm"
              name={"LostObjectsCheckbox"}
              type="checkbox"
              required
            />
          </div>
          <div>
            <div className="flex flex-col col-span-1 mb-5">
              <label className="text-white">Test Name</label>
             <input
              onChange={(event) => {
                setTestName(event.target.value);
              }}
              className="bg-[#fdfdff] rounded-sm"
              name={"TestNameInput"}
              type="text"
              required
            />
            </div>
            <button
              className="bg-white p-1 rounded-sm"
              onClick={() => {
                startSimulation(
                  jobAllocation,
                  memoryUnitSize,
                  numberOfUnits,
                  lostObjects
                );
                setTimeout(() => {
                  const output = simulation!.logLines.join("\r\n");
                  const element = document.createElement("a");
                  const file = new Blob([output], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = testName;
                  element.click();
                }, 500)
              }}
            >
              Run Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
