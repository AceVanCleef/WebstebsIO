using ProcessorSimulation.Device;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/// <experiment>
/// Tried to add additional variables which were supposed to 
/// be useable from within the javascript code in CharacterViewerPlugin.cs
/// 
/// What is possible and known so far:
/// - View.UpdateView(IDeviceUpdate update) sends updates to Client, 
///     hence to the plugin's browser representation.
/// What is NOT working so far:
/// - I added another variable (character) which should be useable
///     in javascript code of CharacterViewerPlugin.cs.
///     But for unkown reason, a call such as...
///     o console.log(character) or
///     o console.log(character.Char) does NOT work.
///     Todo: Why?
///     
/// Therefore, logic has potentially to be implemented in javascript.
/// </experiment>

namespace CharacterViewerDevice
{
    public class CharacterViewerDevice : DefaultDevice
    {

        private byte data = 0;

        //Für IN xx
        public override void Input(byte input)
        {
            data = input;
            View.UpdateView(new CharacterViewerUpdate(input));
        }

        //Für OUT xx
        public override byte Output() => data;

        
        public override void Reset() => Input(0xff);


    }
}
