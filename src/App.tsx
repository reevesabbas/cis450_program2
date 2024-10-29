import { useState } from "react";

function App() {
  const [processInput, setProcessInput] = useState("");
  const [timeQuantumInput, setTimeQuantumInput] = useState(0);
  const [completedInput, setCompletedInput] = useState(false);

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
                <label className="text-white">Enter Process Inputs</label>
              </div>
              <textarea
                onChange={(event) => {
                  setProcessInput(event.target.value);
                }}
                className="bg-[#fdfdff] rounded-sm h-24 w-100 mb-5"
                name={"TimeQuantumInput"}
                required
              />
              <div className="mb-1">
                <label className="text-white">Enter Time Quantum</label>
              </div>
              <input
                onChange={(event) => {
                  setTimeQuantumInput(parseInt(event.target.value));
                }}
                className="bg-[#fdfdff] rounded-sm"
                name={"TimeQuantumInput"}
                required
              />
              <div className="mt-10">
                <button
                  className="bg-white p-2 rounded-sm"
                  onClick={() => {
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
          <div className="w-full justify-center text-center text-white mb-5 whitespace-pre-wrap"></div>
        </>
      )}
    </div>
  );
}

export default App;
