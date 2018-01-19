/// <reference path="ram.ts"/>

module Stebs {

    export var visible = {
        ramAndRegisters: false,
        ramTable: true,
        devices: false,
        architecture: false,
        output: false,
        closeAllSlidePanelsButton: true
    };

    export var Widths = {
        ramAndRegisters: '393px',
        devices: '380px',
        architecture: '600px',
        mincanvas: '600px',
        sidebar: '30px',
        coding: '292px',
        architectureWindowMin: 510,
        canvas: 1397
    };

    export var position = {
        devices: 0,
        architecture:0
    };

    export var Heights = {
        topbar: '38px',
        output: '150px',
        /* 1x topbar & 1x containerBar */
        //containerBar: '25px',
        bars: '63px',
        architectureWindowMin: 340,
        canvas: 914
    };

    /** Speed slider values in ms. */
    export var SpeedSlider = {
        min: 10,
        max: 5000,
        architectureHide: 100
    };

    /** statusMsgBox values as html. */
    export var statusMessages = {
        saved:      "<i class='fa fa-check-circle' aria-hidden='true'> </i>" +
                    "<span>Saved!</span>",
        assembled: "<i class='fa fa-code' aria-hidden='true'> </i>" +
                    "<span style='font-size:24px;'>Assembled!</span>"
    };

    export var architectureWindow: Window;
    export var architectureCanvas: ArchitectureCanvas;
    export var architectureWindowCanvas: ArchitectureCanvas;

    export enum SimulationStepSize { Micro = 0, Macro = 1, Instruction = 2 };
    export var currentSimulatoinStepSize = Stebs.SimulationStepSize.Instruction;

    /** flags whether startDebug() and debug() are allowed to be executed. */
    export var readyForDebugging = true;

    export function convertNumber(value: number, radix: number, size: number): string {
        return (Array(size + 1).join('0') + value.toString(radix)).substr(-size);
    };

