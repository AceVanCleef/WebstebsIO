using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProcessorSimulation.Device;

namespace NumberDisplayDevice
{
    class NumberDisplayUpdate : IDeviceUpdate
    {
        public byte Data { get; }
        public NumberDisplayUpdate(byte data) { this.Data = data; }
    }
}
