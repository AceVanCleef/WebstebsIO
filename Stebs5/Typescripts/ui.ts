module Stebs {

    export var ui = {
        editorContentChanged: false,

        architecturePixelWidth: 0,

        /**
         * Sets the flag, if stebs thinks the editor content is changed.
         */
        setEditorContentChanged(value: boolean) {
            ui.editorContentChanged = value;
            $('#filename-star').css('display', value ? 'inline' : 'none');
        },

        /**
         * Returns if the editor content is flaged as changed.
         */
        isEditorContentChanged(): boolean {
            return ui.editorContentChanged;
        },

        /**
         * Sets the width of #codingView to a prozentual value.
         * This allows correct browser resizing without additional client code.
         */
        setCodingViewWidth(): void {
            ui.fixSizingErrors();
            var width = (visible.architecture ? ' - ' + Widths.architecture : '');
            $('#codingView').css('width', 'calc(100% - ' + Widths.sidebar + ' ' + width + ')');
        },

        /**
        * Sets the width of #simulation to a prozentual value.
        * This allows correct browser resizing without additional client code.
        */
        setSimulationViewWidth(): void {
            ui.fixSizingErrors();
            var width = (visible.ramAndRegisters ? ' - ' + Widths.ramAndRegisters : '');
            width += (visible.devices ? ' - ' + Widths.devices : '');
            $('#simulation').css('width', 'calc(100%' + width + ')');
        },

        /**
        * Sets the width of #newDevices to a prozentual value.
        * This allows correct browser resizing without additional client code.
        */
        setnewDevicesViewWidth(): void {
            ui.fixSizingErrors();
            var width = (visible.devices ? ' - ' + Widths.ramAndRegisters : '');
            width += $('#devices').css('width');
            $('#devices').css('width', 'calc(100%' + width + ')');
        },

        /**
         * Opens/Closes the RAM sidebar.
         */
        toggleRamAndRegisters(): void {
            if (visible.ramAndRegisters) {
                var animation = { left: '-=' + Widths.ramAndRegisters };
                $('#toggleRamPanel').text("Show RAM / Registers");
                $('#openRam').parent(".open-link-vertical").removeClass("open");
            } else {
                var animation = { left: '+=' + Widths.ramAndRegisters };
                $('#toggleRamPanel').text("Hide RAM / Registers");
                $('#openRam').parent(".open-link-vertical").addClass("open");
            }
           $('#ram').animate(animation);
            
            var animation3 = { left: animation.left, width: (visible.ramAndRegisters ? '+=' : '-=') + Widths.ramAndRegisters };
            $('#simulation').animate(animation3, ui.setSimulationViewWidth);

            var animation2 = { left: animation.left };
            $('#devices').animate(animation2); 
            visible.ramAndRegisters = !visible.ramAndRegisters;

            //resize architecture width when all panels visible
            if (visible.architecture) {
                Stebs.ui.shrinkOrExpandArchitectureWidth(Stebs.ui.getMaxArchitectureWidth());
            }

            ui.repositionCloseAllSidePanelsButton();
        },

        /**
         * Opens/Closes the Newdevices sidebar.
         */
        toggleDevices(): void {
            if (visible.devices) {
                var animation = { left: '-=' + Widths.devices };
                $('#toggleDevicesPanel').text("Show Devices");
                $('#openDevices').parent(".open-link-verticalDevices").removeClass("open");
            } else {
                var animation = { left: '+=' + Widths.devices };
                $('#toggleDevicesPanel').text("Hide Devices");
                $('#openDevices').parent(".open-link-verticalDevices").addClass("open");
            }
            
            var animation2 = { left: animation.left, width: (visible.devices ? '+=' : '-=') + Widths.devices };
            $('#simulation').animate(animation2, ui.setSimulationViewWidth);
            $('#devices').animate(animation);
            visible.devices = !visible.devices;

            //resize architecture width when all panels visible
            if (visible.architecture) {
                Stebs.ui.shrinkOrExpandArchitectureWidth(Stebs.ui.getMaxArchitectureWidth());
            }
            ui.repositionCloseAllSidePanelsButton();
        },

        /**
         * Opens/Closes the architecture sidebar.
         */
        toggleArchitecture(): void {
            if (visible.architecture) {
                var animation = { left: '-=' + Widths.architecture };
                $('#toggleArchitecturePanel').text("Show Architecture");
                $('#openArchitecture').parent(".open-link-verticalArchitecture").removeClass("open");
                $('#openNewArchitecture').parent(".open-link-verticalArchitecture").removeClass("open"); 
            } else {
                var animation = { left: '+=' + Widths.architecture };
                $('#toggleArchitecturePanel').text("Hide Architecture");
                $('#openArchitecture').parent(".open-link-verticalArchitecture").addClass("open");
                $('#openNewArchitecture').parent(".open-link-verticalArchitecture").addClass("open");
            }
            $('#architecture').animate(animation);
            var animation2 = {
                left: animation.left,
                width: (visible.architecture ? '+=' : '-=') +
                Widths.architecture
            };
            $('#codingView').animate(animation2, () => {
                if (parseInt(Widths.architecture) > Stebs.ui.getMaxArchitectureWidth()) Stebs.ui.setArchitectureWidth(Stebs.ui.getMaxArchitectureWidth());
                ui.setCodingViewWidth();
            });
            visible.architecture = !visible.architecture;

            ui.repositionCloseAllSidePanelsButton();
        },

        /**
         * Sets the width of #codingFrame to a prozentual value.
         * This allows correct browser resizing without additional client code.
         */
        setCodingFrameHeight(): void {           
            var height = (visible.output ? ' - ' + Heights.output : '');
            $('#codingFrame').css('height', 'calc(100% - ' + Heights.bars + height + ')');
        },

        /**
         * Prevents the default action when dragbar is clicked and creates mouse move handler
         * @param e 
         */
        architectureDragbarMouseDown(e: JQueryMouseEventObject): void {
            e.preventDefault();
            $(document).mousemove(Stebs.ui.architectureDragbarMouseMove);
        },

        /**
         * Mouse move handler which is created after architectureDragbarMouseDown occured.
         * @param e
         */
        architectureDragbarMouseMove(e: JQueryMouseEventObject): void {
            var devicesWidth: number = parseInt(visible.devices ? Widths.devices : "0px");
            var ramAndRegistersWidth: number = parseInt(visible.ramAndRegisters ? Widths.ramAndRegisters : '0px');
            var newArchitectureWidth: number = e.pageX + 2 - devicesWidth - ramAndRegistersWidth;
            if (newArchitectureWidth >
                Stebs.ui.getMaxArchitectureWidth()) {
                newArchitectureWidth = Stebs.ui.getMaxArchitectureWidth();
            }
            if (newArchitectureWidth < parseInt(Widths.sidebar) + 2) newArchitectureWidth = parseInt(Widths.sidebar) + 2;
            //from setArchitectureWidth() with custom ui.repositionCloseAllSidePanelsButton() call:
                var codingViewLeft: number = newArchitectureWidth + parseInt(Widths.sidebar);
                $("#architecture").css({ width: (newArchitectureWidth - parseInt(Widths.sidebar)) + 'px' });

                //TODO: correct calc for the container
                $(".architecture-container").css({ width: (newArchitectureWidth - parseInt(Widths.sidebar)) + 'px' });

                Widths.architecture = String(newArchitectureWidth) + 'px';
                ui.repositionCloseAllSidePanelsButton(false);
                $("#codingView")
                    .css({
                        left: codingViewLeft,
                        width: 'calc(100% - ' + Widths.architecture + ' - ' + Widths.sidebar + ')'
                    });
                if (newArchitectureWidth > parseInt(Widths.mincanvas))
                    Stebs.architectureCanvas.setCanvasSize(newArchitectureWidth);
            //from fixSizingError()
            var mpmTitle = $(architectureCanvas.getMpmDynTable().getTableContainerElement()).children('.statictitle');
            var opdTitle = $(architectureCanvas.getOpdDynTable().getTableContainerElement()).children('.statictitle');
            mpmTitle.width($(architectureCanvas.getMpmDynTable().getTableElement()).width()); // Does not work if table is hidden while resizing.
            opdTitle.width($(architectureCanvas.getOpdDynTable().getTableElement()).width());

            if ($('#architecture').width() <= 56) {
                $('#architecture-addWatchElement').hide();
            } else {
                $('#architecture-addWatchElement').show();
            }

        }, 

        /**
         * Sets the architecture to a new width. Works only if architecture is visible.
         * @param newArchitectureWidth
         */
        setArchitectureWidth(newArchitectureWidth: number) {
            if (visible.architecture) {
                var codingViewLeft: number = newArchitectureWidth + parseInt(Widths.sidebar);
                $("#architecture").css({ width: (newArchitectureWidth - parseInt(Widths.sidebar)) + 'px' });

                //TODO: correct calc for the container
                $(".architecture-container").css({ width: (newArchitectureWidth - parseInt(Widths.sidebar)) + 'px' });

                Widths.architecture = String(newArchitectureWidth) + 'px';
                ui.repositionCloseAllSidePanelsButton();
                $("#codingView")
                    .css({
                        left: codingViewLeft,
                        width: 'calc(100% - ' + Widths.architecture + ' - ' + Widths.sidebar + ')'
                    });
                if (newArchitectureWidth > parseInt(Widths.mincanvas))
                    Stebs.architectureCanvas.setCanvasSize(newArchitectureWidth);
            }

        },

        /**
         * Sets the architecture to a new width. Works only if architecture is visible.
        *  Uses JQuery animation to increase or decrease witdh. Can't be used to set 
        *  initial values!
         * @param newArchitectureWidth
         */
        shrinkOrExpandArchitectureWidth(newArchitectureWidth: number) {
                var codingViewLeft: number = newArchitectureWidth + parseInt(Widths.sidebar);
                $("#architecture").animate({ width: (newArchitectureWidth - parseInt(Widths.sidebar)) + 'px' });

                //TODO: correct calc for the container
                $(".architecture-container").animate({ width: (newArchitectureWidth - parseInt(Widths.sidebar)) + 'px' });

                Widths.architecture = String(newArchitectureWidth) + 'px';
                ui.repositionCloseAllSidePanelsButton();
                $("#codingView")
                    .animate({
                        left: codingViewLeft,
                        width: '100%'
                        /*width: 'calc(100% - ' + Widths.architecture + ' - ' + Widths.sidebar + ')'*/
                    });
                if (newArchitectureWidth > parseInt(Widths.mincanvas))
                    Stebs.architectureCanvas.setCanvasSize(newArchitectureWidth);
        },

        /**
         * Sets the architecture Size to max size on resize event.
         * This is also called on normal resizes within the page because a div can't have a resize listener.
         */
        fixSizingErrors() {
            var newArchitectureWidth: number = parseInt(Widths.architecture);
            if (newArchitectureWidth > Stebs.ui.getMaxArchitectureWidth() && visible.architecture) {
                newArchitectureWidth = Stebs.ui.getMaxArchitectureWidth();
                Stebs.ui.setArchitectureWidth(newArchitectureWidth);
            }
            if (newArchitectureWidth < Stebs.ui.getMaxArchitectureWidth() && visible.architecture &&
                !(visible.ramAndRegisters && visible.devices)) {
                newArchitectureWidth = $(document).width() * 0.301; //On 1920 x 1080 resultion: 578px;
                ui.shrinkOrExpandArchitectureWidth(578);
            }
            var mpmTitle = $(architectureCanvas.getMpmDynTable().getTableContainerElement()).children('.statictitle');
            var opdTitle = $(architectureCanvas.getOpdDynTable().getTableContainerElement()).children('.statictitle');

            mpmTitle.width($(architectureCanvas.getMpmDynTable().getTableElement()).width()); // Does not work if table is hidden while resizing.
            opdTitle.width($(architectureCanvas.getOpdDynTable().getTableElement()).width());
        },

        /**
         * Get the max. architecture width.
         */
        getMaxArchitectureWidth(): number {
            var width = $(document).width() -
                parseInt(Widths.coding) -
                parseInt(Widths.sidebar) -
                parseInt(Widths.devices) -
                ((visible.ramAndRegisters && visible.devices) ? parseInt(Widths.ramAndRegisters) : 0);
            if (width < parseInt(Widths.sidebar) + 2) width = parseInt(Widths.sidebar) + 2; // Minimum width is sidebar width and 2px for resizebar
            return width;
        },

        /**
        * Prevents the default action when dragbar is clicked and creates mouse move handler
        * @param e 
        */
        outputDragbarMouseDown(e: JQueryMouseEventObject): void {
            e.preventDefault();
            $(document).mousemove(Stebs.ui.outputDragbarMouseMove);
        },

        /**
         * Mouse move handler which is created after outputDragbarMouseDown occured.
         * @param e
         */
        outputDragbarMouseMove(e: JQueryMouseEventObject): void {
            var outputHeight: number = $('.output').parent().height() - e.pageY + 2;
            if (outputHeight >
                $('.output').parent().height() -
            parseInt('110px') - //Note: legacy offset from #runAndDebug formerly situated below .output.
                parseInt(Heights.bars))
                outputHeight = $('.output').parent().height() -
                    parseInt('110px') - //legacy offset from #runAndDebug
                    parseInt(Heights.bars);
            if (outputHeight < 3) outputHeight = 3; // Min height of 3px so the resizebar is still visible
            Heights.output = String(outputHeight) + 'px';
            $('#codingFrame').css('height', 'calc(100% - ' + Heights.bars + ' - ' + outputHeight + 'px' + ')');

            $('.output').css('height', outputHeight);
            outputView.refresh(); 
        },

        /**
         * Unbinds mouse move handler
         * @param e
         */
        documentMouseUp(e: JQueryMouseEventObject): void {
            $(document).unbind('mousemove');
        },

        /**
         * Opens/Closes the output bar.
         */
        toggleOutput(): void {
            outputView.refresh();
            $('#codingFrame')
                .animate({ height: (visible.output ? '+=' : '-=') + Heights.output }, ui.setCodingFrameHeight);
            visible.output = !visible.output;
            if (visible.output) {
                $('.output-container').slideDown(() => outputView.refresh());
                $('#openOutput i.fa[class*="fa-caret-"]').removeClass('fa-caret-up').addClass('fa-caret-down');
            } else {
                $('.output-container').slideUp(() => outputView.refresh());
                $('#openOutput i.fa[class*="fa-caret-"]').addClass('fa-caret-up').removeClass('fa-caret-down');
            }
        },


        openOutput(): void {
            if (!visible.output) {
                ui.toggleOutput();
            }
        },

        showOutput(text: string): void {
            outputView.getDoc().setValue(text);
        },

        /**
        * Sets the height of #architecture to a prozentual value.
        * This allows correct browser resizing without additional client code.
        */
        setArchitectureHeight(): void {
            $('#architecture').css('height', '100%');
        },


        /**
        * Highlight the given line
        */
        highlightLine(ipNr: number): void {
            var linenr = Stebs.ramContent.getLineNr(ipNr);
            Stebs.codeEditor.getDoc().setCursor({ ch: 0, line: linenr });
        },

        /**
        * Reads the selected step size from the radio buttons.
        * #stefan
        */
        getStepSize(): SimulationStepSize {
            return currentSimulatoinStepSize;
        },

        /**
         * Sets the ram download link using the new processor id.
         */
        setRamDownloadLink(processorId: string) {
            var link = $('#downloadRam');
            var href: string = link.prop('href');
            var position = href.indexOf('?processorId');
            if (position >= 0) {
                href = href.substring(0, position);
            }
            link.prop('href', href + '?processorId=' + processorId);
        },

        /**
         * Opens Architecture in a new Window. This copies several elements from the Index html to the new Window.
         */
        openArchitecture() {
            //Check if browser is Internet Explorer
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");

            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
            {
                alert("Diese Funktion wird auf diesem Browser leider nicht unterstützt.");
            }

            else {
                if (architectureWindow && architectureWindow.closed === false) {
                    architectureWindow.focus();
                    return;
                }
                if (Stebs.currentSpeed < SpeedSlider.architectureHide) {
                    alert('Unable to open an architecture tab at the current Speed'); //TODO: make it possible
                    return;
                }
                var windowWidth: number = screen.width * 0.7;
                var windowSize: string = "width=" + (windowWidth) + ",height=" + (windowWidth * 2 / 3) + ",enableviewportscale=yes,location=no";
                var path: string = document.location.protocol +
                    '//' +
                    document.location.hostname +
                    ':' +
                    document.location.port + '/';

                Stebs.architectureWindow = window.open("", "", windowSize);
                $(architectureWindow.document.head).append('<title>Stebs - Architecture</title>');
                $(architectureWindow.document.head).append('<link rel="stylesheet" type= "text/css" href= "' + path + 'Content/stebs.css">');
                $(architectureWindow.document.head).append('<link rel="stylesheet" type= "text/css" href= "' + path + 'Content/normalize.css">');
                $(architectureWindow.document.body).append('<div id=canvasdiv>');
                $(architectureWindow.document.body).append('<p id="speedLimitReached" > Speed limit reached, please lower the speed if you would like to see the architecture.');

                $(architectureWindow.document.getElementById("canvasdiv")).append('<canvas id=canvas></canvas>');
                $(architectureWindow.document.getElementById("canvasdiv")).append('<div id=canvasMpm>');
                $(architectureWindow.document.getElementById("canvasdiv")).append('<div id=canvasOpD>');
                $(architectureWindow.document.getElementById("canvasdiv")).append('<div id=staticMpmTitle>');
                $(architectureWindow.document.getElementById("canvasdiv")).append('<div id=staticOpdTitle>');
                var newCanvas: HTMLElement = architectureWindow.document.getElementById("canvas");
                var canvasMpm: HTMLElement = architectureWindow.document.getElementById("canvasMpm");
                var canvasOpD: HTMLElement = architectureWindow.document.getElementById("canvasOpD");
                var staticOpdTitle: HTMLElement = architectureWindow.document.getElementById("staticOpdTitle");
                var staticMpmTitle: HTMLElement = architectureWindow.document.getElementById("staticMpmTitle");

                var canvasMpmHtml = $('#canvasMpm').html();
                var canvasOpDHtml = $('#canvasOpD').html();
                var staticOpdTitleHtml = $('#staticOpdTitle').html();
                var staticMpmTitleHtml = $('#staticMpmTitle').html();

                $(canvasMpm).html(canvasMpmHtml);
                $(canvasOpD).html(canvasOpDHtml);
                $(staticOpdTitle).html(staticOpdTitleHtml);
                $(staticMpmTitle).html(staticMpmTitleHtml);

                $(newCanvas).css({
                    width: Widths.canvas, height: Heights.canvas
                });

                Stebs.architectureWindowCanvas = new ArchitectureCanvas(<HTMLCanvasElement>newCanvas, <HTMLTableElement>architectureWindow.document.getElementById("canvasMpmTable"), <HTMLTableElement>architectureWindow.document.getElementById("canvasOpDTable"));
                Stebs.architectureWindowCanvas.setupCanvas();
                Stebs.architectureWindowCanvas.initAndUpdateCanvas();
                var firstCellArray: number[] = [];
                $(canvasMpm).find('tr:not(.tabletitle) td:first-child').each((i, e) => { firstCellArray.push(parseInt(e.textContent, 16)) });
                Stebs.architectureWindowCanvas.getMpmDynTable().init(firstCellArray, 30);
                firstCellArray = [];
                $(canvasOpD).find('tr:not(.tabletitle) td:first-child').each((i, e) => { firstCellArray.push(parseInt(e.textContent, 16)) });
                Stebs.architectureWindowCanvas.getOpdDynTable().init(firstCellArray, 30);

                //TODO: find a way to do this after the page is rendered
                setTimeout(() => { // For some reason(most likely the SOP) load or ready do not work. We need a function to be executed after the table is rendered, and that doesn't seem to happen.
                    ui.resizeArchitectureWindow();
                }, 300); // If slower PCs have a problem showing the table title correctly, higher this number.

                architectureWindow.document.close();
                architectureWindow.onresize = Stebs.ui.resizeArchitectureWindow;

                architectureWindow.onbeforeunload = (ev) => {
                    Stebs.architectureWindowCanvas = null;
                }
            }
        },

        /**
         * Resizes the canvas in the architecture tab.
         */
        resizeArchitectureWindow() {
            var width = $(architectureWindow).width();
            var height = $(architectureWindow).height();
            if ((width < Widths.architectureWindowMin) || (height < Heights.architectureWindowMin)) {
                width = Widths.architectureWindowMin;
                height = Heights.architectureWindowMin;
            }
            if (width < height * 3 / 2)
                Stebs.architectureWindowCanvas.setCanvasSize(width + parseInt(Widths.sidebar) + 5);
            else Stebs.architectureWindowCanvas.setCanvasSize(height * 3 / 2 + parseInt(Widths.sidebar) + 5);
        },


        /**
         * Allows the use of a logarithmic slider.
         */
        logarithmicScale(value: number, min: number, max: number, inverse: boolean) {
            //position will be between 0 and 100 (fixed)
            var maxPosition = 100;
            //The result should be between given min an max
            var minValue = Math.log(min);
            var maxValue = Math.log(max);
            //calculate adjustment factor
            var scale = (maxValue - minValue) / (maxPosition);
            if (inverse) {
                return (Math.log(value) - minValue) / scale;
            } else {
                return Math.exp(minValue + scale * (value));
            }
        },

        /**
         * Returns the position of the slider [0, 100] calculated using a logarithmic function.
         */
        logarithmicPosition(value: number, min: number, max: number) {
            return ui.logarithmicScale(value, min, max, true);
        },

        /**
         * Returns the value of a slider [0, 100] scaled to a logarithmic function.
         */
        logarithmicValue(position: number, min: number, max: number): number {
            return ui.logarithmicScale(position, min, max, false);
        },

        /**
         * Is Called, when the value of the speed slider changed.
         */
        speedSliderChanged() {
            var newValue = ui.logarithmicValue(parseInt($('#speedSlider').val()), SpeedSlider.max, SpeedSlider.min);
            Stebs.state.changeSpeed(newValue);
            Stebs.ui.setTempoLabelText();
        },

        setTempoLabelText() {
            $('#tempo-label').text($('#speedSlider').val() + '%');
        },

        displayDoStep() {
            //switch #debug out with #doStep
            $('#debug').hide();
            $('#doStep').show();
        },

        displayDebug() {
            //switch #doStep out with #debug
            $('#doStep').hide();
            $('#debug').show();
        },

        /**
         * displays a brief message to the GUI to offer feedback to the user.
         * Example: "File saved!" or "Successfully assembled!".
         * @param msgAsHtml expected format: fontawesome-icon followed by "<span>a brief message</span>"
         */
        informUserOfStatus(msgAsHtml: string) {
            //prepare message
            $('#statusMsgBox').html(msgAsHtml);

            //display message
            $('#statusMsgBox').fadeIn();
            setTimeout(function () {
                $('#statusMsgBox').fadeOut();
            }, 800);
            
        },

        repositionCloseAllSidePanelsButton(animated: boolean = true) {
            if (!visible.closeAllSlidePanelsButton) return;
            let positionLeft = 0 +
                (visible.ramAndRegisters ? parseInt(Widths.ramAndRegisters) : 0) +
                (visible.devices ? parseInt(Widths.devices) : 0) +
                (visible.architecture ? parseInt(Widths.architecture) : 0);

            if (animated) {
                $('#closeAllSidePanelsContainer').animate({ left: positionLeft + 'px' });
            } else {
                $('#closeAllSidePanelsContainer').css({ left: positionLeft + 'px' });
            }
        },

        closeAllSidePanels() {
            //avoid ugly behavior of close all - button
            if (visible.architecture && (visible.devices || visible.ramAndRegisters)) {
                visible.closeAllSlidePanelsButton = false;
                $('#closeAllSidePanelsContainer').fadeOut();
                $('#closeAllSidePanelsContainer').css({ left: '0px' });
                setTimeout($('#closeAllSidePanelsContainer').fadeIn(), 400);
            }
            //prevents visual side effect:
            if (visible.architecture && visible.ramAndRegisters && !visible.devices) {
                ui.toggleRamAndRegisters();
                ui.toggleArchitecture();
            }

            //Important: keep this order to prevent visual side effects
            if (visible.devices) ui.toggleDevices();
            if (visible.architecture) ui.toggleArchitecture();
            if (visible.ramAndRegisters) ui.toggleRamAndRegisters();

            visible.closeAllSlidePanelsButton = true;
        }
    };
}