    /**
     * The clientHub is a public singleton object, which contains client methods that can be called by the SignalR server.
     */
    export var clientHub = {

        /**
         * Receive available assembly instructions from the server.
         */
        init(data: any): void {
            //Add syntax highlighting for received instructions
            for (var instruction in data.Instructions) {
                assemblerInstruction[data.Instructions[instruction].Mnemonic] = 'variable-2';
            }
            //Initialise components
            registerControl.setRegisters(data.Registers);
            deviceManager.setDeviceTypes(data.DeviceTypes);
            //Add processor id to the ram download link
            ui.setRamDownloadLink(data.ProcessorId);
        },

        /**
         * Server finished assembling the sent source.
         */
        assembled(result: string, ram: number[], code2Line: number[]): void {
            Stebs.outputView.setOption('mode', 'assembler');
            ui.openOutput();
            ui.showOutput(result);
            ramContent.setContent(ram);
            ramContent.setRamToLine(code2Line);
            ramContent.removeObsoleteBreakpoints(Stebs.codeEditor.getDoc().lineCount());
            state.assembled();
        },

        setMpm(adr: number[], na: string[], ci: boolean[], ev: boolean[], jc: string[], val: number[], af: boolean[], alu: string[], io: string[], src: string[], dest: string[], rw: string[]) {
            if (architectureWindowCanvas) architectureWindowCanvas.setMpm(adr, na, ci, ev, jc, val, af, alu, io, src, dest, rw);
            architectureCanvas.setMpm(adr, na, ci, ev, jc, val, af, alu, io, src, dest, rw);
        },

        setOpDecoder(opc: number[], adr: number[], instr: string[], type: string[][]) {
            if (architectureWindowCanvas) architectureWindowCanvas.setOpDecoder(opc, adr, instr, type);
            architectureCanvas.setOpDecoder(opc, adr, instr, type);
        },

        /**
         * The sent source contains syntax errors. The assembling failed.
         */
        assembleError(error: string): void {
            Stebs.outputView.setOption('mode', 'none');
            ui.openOutput();
            ui.showOutput(error);
            //prevent startdebug/debug misbehavior on AssembleError.
            readyForDebugging = false;
            Stebs.state.reset();    //reset to InitialState
        },

        /**
         * Update ram and register with sent updates.
         */
        updateProcessor(stepSize: SimulationStepSize, mpmAddress: number, aluInstruction: string, ramChanges: { [address: number]: number }, registerChanges: { [register: string]: { Type: number, Value: number, Highlight: boolean } }, statusRegisterChanges: boolean[]) {
            Stebs.ramContent.resetHighlights();
            Stebs.watchControl.resetHighlighting();
            for (var address in ramChanges) {
                var ad2: number = Number(address);
                ramContent.setRamAt(ad2, ramChanges[ad2]);
            }
            registerControl.setAllRegistersToUnhighlighted();
            for (var register in registerChanges) {
                registerControl.updateRegister(register, registerChanges[register].Value, registerChanges[register].Highlight);
            }
            Stebs.ui.highlightLine(registerControl.registers['IP'].getValue());

            architectureCanvas.initAndUpdateCanvas(aluInstruction, statusRegisterChanges);
            architectureCanvas.highlightMpm(mpmAddress + '');
            architectureCanvas.highlightOpd(registerControl.registers['IR'].getValue() + '');
            if (architectureWindowCanvas) {
                architectureWindowCanvas.initAndUpdateCanvas(aluInstruction, statusRegisterChanges);
                architectureWindowCanvas.highlightMpm(mpmAddress + '');
                architectureWindowCanvas.highlightOpd(registerControl.registers['IR'].getValue() + '');
            }
        },

        /**
         * Update interrupt flag (IRF) with the sent update.
         */
        processorInterrupt(flagValue: number): void {
            registerControl.updateRegister('Interrupt', flagValue, false);
        },

        /**
         * Called, when the processor was soft resetted.
         * (All registers cleared, but memory unchanged.)
         */
        reset() {
            registerControl.resetRegisters();
            architectureCanvas.resetMpm();
            architectureCanvas.resetOpd();
            architectureCanvas.initAndUpdateCanvas();
            if (architectureWindowCanvas) {
                architectureWindowCanvas.resetMpm();
                architectureWindowCanvas.resetOpd();
                architectureWindowCanvas.initAndUpdateCanvas();
            }
        },

        /**
         * Called, when the processor was hard resetted.
         * (All registers and complete memory cleared.)
         */
        hardReset() {
            registerControl.resetRegisters();
            ramContent = new Ram();
            ramContent.init();
            architectureCanvas.resetMpm();
            architectureCanvas.resetOpd();
            architectureCanvas.initAndUpdateCanvas();
            if (architectureWindowCanvas) {
                architectureWindowCanvas.resetMpm();
                architectureWindowCanvas.resetOpd();
                architectureWindowCanvas.initAndUpdateCanvas();
            }
        },

        /**
        * Called, when the processor reached a breakpoint and should be paused.
        */
        pause() {
            state.pause();
        },

        /**
         * Called, when the processor was halted.
         */
        halt() {
            state.halted();
        },

        undoLimitReached() {
            state.disableUndo();
        }

    };

    export class AddDeviceViewModel {
        public Slot: number;
        public Template: string;
        public Success: boolean;
    };

    export class RemoveDeviceViewModel {
    };

