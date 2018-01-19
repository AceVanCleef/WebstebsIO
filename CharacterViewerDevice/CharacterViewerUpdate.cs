using ProcessorSimulation.Device;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CharacterViewerDevice
{
    class CharacterViewerUpdate : IDeviceUpdate
    {
        public byte Data { get; }
        public CharacterViewerUpdate(byte data)
        {
            this.Data = data;
        }
    }
}
