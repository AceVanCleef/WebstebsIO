using ProcessorSimulation.Device;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SevenSegmentDisplayDevice
{
    public class SevenSegmentDisplayDevice : DefaultDevice
    {
        private byte data = 0;

        public override void Input(byte input)
        {
            data = input;
            View.UpdateView(new SevenSegmentDisplayUpdate(input));
        }
        public override byte Output() => data;


        public override void Reset() {
            Input(0x00);
            Input(0x80);
        }
    }
}
