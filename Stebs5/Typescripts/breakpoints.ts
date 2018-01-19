module Stebs {
    export var breakpoints = {
        contextmenuopen: false,

        /**
         * Called whenever the gutter element of the code editor is clicked and it is enabled in the state machine.
         * Creates or removes a breakpoint marker at the position clicked
         * @param cm
         * @param line
         * @param gutter
         * @param clickEvent
         */
        addOrRemoveBreakpointMarker(cm: CodeMirror.Editor, line: number, gutter: string, clickEvent: MouseEvent) {
            if (gutter === "breakpoints") {
                clickEvent.preventDefault();
                var info: any = cm.lineInfo(line);
                if (ramContent.isLineInRam(line)) {
                    switch (clickEvent.which) {
                        case 1:
                            if (info.gutterMarkers) {
                                breakpoints.removeBreakpoint(line);
                                breakpoints.hideEditBreakpointMarker();
                            }
                            else {
                                var lineHandle: any = cm.getDoc().getLineHandle(line);
                                lineHandle.on('delete', () => { breakpoints.removeBreakpoint(line, false); });
                                 cm.setGutterMarker(line, "breakpoints", breakpoints.createBreakpointMarker(ramContent.getIpNr(line)));
                            }
                            break;
                        case 3:
                            if (!info.gutterMarkers)
                                cm.setGutterMarker(line, "breakpoints", breakpoints.createBreakpointMarker(ramContent.getIpNr(line)));
                            break;
                    }
                    cm.refresh();
                }
            }
        },

        /**
         * Remove a breakpoint at a given line
         * @param line
         */
        removeBreakpoint(line: number, removeMarker: boolean = true) {
            if (removeMarker) Stebs.codeEditor.setGutterMarker(line, "breakpoints", null);
            ramContent.setBreakpoint(ramContent.getIpNr(line), 0);
        },

        /**
         * Initialize breakpoint logic and behaviour of the elements
         */
        initBreakpoints() {
            //Prevent context menu in breakpoints div from showing up
            $('#codingFrame').on('contextmenu', (e) => { if (e.target === $('.breakpoints')[0]) e.preventDefault(); });
            $('#bpedit-input').focus(() => { $('#bpedit-input').select() });
            $('#bpedit-input').on("keypress", e => {
                if (e.keyCode === 13) {
                    breakpoints.hideEditBreakpointMarker();
                    return false;
                }
            });
            $(document).click(breakpoints.hideEditBreakpointMarker);
            $(window).blur(breakpoints.hideEditBreakpointMarker);
        },

        /**
         * Creates a breakpoint marker element.
         * @param ipNr instruction pointer of line
         * @returns HTMLElement of a breakpoint
         */
        createBreakpointMarker(ipNr: number) {
            var marker = $('<div></div>');
            marker.addClass('breakpoint-container');
            marker.attr('title', "Breakpoint triggers on call 1.");

            var dot = $('<div></div>');
            dot.addClass('breakpoint');

            dot.html("●");
            marker.append(dot);
            var breakpointText = $('<div></div>').addClass("breakpoint-text");
            marker.append(breakpointText);
            ramContent.setBreakpoint(ipNr, 1);

            marker.on('contextmenu', (e) => { state.editBreakpoint(marker, ipNr, e) });
            return marker[0];
        },

        /**
        * Shows the edit context Menu for a breakpoint and defines the behaviour of the context menu.
        */
        editBreakpointMarker(marker: JQuery, ipNr: number, e: JQueryEventObject) {
            e.preventDefault();

            if (breakpoints.contextmenuopen) $('#bpedit-input').off("input"); // Only allow one event listener on input.
            breakpoints.contextmenuopen = true;

            var bpEdit: JQuery = $('#bp-value-setter');
            var bpEditInput: JQuery = $('#bpedit-input');
            bpEdit.css('top', e.clientY);
            bpEdit.css('left', e.clientX);
            bpEdit.css('visibility', 'visible');
            var breakpointText: JQuery = marker.children('.breakpoint-text');
            bpEditInput.val(ramContent.getBreakpoint(ipNr));

            $('#bpedit-input').on("input", () => breakpoints.handleBreakpointInput(marker, bpEditInput, breakpointText, ipNr));

            bpEditInput.focus();
        },

        /**
         * Input handler which is called whenever the iteration number in the context menu of a breakpoint gets changed.
         * @param marker
         * @param bpEditInput
         * @param breakpointText
         */
        handleBreakpointInput(marker: JQuery, bpEditInput: JQuery, breakpointText: JQuery, ipNr: number) {
            if (!(Number(bpEditInput.val()) >= 1)) bpEditInput.val(1); // Prevent copy pasted text or negative numbers.
            bpEditInput.val(Math.floor(bpEditInput.val())); // Prevent decimal values
            if (Number(bpEditInput.val()) === 1) {
                breakpointText.empty();
                marker.attr('title', "Breakpoint triggers on call " + bpEditInput.val() + ".");
            }
            else if (bpEditInput.val() < 10) {
                breakpointText.html(bpEditInput.val());
                marker.attr('title', "Breakpoint triggers on call " + bpEditInput.val() + ".");
            }
            else {
                breakpointText.html("X");
                marker.attr('title', "Breakpoint triggers on call " + bpEditInput.val() + ".");
            }
            ramContent.setBreakpoint(ipNr, bpEditInput.val());
        },

        /**
         * Hides the editBreakpointMarker context menu and removes the event handler.
         */
        hideEditBreakpointMarker(e: JQueryEventObject = null) {
            if (!e || e.target !== $('#bp-value-setter')[0] && $(e.target).parent()[0] !== $('#bp-value-setter')[0]) {
                $('#bp-value-setter').css('visibility', 'hidden');
                $('#bpedit-input').off("input");
                breakpoints.contextmenuopen = false;
            }
        }
    }
}