    /** sends commands to the server.  */
    export var serverHub = {

        /**
         * Sends the source to the server to be assembled.
         */
        assemble() {
            var newSource = Stebs.codeEditor.getDoc().getValue().replace(/\r?\n/g, '\r\n').replace(/\t/g, '    ');
            $.connection.stebsHub.server.assemble(newSource);
        },

        /**
         * Sends a request for a simulation step with given step size to the server.
         */
        singleStep(stepSize: SimulationStepSize) {
            $.connection.stebsHub.server.step(stepSize);
        },

        /**
        * Sends a request for a simulation step with given step size to the server.
        */
        undoSingleStep(stepSize: SimulationStepSize) {
            $.connection.stebsHub.server.undoStep(stepSize);
        },

        /**
         * Starts the simulation of the processor.
         */
        run(stepSize: SimulationStepSize) {
            $.connection.stebsHub.server.run(stepSize);
        },

        /**
         * Sends all client side created breakpoints to the server. 
         */
        createBreakpoints() {
            $.connection.stebsHub.server.createBreakpoints(ramContent.getBreakpointArray());
        },

        /**
         * Pauses the simulation of the server.
         * Simulation can be continued with another call to run.
         */
        pause() {
            $.connection.stebsHub.server.pause();
        },

        /**
         * Stops the simulation of the processor.
         */
        stop() {
            $.connection.stebsHub.server.stop();
        },

        /**
         * Stops the simulation of the processor and resets the ram and all registers.
         */
        reset() {
            $.connection.stebsHub.server.reset();
        },

        /**
         * Changes the simulation speed: The speed is used as minimal delay between two simulation steps.
         */
        changeSpeed(speed: number) {
            $.connection.stebsHub.server.changeRunDelay(speed);
        },

        /**
         * Changes the simulation step size. (Rsolution of the running animation.)
         */
        changeStepSize(stepSize: SimulationStepSize) {
            $.connection.stebsHub.server.changeStepSize(stepSize);
        },

        /*
        * Add a Node to the Filesystem
        */
        addNode(parentId: number, nodeName: string, isFolder: boolean): Promise<FileSystem> {
            return $.connection.stebsHub.server.addNode(parentId, nodeName, isFolder);
        },

        /**
        * Change Node name
        */
        changeNodeName(nodeId: number, newNodeName: string, isFolder: boolean): Promise<FileSystem> {
            return $.connection.stebsHub.server.changeNodeName(nodeId, newNodeName, isFolder);
        },

        /**
        * Delete Node 
        */
        deleteNode(nodeId: number, isFolder: boolean): Promise<FileSystem> {
            return $.connection.stebsHub.server.deleteNode(nodeId, isFolder);
        },

        /**
        * Get Filesystem 
        */
        getFileSystem(): Promise<FileSystem> {
            return $.connection.stebsHub.server.getFileSystem();
        },

        /**
        * Get File content.
        */
        getFileContent(nodeId: number): Promise<string> {
            return $.connection.stebsHub.server.getFileContent(nodeId);
        },

        /**
        * Save File content.
        */
        saveFileContent(nodeId: number, fileContent: string): void {
            $.connection.stebsHub.server.saveFileContent(nodeId, fileContent);
        },

        /**
         * Add a new device with the given type at the given slot.
         * @param deviceType Device id, which should be added.
         * @param slot Prefered slot number.
         */
        addDevice(deviceType: string, slot: number = NaN): Promise<AddDeviceViewModel> {
            return $.connection.stebsHub.server.addDevice(deviceType, isNaN(slot) ? null : slot);
        },

        /**
         * Updates a device with user input.
         * @param slot Slot number of the device to update.
         * @param update Update data from client to server.
         */
        updateDevice(slot: number, update: any): void {
            $.connection.stebsHub.server.updateDevice(slot, update);
        },

        /**
         * Updates a device with user input.
         * @param slot Slot number of the device to update.
         * @param update Update data from client to server.
         * @param secondUpdate Update data from client to server.
         */
        updateDeviceSecondUpdate(slot: number, update: any, secondUpdate: any): void {
            $.connection.stebsHub.server.updateDevice(slot, update, secondUpdate);
        },

        /**
         * Removes the device with the given slot.
         */
        removeDevice(slot: number): Promise<RemoveDeviceViewModel> {
            return $.connection.stebsHub.server.removeDevice(slot);
        },

        /**
        * Sets the hardware interrupt flag to true.
        */
        hwInterrupt(): void {
            registerControl.updateRegister('Interrupt', 1, true);
            architectureCanvas.initAndUpdateCanvas();
            if (architectureWindowCanvas) {
                architectureWindowCanvas.initAndUpdateCanvas();
            }
            return $.connection.stebsHub.server.hwInterrupt();
        }

    };

