import { ReactNode, useState } from "react";
import { MemorySimulation } from "./Simulator";


function App() {
  const [smallJobNum, setSmallJobNum] = useState(0);
  const [mediumJobNum, setMediumJobNum] = useState(0);
  const [LargeJobNum, setLargeJobNum] = useState(0);
  const [memoryUnitSize, setMemoryUnitSize] = useState(0);
  const [numberOfUnits, setNumberOfUnits] = useState(0);
  const [lostObjects, setLostObjects] = useState(false);
  const [testName, setTestName] = useState("");
  const [showLogError, setShowLogError] = useState(false);
  const [simulation, setSimulation] = useState<MemorySimulation | null>(null);
  
  const startSimulation = (smallJobNum: number, mediumJobNum: number, largeJobNum: number, memoryUnitSize: number, numberOfUnits: number, lostObjects: boolean, callBackFn: Function): void => {
    const newSimulation = new MemorySimulation(smallJobNum, mediumJobNum, largeJobNum, memoryUnitSize, numberOfUnits, lostObjects);
    if ((smallJobNum + mediumJobNum + largeJobNum) !== 100) {
      setShowLogError(true);
      return;
    }
    else if (memoryUnitSize % 8 !== 0) {
      setShowLogError(true);
      return;
    }
    else {
      setShowLogError(false);
    }

    newSimulation.startSimulation();
    setSimulation(newSimulation);
    callBackFn();
  };

  return (
    <div className="flex-1 h-screen w-screen place-content-center bg-[#0c1227]">
      <h1 className="text-white text-center text-2xl mb-10">Welcome to Assignment 2 CIS 450</h1>
      <div className="flex justify-center">
        <div className="flex-col col-span-1 space-y-5"> 
          { showLogError &&
            <div className="flex flex-col col-span-1 text-center">
              <span className="text-red-500 text-lg">ERROR: VERIFY INPUT CRITERIA</span>
            </div>
          }
            <div className="flex flex-col col-span-1 text-center">
              <span className="text-blue-400 text-lg">PERCENTAGES MUST ADD UP TO 100</span>
            </div>
          <div className="flex flex-col col-span-1">
            <label className="text-white">Enter Percentage of Small Jobs</label>
            <input
              onChange={(event) => {
                setSmallJobNum(parseInt(event.target.value));
              }}
              className="bg-[#fdfdff] rounded-sm"
              name={"SmallJobPercentage"}
              type="number"
              required
            />
          </div>
          <div className="flex flex-col col-span-1">
            <label className="text-white">Enter Percentage of Medium Jobs</label>
            <input
              onChange={(event) => {
                setMediumJobNum(parseInt(event.target.value));
              }}
              className="bg-[#fdfdff] rounded-sm"
              name={"MediumJobPercentage"}
              type="number"
              required
            />
          </div>
          <div className="flex flex-col col-span-1">
            <label className="text-white">Enter Percentage of Large Jobs</label>
            <input
              onChange={(event) => {
                setLargeJobNum(parseInt(event.target.value));
              }}
              className="bg-[#fdfdff] rounded-sm"
              name={"LargeJobPercentage"}
              type="number"
              required
            />
          </div>
          <div className="flex flex-col col-span-1">
            <label className="text-white">Enter Memory Unit Size (multiple of 8)</label>
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
            <div className="flex flex-col col-span-1">
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
          </div>
            <button
              className="bg-white p-1 rounded-sm"
              onClick={() => {
                startSimulation(smallJobNum, mediumJobNum, LargeJobNum, memoryUnitSize, numberOfUnits, lostObjects, () => {
                  if (simulation !== null) {
                    const output = simulation!.logLines.join("\r\n");
                    const element = document.createElement("a");
                    const file = new Blob([output], { type: "text/plain" });
                    element.href = URL.createObjectURL(file);
                    element.download = testName;
                    element.click();
                  }
                });
              }}
            >
            Run Simulation
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
