using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProcessorSimulation.Device;
using PluginApi;

namespace SevenSegmentDisplayDevice
{
    class SevenSegmentDisplayPlugin : IDevicePlugin
    {
        public string Name => "7-Segment Display";

        public string PluginId => "7SegmentDisplay";

        public IDevice CreateDevice() => new SevenSegmentDisplayDevice();

        /// <remarks>Since html5, style tags are allowed in the body tag.</remarks>
        public string DeviceTemplate(byte slot) =>
            $@"<style>
/*Segments of a 7-Segement Display*/
.poly{{
    fill: white;
    stroke:#AAAAAA;
    stroke-width:1;
}}
/*7-Segement Display*/
.polys{{
    height: 100px;
    width: 56px;
    transform-origin: left top;
    margin-bottom: 12px;
}}
/*binary data*/
.poly-data {{
    font-size: 25px;
    float:right;
    margin-right: 35px;
    margin-top: 36px;
}}
.polyContainer{{
    padding-left: 12px;
}}
</style>
<!--outer div to keep everything together-->
<div class=""polyContainer"">
<!--left 7-Segement Display-->
<svg id=""polys1-{slot}"" class=""polys"">
    <polygon class=""poly"" id=""poly11-{slot}"" points=""5,4 9,1 44,1 48,4 44,8 9,8"" />
    <polygon class=""poly"" id=""poly12-{slot}"" points=""50,5 54,9 54,44 50,48 46,44 46,44 46,9"" />
    <polygon class=""poly"" id=""poly13-{slot}"" points=""5,50 9,46 45,46 48,50 44,54 9,54"" />
    <polygon class=""poly"" id=""poly14-{slot}"" points=""4,5 8,9 8,44 4,48 1,44 1,9"" />
    <polygon class=""poly"" id=""poly15-{slot}"" points=""50,51 54,55 54,90 50,94 46,89 46,89 46,55"" />
    <polygon class=""poly"" id=""poly16-{slot}"" points=""5,96 9,92 44,92 48,96 44,100 9,100"" />
    <polygon class=""poly"" id=""poly17-{slot}"" points=""4,51 8,55 8,90 4,94 1,90 1,55"" />
</svg>
<!--right 7-Segement Display-->
<svg id=""polys2-{slot}"" class=""polys"">
    <polygon class=""poly"" id=""poly21-{slot}"" points=""5,4 9,1 44,1 48,4 44,8 9,8"" />
    <polygon class=""poly"" id=""poly22-{slot}"" points=""50,5 54,9 54,44 50,48 46,44 46,44 46,9"" />
    <polygon class=""poly"" id=""poly23-{slot}"" points=""5,50 9,46 45,46 48,50 44,54 9,54"" />
    <polygon class=""poly"" id=""poly24-{slot}"" points=""4,5 8,9 8,44 4,48 1,44 1,9"" />
    <polygon class=""poly"" id=""poly25-{slot}"" points=""50,51 54,55 54,90 50,94 46,89 46,89 46,55"" />
    <polygon class=""poly"" id=""poly26-{slot}"" points=""5,96 9,92 44,92 48,96 44,100 9,100"" />
    <polygon class=""poly"" id=""poly27-{slot}"" points=""4,51 8,55 8,90 4,94 1,90 1,55"" />
</svg>
<!--data display-->
<div class=""poly-data"">
    <!--default value 0000'0000-->
    <span id=""poly-data-{slot}"">0000'0000</span>
</div>
</div>
<script>
Stebs.registerDevice({slot}, function(data){{
//get binary value of input value
var binary = Stebs.convertNumber(data.Data, 2, 8)

//set data display 
$('#poly-data-{slot}').text(binary.slice(0, 4) + '\'' + binary.slice(4, 8));

//the left display is default display 
var MSB = 1;

//first bit of byte decides if left or right display 0 = left 1 = right
if(parseInt(binary.slice(0, 1))) {{ MSB = 2; }}


//iteration over the remaining 7 bits
//if bit = 1 then the associated segement is on
for (var i = 1; i < 8; i++){{
     if(parseInt(binary.slice(i, i+1))==1){{
       $('#poly'+ MSB + i + ""-{slot}"").css(""fill"", ""black"");
    }}else {{
       $('#poly'+ MSB + i + ""-{slot}"").css(""fill"", ""white"");
    }}
}}
}});
</script>";
    }
}
