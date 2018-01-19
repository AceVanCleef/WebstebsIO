using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProcessorSimulation
{
    public interface IProcessorState
    {
        KeyValuePair<byte?,byte> MemoryChange { get; set; }
        IDictionary<Registers, IRegister> Registers { get; set; }
        int MpmAddress { get; set; }
        AluCmd AluCommand { get; set; }
    }
}
