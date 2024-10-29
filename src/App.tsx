import { memo, useState } from "react";
import { MemorySimulation } from "./Simulation";

function App() {
  const [jobAllocation, setJobAllocation] = useState("");
  const [memoryUnitSize, setMemoryUnitSize] = useState(0);
  const [numberOfUnits, setNumberOfUnits] = useState(0);
  const [lostObjects, setLostObjects] = useState(false);
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
  };

  return (
    <div className="flex-1 h-screen w-screen place-content-center bg-[#0c1227]">
      {!completedInput ? (
        <>
          <h1 className="text-white text-center text-2xl mb-20">
            Welcome to Assignment 2 CIS 450
          </h1>
          <div className="flex justify-center">
            <div className="flex-col col-span-1">
              <div className="mb-1">
                <label className="text-white">Enter Job Allocations</label>
              </div>
              <textarea
                onChange={(event) => {
                  setJobAllocation(event.target.value);
                }}
                className="bg-[#fdfdff] rounded-sm h-24 w-100 mb-5"
                name={"JobAllocation"}
                required
              />
              <div className="mb-1">
                <label className="text-white">
                  Enter Memory Unit Size (multiple of 8)
                </label>
              </div>
              <input
                onChange={(event) => {
                  setMemoryUnitSize(parseInt(event.target.value));
                }}
                className="bg-[#fdfdff] rounded-sm"
                name={"MemoryUnitSize"}
                type="number"
                required
              />
              <div className="my-2">
                <label className="text-white">Enter Number of Units</label>
              </div>
              <input
                onChange={(event) => {
                  setNumberOfUnits(parseInt(event.target.value));
                }}
                className="bg-[#fdfdff] rounded-sm"
                name={"MemoryUnitSize"}
                type="number"
                required
              />
              <div className="my-2">
                <label className="text-white">Allow Lost Objects?</label>
              </div>
              <input
                onChange={(event) => {
                  setLostObjects(event.target.checked);
                }}
                className="bg-[#fdfdff] rounded-sm"
                name={"MemoryUnitSize"}
                type="checkbox"
                required
              />
              <div className="mt-10">
                <button
                  className="bg-white p-2 rounded-sm"
                  onClick={() => {
                    startSimulation(
                      jobAllocation,
                      memoryUnitSize,
                      numberOfUnits,
                      lostObjects
                    );
                    setCompletedInput(true);
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-full justify-center text-center text-white mb-5 whitespace-pre-wrap">
            <div className="flex relative justify-items-center mx-auto w-[70%] h-[70%] bg-[#090c14] rounded-xl">
              <button
                className="absolute top-3 right-3 text-white text-2xl"
                onClick={() => {
                  setCompletedInput(false);
                }}
              >
                X
              </button>
              <div className="flex w-full h-full p-2 overflow-scroll">
                <div className="flex-col col-span-1">return log lines here</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