    export var codeEditor: CodeMirror.EditorFromTextArea;
    export var outputView: CodeMirror.EditorFromTextArea;
}

/**
 * This interface allows the usage of the signalr library.
 */
interface JQueryStatic {
    connection: {
        stebsHub: { server: any, client: any },
        hub: any
    };
}

/**
 * This interface allows the usage of the bindGlobal methods.
 * These allow definitions of keybindings, which also work in the code mirror editor.
 */
interface MousetrapStatic {
    bindGlobal(keys: string, callback: (e: ExtendedKeyboardEvent, combo: string) => any, action?: string): void;
    bindGlobal(keyArray: string[], callback: (e: ExtendedKeyboardEvent, combo: string) => any, action?: string): void;
}

module CodeMirror {
    export interface EditorConfiguration {
        styleActiveLine?: boolean;
    }
}

/**
 * Import of the javascript global variable from mode.assembler.js
 */
declare var assemblerInstruction: any;

$(document).ready(function () {

    var falseDelegate = (delegate: () => void) => function () { delegate(); return false; };

    Stebs.ramContent.init();
    Stebs.stateInit();

    var hub = $.connection.stebsHub;
    hub.client.initialise = Stebs.clientHub.init;
    hub.client.assembled = Stebs.clientHub.assembled;
    hub.client.setMpm = Stebs.clientHub.setMpm;
    hub.client.setOpDecoder = Stebs.clientHub.setOpDecoder;
    hub.client.assembleError = Stebs.clientHub.assembleError;
    hub.client.undoLimitReached = Stebs.clientHub.undoLimitReached;
    hub.client.updateProcessor = Stebs.clientHub.updateProcessor;
    hub.client.processorInterrupt = Stebs.clientHub.processorInterrupt;
    hub.client.reset = Stebs.clientHub.reset;
    hub.client.halt = Stebs.clientHub.halt;
    hub.client.hardReset = Stebs.clientHub.hardReset;
    hub.client.pause = Stebs.clientHub.pause;
    hub.client.updateDevice = Stebs.deviceManager.updateView;

    $.connection.hub.start().done(() => {

        //Initialise stebs
        Stebs.fileManagement.init();
        Stebs.registerControl.init();
        Stebs.deviceManager.init();

        Mousetrap.bindGlobal('mod+o', falseDelegate(Stebs.fileManagement.toggleFileManager));
        Mousetrap.bindGlobal('mod+n', falseDelegate(Stebs.fileManagement.newFile));
        Mousetrap.bindGlobal('mod+s', falseDelegate(Stebs.fileManagement.saveFile));

        //initialize #tempo-label
        Stebs.ui.setTempoLabelText();

        /*--------------------- simulation control --------------------*/
        $('#assemble').click(() => Stebs.state.assemble());
        Mousetrap.bindGlobal('mod+b', falseDelegate(() => Stebs.state.assemble()));

        $('#debug').click(() => Stebs.state.debug());
        Mousetrap.bindGlobal('mod+j', falseDelegate(() => Stebs.state.debug()));
        
        $('#start').click(() => Stebs.state.start());
        $('#pause, #continue').click(() => Stebs.state.startOrPause());
        Mousetrap.bind('space', falseDelegate(() => Stebs.state.startOrPause()));
        Mousetrap.bindGlobal('mod+g', falseDelegate(() => Stebs.state.startOrPause()));

        $('#stop').click(() => Stebs.state.stop());
        Mousetrap.bindGlobal(['esc', 'mod+h'], falseDelegate(() => Stebs.state.stop()));

        $('#reset').click(() => Stebs.state.reset());
        //TODO: Add keyboard binding

        $('#speedSlider').change(Stebs.ui.speedSliderChanged);

        $('#startdebug').click(() => Stebs.state.startDebug());

        //#debugTempo - dropdown.
        $('#simulation_step_selection input').on('change', function (event) {
            var selectedStepSize = $('input[name=simulation_step_size]:checked', '#simulation_step_selection').val();
            var label = $('#debugTempo-label');
            switch (selectedStepSize) {
                case 'instructionStep':
                    Stebs.currentSimulatoinStepSize = Stebs.SimulationStepSize.Instruction;
                    label.text("1x");
                    break;
                case 'macroStep':
                    Stebs.currentSimulatoinStepSize = Stebs.SimulationStepSize.Macro;
                    label.text("1/2x");
                    break;
                case 'microStep':
                    Stebs.currentSimulatoinStepSize = Stebs.SimulationStepSize.Micro;
                    label.text("1/4x");
                    break;
                default:
                    Stebs.currentSimulatoinStepSize = Stebs.SimulationStepSize.Instruction;
                    label.text("1x");
                    break;
            }
            Stebs.serverHub.changeStepSize(Stebs.ui.getStepSize());
        });


        $('#doStep').click(() => Stebs.state.singleStep(Stebs.currentSimulatoinStepSize));

        $('#undoStep').click(() => Stebs.state.undoSingleStep(Stebs.currentSimulatoinStepSize));

        /*--------------------- menubar --------------------*/
        $('#instructionStep').click(function () {
            Stebs.currentSimulatoinStepSize = Stebs.SimulationStepSize.Instruction;
            $('#debugTempo-label').text("1x");
            $('input[name=simulation_step_size]:checked').prop('checked', false);
            $('#switch_3_instructionStep').prop('checked', true);
            Stebs.serverHub.changeStepSize(Stebs.ui.getStepSize());
        });

        $('#macroStep').click(function () {
            Stebs.currentSimulatoinStepSize = Stebs.SimulationStepSize.Macro;
            $('#debugTempo-label').text("1/2x");
            $('input[name=simulation_step_size]:checked').prop('checked', false);
            $('#switch_3_macroStep').prop('checked', true);
            Stebs.serverHub.changeStepSize(Stebs.ui.getStepSize());
        });

        $('#microStep').click(function () {
            Stebs.currentSimulatoinStepSize = Stebs.SimulationStepSize.Micro;
            $('#debugTempo-label').text("1/4x");
            $('input[name=simulation_step_size]:checked').prop('checked', false);
            $('#switch_3_microStep').prop('checked', true);
            Stebs.serverHub.changeStepSize(Stebs.ui.getStepSize());
        });
    });

    /***** dropdown menues of simulatoincontrol *****/
    $(".simulationControl .dropdown").mouseenter(function () {
        var x = $(this).children(".dropdown-content").first();
        if (x.hasClass("closed")) { x.removeClass("closed"); }
        x.addClass("open");
        $(this).children("button").first().css("background-color", "rgba(20, 62, 214, 0.5)");
    });
    //close on click on button
    $(".simulationControl .dropdown").click(function (event) {
        //Does event originate from child element of type button?
        if ($(event.target).is("button")) {
            var x = $(this).children(".dropdown-content").first();
            if (x.hasClass("open")) {
                x.removeClass("open").addClass("closed");
            } else if (x.hasClass("closed")) {
                return;
            }
            $(this).children("button").first().css("background-color", "transparent");
        }
    });
    //if clicked somewhere else, outside of element
    $(document).on('click', function (event) {
        //prevent click on codingTopBar and .dropdown-content from closing dropdowns.
        var disableOnIDs = ["codingTopBar", "tempo", "speedSlider",
            "debugTempo", "simulation_step_selection"];
        for (let disableOnID in disableOnIDs) {
            if (event.target.id == disableOnID) {
                //involving descendants, use smth like: || !$(event.target).closest('.dropdown').length
                //source: https://stackoverflow.com/questions/12661797/jquery-click-anywhere-in-the-page-except-on-1-div
                return;
            }
        }
        //prevent interference with #ram-elementList and #architecture-elementList
        if ($(event.target).hasClass('registerLink')) return;
        if (!$(event.target).closest('.dropdown').length) {
            // Hide the menus.
            $(".dropdown-content").removeClass("open").addClass("closed");
            $("#tempo, #debugTempo").css("background-color", "transparent");
        }
    });

    //Menubar commands
    $('#openDelete').click(Stebs.fileManagement.openFileManager);
    $('#openAddFolder').click(Stebs.fileManagement.openAddFolder);
    $('#openDevices').click(Stebs.ui.toggleDevices);
    $('#toggleArchitecturePanel').click(Stebs.ui.toggleArchitecture);
    $('#toggleRamPanel').click(Stebs.ui.toggleRamAndRegisters);
    $('#toggleDevicesPanel').click(Stebs.ui.toggleDevices);
    $("#collapseRamTable").click(() => {
        $("#hideShowRam").click();
    });

    $('#closeAllSidePanelsContainer').click(function (event) {
        Stebs.ui.closeAllSidePanels();
    });
    $('#openRam').click(Stebs.ui.toggleRamAndRegisters);
    $('#openArchitecture').click(Stebs.ui.toggleArchitecture);
    $('#openNewArchitecture').click(Stebs.ui.openArchitecture);
    $('#openOutput').click(Stebs.ui.toggleOutput);
    $('#architectureDragbar').mousedown(Stebs.ui.architectureDragbarMouseDown);
    $('#outputDragbar').mousedown(Stebs.ui.outputDragbarMouseDown);
    $(document).mouseup(Stebs.ui.documentMouseUp);
    $(window).on("resize", Stebs.ui.fixSizingErrors);

    Stebs.architectureCanvas = new Stebs.ArchitectureCanvas(<HTMLCanvasElement>$('#canvas')[0], <HTMLTableElement>$('#canvasMpmTable')[0], <HTMLTableElement>$('#canvasOpDTable')[0]);
    Stebs.architectureCanvas.setupCanvas();

    Stebs.breakpoints.initBreakpoints();

    Stebs.codeEditor = CodeMirror.fromTextArea(<HTMLTextAreaElement>$('#codingTextArea').get(0), {
        mode: 'assembler',
        lineNumbers: true,
        styleActiveLine: true,
        gutters: ["breakpoints", "CodeMirror-linenumbers"]
    });

    Stebs.outputView = CodeMirror.fromTextArea(<HTMLTextAreaElement>$('#outputTextArea').get(0), {
        mode: 'assembler',
        lineNumbers: true,
        readOnly: true,
        cursorBlinkRate: -1
    });

    //Get change event from codeEditor
    Stebs.codeEditor.on("change", (cm, change) => {
        Stebs.state.codeChanged();
        Stebs.ui.setEditorContentChanged(true);
    });

    Stebs.codeEditor.on("gutterClick", (cm: CodeMirror.Editor, line: number, gutter: string, clickEvent: MouseEvent) => Stebs.state.addBreakpoint(cm, line, gutter, clickEvent));

    //Show confirm. If the user stays on page the connection will be recreated 
    $(window).on('beforeunload', function () {
        var timeout: number;
        if (Stebs.ui.isEditorContentChanged()) {
            //Only reconnect if the browser is firefox.
            //The false disconnection bug is known and intentionally not fixed by the SignalR developers.
            if (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
                timeout = setTimeout(function () {
                    //Reconnect
                    $.connection.hub.start().done(() => {
                        //Reinitialise devices
                        Stebs.deviceManager.reInitialise();
                    });
                    //Because processor was deleted on disconnect
                    Stebs.stateInit(false);
                    Stebs.ramContent = new Stebs.Ram();
                    Stebs.ramContent.init();
                    Stebs.registerControl.resetRegisters();
                }, 1000);
            }
            return 'Are you sure you want to leave?';
        }
    });
    $(window).on('unload', function () { if (Stebs.architectureWindow) Stebs.architectureWindow.close(); });
});
