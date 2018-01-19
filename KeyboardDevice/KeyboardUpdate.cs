using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProcessorSimulation.Device;

namespace KeyboardDevice
{
    class KeyboardUpdate : IDeviceUpdate
    {
        public byte Data { get; }
        public KeyboardUpdate(byte data)
        {
            this.Data = data;
        }
    }
}
