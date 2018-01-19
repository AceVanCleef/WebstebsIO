using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProcessorSimulation
{
    public class ProcessorState : IProcessorState
    {
        public ProcessorState(IDictionary<Registers, IRegister> registers, int mpmAddress, AluCmd aluCommand)
        {
            this.Registers = registers;
            this.MpmAddress = mpmAddress;
            this.AluCommand = aluCommand;
        }
        public KeyValuePair<byte?, byte> MemoryChange { get; set; }
        public IDictionary<Registers, IRegister> Registers { get; set; }
        public int MpmAddress { get; set; }
        public AluCmd AluCommand { get; set; }
    }
}
