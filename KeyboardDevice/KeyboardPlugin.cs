using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProcessorSimulation.Device;
using PluginApi;

namespace KeyboardDevice
{
    class KeyboardPlugin : IDevicePlugin
    {
        public string Name => "Keyboard";

        public string PluginId => "Keyboard";

        public IDevice CreateDevice()
        {
            return new KeyboardDevice();
        }

        public string DeviceTemplate(byte slot) =>

$@"<style>
.key{{
	background-color: #555555;
	width: 20px;
	height: 21px;
	font-size: 14px;
	display: block;
	float: left;
	color: white;
	margin-left:2px;
	padding-left: 3px;
	cursor: default;
}}
.key:hover {{
	background-color: white;
	color: black;
}}
.keyRow{{
clear: both;
background-color: black;
height: 41px;
width: 540px;
}}
.keyRow1{{
clear: both;
background-color: black;
height: 23px;
padding-top: 1px;
width: 310px;
margin-top: 8px;
}}
.keyRow2{{
clear: both;
background-color: black;
height: 23px;
width: 283px;
margin-left: 20px;
}}
.keyRow3{{
clear: both;
background-color: black;
height: 22px;
width: 265px;
margin-left: 37px;
}}
.keyRow4{{
clear: both;
background-color: black;
height: 23px;
padding-top: 1px;
padding-left: 1px;
width: 292px;
}}
.keyRow5{{
clear: both;
background-color: black;
height: 23px;
width: 126px;
margin-left: 80px;
margin-bottom: 8px;
}}
.keyShift {{
	background-color: #555555;
	width: 35px;
	height: 21px;
	font-size: 14px;
	display: block;
	float: left;
	padding-left: 3px;
	color: white;
	margin-left: 2px;
	margin-top: 0px;
	cursor: default;
}}
.keyShift:hover {{
	background-color: white;
	color: black;
}}
.keySpace {{
	background-color: #555555;
	width: 120px;
	height: 21px;
	font-size: 14px;
	display: block;
	float: left;
	padding-left: 2px;
	color: white;
	padding-left:2px;
	margin-left:2px;
	cursor: default;
}}
.keySpace:hover {{
	background-color: white;
	color: black;
}}
.keyEnter {{
	background-color: #555555;
	width: 21px;
	height: 36px;
	font-size: 14px;
	display: block;
	float: left;
	padding: 4px;
	color: white;
	position:absolute;
	left: 275px;
	top:64px;
	border: 2px solid black;
	cursor: default;
}}
.keyEnter:hover {{
	background-color: white;
	color: black;
}}

.keyBS {{
	background-color: #555555;
	width: 28px;
	height: 21px;
	font-size: 14px;
	display: block;
	float: left;
	padding-left: 3px;
	color: white;
	margin-left:2px;
	cursor: default;
}}
.keyBS:hover {{
	background-color: white;
	color: black;
}}
.menuKeyboard {{
    margin-bottom: 8px;
    font-size: 14px;
}}
.menuKeyboard .fa-toggle-on {{
    margin-left: 8px;
    margin-top: 2px;
    float:left;

}}
.menuKeyboard .fa-toggle-off {{
    margin-left: 8px;
    margin-top: 2px;
    float:left;
}}
.menuKeyboard .keyboardOutput {{
    font-size: 14px;
    float:right;
    margin-right: 8px;
}}
.keyboardEnable {{
    margin-left: 8px;
}}
</style>
<div class=""keyRow1"" id=""key"">
    <div class=""key"" id=""key-1-{slot}"">1</div>
    <div class=""key"" id=""key-2-{slot}"">2</div>
    <div class=""key"" id=""key-3-{slot}"">3</div>
    <div class=""key"" id=""key-4-{slot}"">4</div>
    <div class=""key"" id=""key-5-{slot}"">5</div>
    <div class=""key"" id=""key-6-{slot}"">6</div>
    <div class=""key"" id=""key-7-{slot}"">7</div>
    <div class=""key"" id=""key-8-{slot}"">8</div>
    <div class=""key"" id=""key-9-{slot}"">9</div>
    <div class=""key"" id=""key-0-{slot}"">0</div>
    <div class=""key"" id=""key-Quest-{slot}"">?</div>
    <div class=""keyBS"" id=""key-BS-{slot}"">BS</div>
</div>
<div class=""keyRow2"">
    <div class=""key"" id=""key-q-{slot}"">q</div>
    <div class=""key"" id=""key-w-{slot}"">w</div>
    <div class=""key"" id=""key-e-{slot}"">e</div>
    <div class=""key"" id=""key-r-{slot}"">r</div>
    <div class=""key"" id=""key-t-{slot}"">t</div>
    <div class=""key"" id=""key-z-{slot}"">z</div>
    <div class=""key"" id=""key-u-{slot}"">u</div>
    <div class=""key"" id=""key-i-{slot}"">i</div>
    <div class=""key"" id=""key-o-{slot}"">o</div>
    <div class=""key"" id=""key-p-{slot}"">p</div>
</div>
    <div class=""keyEnter"" id=""key-Enter-{slot}"">Ent</div>
<div class=""keyRow3"">
    <div class=""key"" id=""key-a-{slot}"">a</div>
    <div class=""key"" id=""key-s-{slot}"">s</div>
    <div class=""key"" id=""key-d-{slot}"">d</div>
    <div class=""key"" id=""key-f-{slot}"">f</div>
    <div class=""key"" id=""key-g-{slot}"">g</div>
    <div class=""key"" id=""key-h-{slot}"">h</div>
    <div class=""key"" id=""key-j-{slot}"">j</div>
    <div class=""key"" id=""key-k-{slot}"">k</div>
    <div class=""key"" id=""key-l-{slot}"">l</div>
</div>
<div class=""keyRow4"">
    <div class=""keyShift"" id=""key-Shift-{slot}"">Shift</div>
    <div class=""key"" id=""key-y-{slot}"">y</div>
    <div class=""key"" id=""key-x-{slot}"">x</div>
    <div class=""key"" id=""key-c-{slot}"">c</div>
    <div class=""key"" id=""key-v-{slot}"">v</div>
    <div class=""key"" id=""key-b-{slot}"">b</div>
    <div class=""key"" id=""key-n-{slot}"">n</div>
    <div class=""key"" id=""key-m-{slot}"">m</div>
    <div class=""key"" id=""key-Comma-{slot}"">,</div>
    <div class=""key"" id=""key-Point-{slot}"">.</div>
    <div class=""key"" id=""key-Hyphen-{slot}"">-</div>
</div>
<div class=""keyRow5"">
    <div class=""keySpace"" id=""key-Space-{slot}"">Space</div>
</div>
<div class=""menuKeyboard"">
    <i class=""fa fa-toggle-on"" aria-hidden=""true"" id=""interrupt-enable-{slot}""></i>
    <i class=""fa fa-toggle-off"" style=""display: none"" aria-hidden=""true"" id=""interrupt-disable-{slot}""></i>
    <span id=""interrupt-text-{slot}"" class=""keyboardEnable"">Interrupt is enabled</span>
    <span class=""keyboardOutput"" id = ""output-{slot}"">00</span>
    <label class=""keyboardOutput"">Output:</label>
</div>
<script>
//switch interrupt toggle
$('#interrupt-enable-{slot}').click(function(){{
    $('#interrupt-enable-{slot}').hide();
    $('#interrupt-disable-{slot}').show();
    $('#interrupt-text-{slot}').text(""Interrupt is disabled"");
    }});

$('#interrupt-disable-{slot}').click(function(){{
    $('#interrupt-enable-{slot}').show();
    $('#interrupt-disable-{slot}').hide();
    $('#interrupt-text-{slot}').text(""Interrupt is enabled"");
    }});

Stebs.registerDevice({slot}, function(data){{

//sets the ascciValue of the pressed key on the outputlabel
function setOutput(keyValue) {{
    if(keyValue<16){{
        $('#output-{slot}').text(""0"" + keyValue.toString(16).toUpperCase());
    }} else {{
         $('#output-{slot}').text(keyValue.toString(16).toUpperCase());
    }}
}}

var shift = 0;
    $('#key-1-{slot}').click(function(){{
        var asciiValue = 49;
        Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-2-{slot}').click(function(){{
        var asciiValue = 50;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-3-{slot}').click(function(){{
        var asciiValue = 51;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-4-{slot}').click(function(){{
        var asciiValue = 52;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-5-{slot}').click(function(){{
        var asciiValue = 53;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-6-{slot}').click(function(){{
        var asciiValue = 54;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-7-{slot}').click(function(){{
        var asciiValue = 55;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-8-{slot}').click(function(){{
        var asciiValue = 56;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-9-{slot}').click(function(){{
        var asciiValue = 57;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-0-{slot}').click(function(){{
        var asciiValue = 48;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-q-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 113 : 81;
        Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-w-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 119 : 87;
        Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-e-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 101 : 69;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-r-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 114 : 82;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-t-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 116 : 84;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-z-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 122 : 90;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-u-{slot}').click(function(){{
        var asciiValue =  (shift == 0) ? 117 : 85;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-i-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 105 : 73;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-o-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 111 : 79;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-p-{slot}').click(function(){{
       var asciiValue = (shift == 0) ? 112 : 80;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-Quest-{slot}').click(function(){{
       var asciiValue = 63;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-BS-{slot}').click(function(){{
       var asciiValue = 8;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});


    $('#key-a-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 97 : 65;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-s-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 115 : 83;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-d-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 100 : 68;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-f-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 102 : 70;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-g-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 103 : 71;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-h-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 104 : 72;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-j-{slot}').click(function(){{
        var asciiValue =  (shift == 0) ? 106 : 74;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-k-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 107 : 75;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-l-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 108 : 76;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});


    $('#key-y-{slot}').click(function(){{
       var asciiValue = (shift == 0) ? 121 : 89;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-x-{slot}').click(function(){{
       var asciiValue = (shift == 0) ? 120 : 88;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-c-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 99 : 67;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-v-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 118 : 86;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-b-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 98 : 66;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-n-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 110 : 78;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-m-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 109 : 77;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-Comma-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 44 : 59;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-Point-{slot}').click(function(){{
        var asciiValue =  (shift == 0) ? 46 : 58;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-Hyphen-{slot}').click(function(){{
        var asciiValue = (shift == 0) ? 45 : 95;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});


    $('#key-Enter-{slot}').click(function(){{
        var asciiValue = 13;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});
    $('#key-Space-{slot}').click(function(){{
        var asciiValue = 32;
		Stebs.updateDeviceSecondUpdate({slot}, asciiValue,$('#interrupt-enable-{slot}').is(':visible') ? 'true' : 'false');
        setOutput(asciiValue);
    }});


    $('#key-Shift-{slot}').click(function(){{
        if(shift == 0){{
            shift = 1;
            $('#key-Shift-{slot}').css(""background-color"", ""white"");
            $('#key-Shift-{slot}').css(""color"", ""black"");

            $('#key-q-{slot}').text(""Q"");
            $('#key-w-{slot}').text(""W"");
            $('#key-e-{slot}').text(""E"");
            $('#key-r-{slot}').text(""R"");
            $('#key-t-{slot}').text(""T"");
            $('#key-z-{slot}').text(""Z"");
            $('#key-u-{slot}').text(""U"");
            $('#key-i-{slot}').text(""I"");
            $('#key-o-{slot}').text(""O"");
            $('#key-p-{slot}').text(""P"");

            $('#key-a-{slot}').text(""A"");
            $('#key-s-{slot}').text(""S"");
            $('#key-d-{slot}').text(""D"");
            $('#key-f-{slot}').text(""F"");
            $('#key-g-{slot}').text(""G"");
            $('#key-h-{slot}').text(""H"");
            $('#key-j-{slot}').text(""J"");
            $('#key-k-{slot}').text(""K"");
            $('#key-l-{slot}').text(""L"");

            $('#key-y-{slot}').text(""Y"");
            $('#key-x-{slot}').text(""X"");
            $('#key-c-{slot}').text(""C"");
            $('#key-v-{slot}').text(""V"");
            $('#key-b-{slot}').text(""B"");
            $('#key-n-{slot}').text(""N"");
            $('#key-m-{slot}').text(""M"");
            $('#key-Comma-{slot}').text("";"");
            $('#key-Point-{slot}').text("":"");
            $('#key-Hyphen-{slot}').text(""_"");
        }}else{{
            shift = 0;
            $('#key-Shift-{slot}').css(""background-color"", ""#555555"");
            $('#key-Shift-{slot}').css(""color"", ""white"");

            $('#key-q-{slot}').text(""q"");
            $('#key-w-{slot}').text(""w"");
            $('#key-e-{slot}').text(""e"");
            $('#key-r-{slot}').text(""r"");
            $('#key-t-{slot}').text(""t"");
            $('#key-z-{slot}').text(""z"");
            $('#key-u-{slot}').text(""u"");
            $('#key-i-{slot}').text(""i"");
            $('#key-o-{slot}').text(""o"");
            $('#key-p-{slot}').text(""p"");

            $('#key-a-{slot}').text(""a"");
            $('#key-s-{slot}').text(""s"");
            $('#key-d-{slot}').text(""d"");
            $('#key-f-{slot}').text(""f"");
            $('#key-g-{slot}').text(""g"");
            $('#key-h-{slot}').text(""h"");
            $('#key-j-{slot}').text(""j"");
            $('#key-k-{slot}').text(""k"");
            $('#key-l-{slot}').text(""l"");

            $('#key-y-{slot}').text(""y"");
            $('#key-x-{slot}').text(""x"");
            $('#key-c-{slot}').text(""c"");
            $('#key-v-{slot}').text(""v"");
            $('#key-b-{slot}').text(""b"");
            $('#key-n-{slot}').text(""n"");
            $('#key-m-{slot}').text(""m"");
            $('#key-Comma-{slot}').text("","");
            $('#key-Point-{slot}').text(""."");
            $('#key-Hyphen-{slot}').text(""-"");
    }}
        
    }});
}});
</script>";
    }
}
