using ProcessorSimulation.Device;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TextConsoleDevice
{
    class TextConsoleUpdate : IDeviceUpdate
    {
        public byte Data { get; }
        public TextConsoleUpdate(byte data)
        {
            this.Data = data;
        }
    }
}
