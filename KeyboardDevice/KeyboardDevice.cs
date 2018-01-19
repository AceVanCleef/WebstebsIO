using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProcessorSimulation.Device;

namespace KeyboardDevice
{
    public class KeyboardDevice : DefaultDevice
    {
        private byte data = 0;

        //Für IN xx
        public override void Input(byte input)
        {
            data = input;
            View.UpdateView(new KeyboardUpdate(input));
        }

        //Für OUT xx
        public override byte Output() => data;


        public override void Reset() => Input(0xff);

        public override void Update(string input, string interruptEnabled)
        {
            data = Convert.ToByte(input);
            if (interruptEnabled == "true")
            { 
                Interrupt();
            }
        }
        public override void Update(string input)
        {
            data = Convert.ToByte(input);
            Interrupt();
        }
    }
}
