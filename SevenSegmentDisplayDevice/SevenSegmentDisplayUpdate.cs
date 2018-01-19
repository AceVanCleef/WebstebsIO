using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProcessorSimulation.Device;

namespace SevenSegmentDisplayDevice
{
    class SevenSegmentDisplayUpdate : IDeviceUpdate
    {
        public byte Data { get; }
        public SevenSegmentDisplayUpdate(byte data) { this.Data = data; }
    }
}
