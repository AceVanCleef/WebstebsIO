﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProcessorSimulation
{
    public enum SimulationStepSize
    {
        Micro = 0,
        Macro = 1,
        Instruction = 2,
        UndoMicro = 3,
        UndoMacro = 4,
        UndoInstruction = 5
    }
}
