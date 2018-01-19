using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProcessorSimulation.Device;
using PluginApi;

namespace NumberDisplayDevice
{
    class NumberDisplayPlugin : IDevicePlugin
    {
        public string Name => "Number Display";

        public string PluginId => "NumberDisplay";

        public IDevice CreateDevice() => new NumberDisplayDevice();

        /// <remarks>Since html5, style tags are allowed in the body tag.</remarks>
        public string DeviceTemplate(byte slot) =>
            $@"<style>
/*Segments of a 7-Segement Display*/
.poly{{
    fill: white;
    stroke:#AAAAAA;
    stroke-width:1;
}}
/*Number Display*/
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

//set both 7-Segement Display blank
$('#poly11-{slot}').css(""fill"", ""white"");
$('#poly12-{slot}').css(""fill"", ""white"");
$('#poly13-{slot}').css(""fill"", ""white"");
$('#poly14-{slot}').css(""fill"", ""white"");
$('#poly15-{slot}').css(""fill"", ""white"");
$('#poly16-{slot}').css(""fill"", ""white"");
$('#poly17-{slot}').css(""fill"", ""white"");

$('#poly21-{slot}').css(""fill"", ""white"");
$('#poly22-{slot}').css(""fill"", ""white"");
$('#poly23-{slot}').css(""fill"", ""white"");
$('#poly24-{slot}').css(""fill"", ""white"");
$('#poly25-{slot}').css(""fill"", ""white"");
$('#poly26-{slot}').css(""fill"", ""white"");
$('#poly27-{slot}').css(""fill"", ""white"");

//get binary value of input value
var binary = Stebs.convertNumber(data.Data, 2, 8);
var leftDisplay = binary.slice(0, 4);
var rightDisplay = binary.slice(4, 8);

//set data display 
$('#poly-data-{slot}').text(binary.slice(0, 4) + '\'' + binary.slice(4, 8));

//change 7-Segement Display depending on input value
switch (leftDisplay) {{
    case '0000':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly12-{slot}').css(""fill"", ""black "");
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        $('#poly17-{slot}').css(""fill"", ""black "");
        break;
    case '0001':
        $('#poly12-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        break;
    case '0010':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly12-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        $('#poly17-{slot}').css(""fill"", ""black "");
        break;
    case '0011':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly12-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        break;
    case '0100':
        $('#poly12-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        break;
    case '0101':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        break;
    case '0110':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        $('#poly17-{slot}').css(""fill"", ""black "");
        break;
    case '0111':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly12-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        break;
    case '1000':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly12-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        $('#poly17-{slot}').css(""fill"", ""black "");
        break;
    case '1001':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly12-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        break;
    case '1010':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly12-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        $('#poly17-{slot}').css(""fill"", ""black "");
        break;
    case '1011':
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        $('#poly17-{slot}').css(""fill"", ""black "");
        break;
    case '1100':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        $('#poly17-{slot}').css(""fill"", ""black "");
        break;
    case '1101':
        $('#poly12-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly15-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        $('#poly17-{slot}').css(""fill"", ""black "");
        break;
    case '1110':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly16-{slot}').css(""fill"", ""black "");
        $('#poly17-{slot}').css(""fill"", ""black "");
        break;
    case '1111':
        $('#poly11-{slot}').css(""fill"", ""black "");
        $('#poly13-{slot}').css(""fill"", ""black "");
        $('#poly14-{slot}').css(""fill"", ""black "");
        $('#poly17-{slot}').css(""fill"", ""black "");
        break;
}}    


switch (rightDisplay) {{
    case '0000':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly22-{slot}').css(""fill"", ""black "");
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        $('#poly27-{slot}').css(""fill"", ""black "");
        break;
    case '0001':
        $('#poly22-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        break;
    case '0010':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly22-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        $('#poly27-{slot}').css(""fill"", ""black "");
        break;
    case '0011':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly22-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        break;
    case '0100':
        $('#poly22-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        break;
    case '0101':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        break;
    case '0110':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        $('#poly27-{slot}').css(""fill"", ""black "");
        break;
    case '0111':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly22-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        break;
    case '1000':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly22-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        $('#poly27-{slot}').css(""fill"", ""black "");
        break;
    case '1001':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly22-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        break;
    case '1010':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly22-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        $('#poly27-{slot}').css(""fill"", ""black "");
        break;
    case '1011':
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        $('#poly27-{slot}').css(""fill"", ""black "");
        break;
    case '1100':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        $('#poly27-{slot}').css(""fill"", ""black "");
        break;
    case '1101':
        $('#poly22-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly25-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        $('#poly27-{slot}').css(""fill"", ""black "");
        break;
    case '1110':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly26-{slot}').css(""fill"", ""black "");
        $('#poly27-{slot}').css(""fill"", ""black "");
        break;
    case '1111':
        $('#poly21-{slot}').css(""fill"", ""black "");
        $('#poly23-{slot}').css(""fill"", ""black "");
        $('#poly24-{slot}').css(""fill"", ""black "");
        $('#poly27-{slot}').css(""fill"", ""black "");
        break;
}}

}});
</script>";
    }
}
