using PluginApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProcessorSimulation.Device;


namespace TextConsoleDevice
{
    class TextConsolePlugin : IDevicePlugin
    {
        public const int INITIAL_PADDING_TOP = 5;
        public const int INITIAL_PADDING_LEFT = 5;

        public const int INITIAL_CHARS_PER_ROW = 16;
        public const int INITIAL_AMOUT_OF_ROWS = 4;

        public string Name => "Text Console";

        public string PluginId => "TextConsole";

        public IDevice CreateDevice()
        {
            return new TextConsoleDevice();
        }

        public string DeviceTemplate(byte slot) =>

$@"<style>
    #monitor-{slot} {{
        box-sizing: border-box; /* include border, padding and content into width/height */
        border: 1px solid black;
        width: 85%;
        height: 100px;
        margin: 5%;     /* required: margin-left & -bottom */
        font-family: Consolas, Monaco, Courier, monospace;
    }}
    .movable-content {{
        padding-top: {@INITIAL_PADDING_TOP }px;
        padding-left: {@INITIAL_PADDING_LEFT }px;
    }}
</style>

<div id=""console-wrapper"">
    <div id=""monitor-{slot}"" class=""movable-content"">
        
    </div>
</div>
<script>
/* ------- Plugin input code specification -------
* 0000'0000 to 0111'1111:   ASCII characters
* 1111'1111: reset
* 1000'0000: special codes low border
* 1111'1110: special code low border
* Between 1000'0001 and 1111'1110: 126 value interval
*
* [Command codes]
* - 11xx'xxxx = y-Coordinate of text
* - 10xx'xxxx = x-Coordinate of text
*/

/* ******************** variables ******************** */

    //initial values
    var pointer{slot} = ""_"";
    var str{slot} = [pointer{slot}];
    var initialPaddingLeft = {@INITIAL_PADDING_LEFT}
    var initialPaddingTop = {@INITIAL_PADDING_TOP};
    var initialRowLength = {INITIAL_CHARS_PER_ROW};
    var initialRowCount = {INITIAL_AMOUT_OF_ROWS};

    //chaning values
    var rowCount{slot} = initialRowCount;
    var charsPerRow{slot} = initialRowLength;
    var currentXPadding{slot} = initialPaddingLeft;
    var currentYPadding{slot} = initialPaddingTop;


/* ******************** functions ******************** */
//Assumption: functions must be initialized before main().

    var isNotAlphaNumericalAscii = function(value) {{
        return value < 32 || 126 < value; //[space, ~]
    }}

    var isCommandCode = function(value) {{
        return value >= 128 && value < 255; //1xxx'xxxx
    }}

    /** replaces non-alphanumerical ascii and html entity characters 
    *   of a string.
    *
    *   string rawStr:  expected string with UTF-8 characters.
    *   return:         browser safe, encoded string.
    */
    var encodeToHtmlEntity = function(rawStr) {{
        // unicode 001F = ascii 31; unicode 007F = ascii 127.
        return rawStr.replace(/[\u0000-\u001F\u007F-\u9999<>\& ]/gim, function(char) {{
            var code = char.charCodeAt(0);  //unicode number
            if( isNotAlphaNumericalAscii(code) ) {{ 
                return ""&#2155;"";  //invalid character
            }} else if(code === 32) {{ 
                return '&nbsp';
            }} else {{
                return '&#' + char.charCodeAt(0) + ';';
            }}
        }});
    }}

    /** converts str[] into browser compatible and browser safe string.
    */
    var prepareString{slot} = function() {{
        var concatStr = str{slot}.join('');
        var result = """"; 
        //How many line breaks?
        var currentRowCount = Math.floor(str{slot}.length / charsPerRow{slot});
        if (str{slot}.length % charsPerRow{slot} !== 0) {{ currentRowCount++; }}
        //generate string representation
        for (i = 0; i < currentRowCount; ++i) {{
            var rawStr = concatStr.substr(i * charsPerRow{slot}, charsPerRow{slot});
            //handle html entity encoding
            var encodedStr = encodeToHtmlEntity(rawStr);
            result = result.concat( encodedStr,""<br />"");
        }}
console.log('result: ' + result);
        return result;
    }}

    var printPointerAtBeginning{slot} = function() {{
        if (str{slot}.length <= 1) {{
            $('#monitor-{slot}').html('<p>' + str{slot}.join('') + '</p>');
        }}
    }}

    var resetDevice{slot} = function() {{ 
        str{slot} = [pointer{slot}];   //reset
            $('#error-{slot}').text('');
            $('#monitor-{slot}').empty();

            //reset values
            rowCount{slot} = initialRowCount;
            charsPerRow{slot} = initialRowLength;
            currentXPadding{slot} = initialPaddingLeft;
            currentYPadding{slot} = initialPaddingTop;
            $('.movable-content').css({{
                            'padding-top': currentYPadding{slot} +'px',
                            'padding-left': currentXPadding{slot} + 'px'
                }});

            printPointerAtBeginning{slot}();
    }}



/* ******************** main() ******************** */
    printPointerAtBeginning{slot}();

    Stebs.registerDevice({slot}, function(data){{
        //is it an ASCII - character?
console.log('str[]: ' + str{slot}.toString() + ' data: ' + data.Data + ' slot: ' + {slot});
        if ( data.Data >= 0 && data.Data <= 127 ) {{
            //Add element:
            if (str{slot}.length <= rowCount{slot} * charsPerRow{slot}) {{
                //remove pointer
                str{slot}.pop();
                var newStrLength = 0;
                //add new ASCII character (Note: invalid chars handling @prepareString() ).
                newStrLength = str{slot}.push( String.fromCharCode(data.Data) );
                //add pointer (checking new array lentgh)
                if (newStrLength < rowCount{slot} * charsPerRow{slot}) {{
                    str{slot}.push(pointer{slot});
                }}
            }}
            //send string into #monitor:           
            $('#monitor-{slot}').html('<p>' + prepareString{slot}() + '</p>');
        }} else if ( isCommandCode(data.Data) ) {{
            var codeVal = data.Data - 128;
            //change x or y coordinates of text?
            if (codeVal >= 64) {{
                //11xx'xxxx_bin
                codeVal -= 64;
                currentYPadding{slot} = codeVal;
            }} else {{
                //10xx'xxxx
                currentXPadding{slot} = codeVal;
            }}
            $('.movable-content').css({{
                            'padding-top': currentYPadding{slot} +'px',
                            'padding-left': currentXPadding{slot} + 'px'
                }});
        }} else if (data.Data === 255) {{
            resetDevice{slot}();
        }}
}});

</script>";
    }
}
