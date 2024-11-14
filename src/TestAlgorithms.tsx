import { AlgorithmType, MemoryBlock, MemoryPool } from "./Objects";
import {mallocBF, mallocFF, mallocNF, mallocWF} from './MemAlgorithms';
import { useState,useEffect } from "react";

function Tester () {
    const [logPool, setLogPool] = useState<Array<String>>([]);
    
    useEffect(() => {
        const MemBlockFF = new MemoryPool(AlgorithmType.FirstFit, 16);
        mallocFF(MemBlockFF, 5);
        setLogPool(MemBlockFF.logPool());

    }, []);
    

    return (
     <div>
         {logPool};
    </div>
    )
    
    

    

   
} 


export default Tester