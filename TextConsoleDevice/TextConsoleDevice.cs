using ProcessorSimulation.Device;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TextConsoleDevice
{
    public class TextConsoleDevice : DefaultDevice
    {
        private byte data = 0;

        //Für IN xx
        public override void Input(byte input)
        {
            data = input;
            View.UpdateView(new TextConsoleUpdate(input));
        }

        //Für OUT xx
        public override byte Output() => data;

        /// <summary>
        /// when reset/reassembling, sends 1111'1111 to Input() 
        /// which means data.Data == 1111'1111.
        /// </summary>
        public override void Reset() => Input(0xff);
    }
}
