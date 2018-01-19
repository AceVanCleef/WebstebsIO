module Stebs {

    /**
     * The IState interface is the base of all States.
     * The defined methods describe possible state transitions.
     */
    export interface IState {
        assemble(): void;
        assembled(): void;
        start(): void;
        debug(): void;
        startOrPause(): void;
        pause(): void;
        stop(): void;
        reset(): void;
        halted(): void;
        singleStep(stepSize: SimulationStepSize): void;
        undoSingleStep(stepSize: SimulationStepSize): void;
        changeSpeed(speed: number): void;
        hwInterrupt(): void;
        disableUndo(): void;
        editBreakpoint(marker: JQuery, ipNr: number, e: JQueryEventObject): void;
        /**
        * Is called when the left gutter of the codeeditor is clicked. Sets a breakpoint marker at the clicked position.
        */
        addBreakpoint(cm: CodeMirror.Editor, line: number, gutter: string, clickEvent: MouseEvent): void;

        /**
         * Called, when new input was entered in the editor.
         * This can cause state updates (e.g. Assembled -> Initial).
         */
        codeChanged(): void;
        /**
        * Called when #startDebug was clicked.
        */
        startDebug(): void;
    }

    /**
     * Current state of the state machine.
     */
    export var state: IState;

    /**
     * Sets the state to the initial value.
     */
    export function stateInit(first = true): void {
        state = new InitialState(first);
    };

    /**
     * Determines, if the radio buttons or buttons should be showed for the step size.
     */
    enum ContinuousOrSingleStep { Continuous, SingleStep }

    /**
     * Button ids, which are used the specify, which state transitions are supported.
     */
    var actions = {
        assemble: 'assemble',
        start: 'start',
        debug: 'debug',
        pause: 'pause',
        continue: 'continue',
        stop: 'stop',
        reset: 'reset',
        doStep: 'doStep',
        undoStep: 'undoStep',
        hwInterrupt: 'hwInterrupt'
    };

    /**
     * Current speed of the speedslider, gets updated when speed changes.
     */
    export var currentSpeed: number = 500;

    /**
     * Event that prevents the default Event for everything but the breakpoint gutter.
     */
    var disableEvent = (instance: CodeMirror.Doc, event: Event) => {
        if (event.target !== $(Stebs.codeEditor.getGutterElement()).children('.breakpoints')[0] && !($(event.target).hasClass('breakpoint') || $(event.target).hasClass('breakpoint-text')))
        event.preventDefault();
    }

    /**
     * Adapter which allows that states don't have to implement the full interface IState.
     * The constructor has methods to enable and disable gui elements according to the specific state.
     */
    abstract class StateAdapter implements IState {
        constructor(allowedActions: string[], continuousOrSingleStep: ContinuousOrSingleStep = ContinuousOrSingleStep.Continuous) {
            for (var action in actions) {
                $('#' + action).prop('disabled', $.inArray(action, allowedActions) < 0);
            }
            Stebs.readyForDebugging = true;
        }
        assemble() {  }
        assembled() { }
        start() { }
        debug() { }
        startOrPause() { }
        pause() { }
        stop() { }
        halted() { }
        disableUndo() { }
        singleStep(stepSize: SimulationStepSize) { }
        undoSingleStep(stepSize: SimulationStepSize) { }
        codeChanged() { }
        hwInterrupt() { }
        editBreakpoint(marker: JQuery, ipNr: number, e: JQueryEventObject) { }
        addBreakpoint(cm: CodeMirror.Editor, line: number, gutter: string, clickEvent: MouseEvent) { }
        startDebug() { }

        //Reset is possible in almost every state. If it should not be possible: Overwrite this method.
        reset() {
            state = new InitialState();
            state.reset();
            Stebs.ui.displayDebug();
        }

        //Is always possible but has a different implementation in Running state.
        changeSpeed(speed: number) {
            Stebs.serverHub.changeSpeed(speed);
            currentSpeed = speed;
        }

        protected editMode(enable: boolean, enableBreakpoints: boolean = false) {
            if (enable) {
                Stebs.codeEditor.setOption('readOnly', false);
                Stebs.codeEditor.setOption('cursorBlinkRate', 530);
                $('#codingFrame').removeClass('running');
                Stebs.codeEditor.off('mousedown', disableEvent);
                Stebs.codeEditor.off('contextmenu', disableEvent);
            } else if (!$('#codingFrame').hasClass('running')) {
                Stebs.codeEditor.setOption('readOnly', 'nocursor');
                Stebs.codeEditor.setOption('cursorBlinkRate', -1);
                $('#codingFrame').addClass('running');
                Stebs.codeEditor.on('mousedown', disableEvent);
                Stebs.codeEditor.on('contextmenu', disableEvent);
            }
        }
        protected showorHideArchitecture(show: boolean = true){
            if ((currentSpeed < SpeedSlider.architectureHide) && show === false) {
                $('.architecture-container').css('display', 'none');
                $('#speedLimitReached').css('display', 'block');
                if ((Stebs.architectureWindow) && (Stebs.architectureWindow.document.body)) {
                    $(Stebs.architectureWindow.document.body).find('#canvasdiv').css('display', 'none');
                    $(Stebs.architectureWindow.document.body).find('#speedLimitReached').css('display', 'block');
                }
            }
            else {
                $('.architecture-container').css('display', 'initial');
                $('#speedLimitReached').css('display', 'none');
                if ((Stebs.architectureWindow) && (Stebs.architectureWindow.document.body)){
                    $(Stebs.architectureWindow.document.body).find('#canvasdiv').css('display', 'initial');
                    $(Stebs.architectureWindow.document.body).find('#speedLimitReached').css('display', 'none');
                }
            }
        }
    }


    /**
     * Starting state of the application.
     */
    class InitialState extends StateAdapter {
        constructor(first = false) {
            super([actions.assemble, actions.reset, actions.debug]);
            super.showorHideArchitecture();
            if (!first) { super.editMode(true); }
        }
        assemble() {
            serverHub.assemble();
        }
        assembled() {
            Stebs.ui.informUserOfStatus(statusMessages.assembled);
            state = new AssembledState();
        }
        reset() {
            serverHub.reset();
        }
        //added by Stefan
        startDebug() {
            this.assemble();
            if (Stebs.readyForDebugging) {
                Stebs.ui.displayDoStep();
                state = new AssembledState();
                state.startDebug();
            } else {
                console.log("startDebug() execution in InitialState prevented: assemble error occured.");
            }
        }
        debug() {
            this.assemble();
            if (Stebs.readyForDebugging) {
                Stebs.ui.displayDoStep();
                //ui.highlightLine(0); //todo: how to fix wrong line shown bug?
                state = new AssembledState();
                state.debug();
            } else {
                console.log("debug() execution in InitialState prevented: assemble error occured.");
            }
        }
    }

    /**
     * State after assembling, before execution of the simulation.
     */
    class AssembledState extends StateAdapter {
        constructor() {
            super([actions.assemble, actions.start, actions.debug, actions.continue, actions.reset]);
            super.editMode(true, true);
            super.showorHideArchitecture();
        }
        assemble() {
            state = new InitialState();
            state.assemble();
        }
        startOrPause() { this.start(); }
        start() {
            state = new RunningState();
            serverHub.createBreakpoints();
            serverHub.run(Stebs.ui.getStepSize());
            ui.highlightLine(0);
            Stebs.ui.displayDoStep();
        }
        startDebug() {
            if (ramContent.hasAnyBreakpoints()) {
                state.start();
            } else {
                alert("Did you know? You can add breakpoints as you know from your usual IDE but with one difference: You first need to assemble your code.")
            }
            
        }
        debug() {
            state = new PausedState();
            serverHub.pause();
            ui.highlightLine(0);
            Stebs.ui.displayDoStep();
        }
        codeChanged() {
            state = new InitialState();
            Stebs.ui.displayDebug();
        }
        editBreakpoint(marker: JQuery, ipNr: number, e: JQueryEventObject) {
            Stebs.breakpoints.editBreakpointMarker(marker, ipNr, e);
        }

        addBreakpoint(cm: CodeMirror.Editor, line: number, gutter: string, clickEvent: MouseEvent) {
            Stebs.breakpoints.addOrRemoveBreakpointMarker(cm, line, gutter, clickEvent);
        }
    }

    /**
     * Running simulation state.
     */
    class RunningState extends StateAdapter {
        constructor() {
            super([actions.pause, actions.stop, actions.reset, actions.assemble], ContinuousOrSingleStep.Continuous);
            super.editMode(false);
            super.showorHideArchitecture(false);
        }
        assemble() {
            state = new InitialState();
            serverHub.stop();
            state.assemble();
        }
        startOrPause() {
            state = new PausedState();
            serverHub.pause();
        }
        pause() {
            state = new PausedState();
        }
        stop() {
            state = new AssembledState();
            serverHub.stop();
            Stebs.ui.displayDebug();
        }
        halted() {
            state = new InitialState();
        }
        hwInterrupt() {
            serverHub.hwInterrupt();
        }
        changeSpeed(speed: number) {
            super.changeSpeed(speed);
            super.showorHideArchitecture(false);
        }
    }

    /**
     * Paused / Single step simulation state.
     */
    class PausedState extends StateAdapter {
        constructor() {
            super([actions.start, actions.continue, actions.stop, actions.reset, actions.assemble,
            actions.doStep, actions.undoStep], ContinuousOrSingleStep.SingleStep);
            super.editMode(false);
            super.showorHideArchitecture();
        }
        assemble() {
            state = new InitialState();
            serverHub.stop();
            state.assemble();
        }
        start() {
            state = new RunningState();
            serverHub.createBreakpoints();
            serverHub.run(Stebs.ui.getStepSize());
        }
        startOrPause() { this.start(); }
        stop() {
            state = new AssembledState();
            serverHub.stop();
            Stebs.ui.displayDebug();
        }
        singleStep(stepSize: SimulationStepSize) {
            serverHub.singleStep(stepSize);
            var enabledActions: string[] = [actions.doStep, actions.undoStep];
            for (var action of enabledActions) {
                $('#' + action).prop('disabled', false);
            }
        }
        undoSingleStep(stepSize: SimulationStepSize) {
            serverHub.undoSingleStep(stepSize);
        }
        halted() {
            state = new InitialState();
        }
        disableUndo() {
            var disabledActions: string[] = [actions.undoStep];
            for (var action of disabledActions) {
                $('#' + action).prop('disabled', true);
            }
        }
        editBreakpoint(marker: JQuery, ipNr: number, e: JQueryEventObject) {
            Stebs.breakpoints.editBreakpointMarker(marker, ipNr, e);
        }

        hwInterrupt() {
            serverHub.hwInterrupt();
        }

        addBreakpoint(cm: CodeMirror.Editor, line: number, gutter: string, clickEvent: MouseEvent) {
            Stebs.breakpoints.addOrRemoveBreakpointMarker(cm, line, gutter, clickEvent);
        }
        startDebug() {
            this.start();
        }
    }
}