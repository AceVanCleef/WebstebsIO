using PluginApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProcessorSimulation.Device;

namespace CharacterViewerDevice
{
    class CharacterViewerPlugin : IDevicePlugin
    {
        public string Name => "Character Viewer";

        public string PluginId => "CharacterViewer";

        public IDevice CreateDevice()
        {
            return new CharacterViewerDevice();
        }

        public string DeviceTemplate(byte slot) =>

$@"<style>

</style>

<div class=""character-viewer"">
<p>Character: </br>
    <span id=""character-{slot}"">-</span>
</p>
<p>ASCII-Value: </br>
    <span id=""data-{slot}"">0</span>
</p>
</div>
<script>
    Stebs.registerDevice({slot}, function(data){{
        $('#data-{slot}').text(data.Data);
        //is it an ASCII - character?
        if (data.Data > 0 && data.Data <= 127) {{
            $('#character-{slot}').text( String.fromCharCode(data.Data) );
        }} else {{
            $('#character-{slot}').text('invalid');
        }}
}});
</script>";
    }
}
