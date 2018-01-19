module Stebs {

    export var registerControl = {
        InitialStackPointer: 0xbf,

        registers: <{ [register: string]: Register }>{},
        defaultRegisters: ['AL', 'BL', 'CL', 'DL', 'IP', 'SP', 'SEL', 'MBR',  'Status', 'MAR', 'MDR', 'IR', 'RES', 'X', 'Y', 'MIP', 'Interrupt'],
        defaultRamRegisters: ['AL', 'BL', 'CL', 'DL', 'IP', 'SP', 'Status'],
        defaultRegistersArchitecture: ['SEL', 'MBR', 'MAR', 'MDR', 'IR', 'RES', 'X', 'Y', 'MIP', 'Interrupt'],
        propagateToRam: ['IP', 'SP'],

        /** keeps track of how many elements are in .addWatches .elementList */
        ramListLength: 0,
        architectureListLength: 0,

        /**
         * Initialize the registerControl
         */
        init(): void {
            $('#ram-newWatchesButton').click(registerControl.showRamWatchSelection);
            $('#architecture-newWatchesButton').click(registerControl.showArchitectureWatchSelection);
            $(document).click(Stebs.registerControl.hideWatchesSelection);
            Stebs.registerControl.initAddWatchesEventHandler();
            architectureCanvas.initAndUpdateCanvas('');
            architectureCanvas.setCanvasSize(parseInt(Widths.mincanvas));
        },

        /**
         * Hides the watches selection if the user clicks anywhere else than the list or the button.
         */
        hideWatchesSelection(e: Event): void {
            var target: any = e.target;
            if (($('#ram-addWatches').is(":visible")) &&
                !$(target).is('a.registerLink') &&
                target.parentNode.id !== 'ram-elementList' &&
                target.parentNode.id !== 'ram-addWatches' &&
                target.parentNode.id !== 'ram-addWatchElement' &&
                target.parentNode.id !== 'ram-newWatchesButton') {
                $('#ram-addWatches').hide();
                $(".addWatches.dropdown-content").removeClass("open").addClass("closed");
                $("#ram-newWatchesButton").css("background-color", "transparent");
            }
            if (($('#architecture-addWatches').is(":visible")) &&
                !$(target).is('a.registerLink') &&
                target.parentNode.id !== 'architecture-elementList' &&
                target.parentNode.id !== 'architecture-addWatches' &&
                target.parentNode.id !== 'architecture-addWatchElement' &&
                target.parentNode.id !== 'architecture-newWatchesButton') {
                $('#architecture-addWatches').hide();
                $(".addWatches.dropdown-content").removeClass("open").addClass("closed");
                $("#architecture-newWatchesButton").css("background-color", "transparent");
            }
        },

        /**
         * Opens a dialog to select a new watch.
         */
        showRamWatchSelection() {
            var registers = registerControl.registersWithoutWatches();
            $('#ram-elementList').empty();
            registerControl.ramListLength = 0;
            for (var i = 0; i < registers.length; i++) {
                //add only registers who belong to RAM side panel.
                if (Stebs.registerControl.defaultRamRegisters.indexOf(registers[i].getType()) > -1) {
                    let link = function () {
                        var register = registers[i];
                        return $('<a>')
                            .prop('href', '#')
                            .attr('id', 'registerLink' + register.getType())
                            .addClass('registerLink')
                            .text(register.getDisplayName())
                            //create delegated bingind using .on() (won't work with .click()):
                            //see: https://stackoverflow.com/questions/6658752/click-event-doesnt-work-on-dynamically-generated-elements
                            .on('click', function (event) {
                                registerControl.addWatch(register.getType());
                                $(this).remove();
                                //refresh list
                                $('#ram-addWatches').hide();
                                $('#ram-addWatches').show();
                                registerControl.ramListLength--;
                                if (registerControl.ramListLength === 0)
                                    $('#ram-elementList').append('<span>---</span>');
                            });
                    }();
                    $('#ram-elementList').append(link);
                    registerControl.ramListLength++;
                }
            }
            if (registerControl.ramListLength === 0)
                $('#ram-elementList').append('<span>---</span>');
            $('#ram-addWatches').show();
        },

        /**
         * Opens a dialog to select a new watch.
         */
        showArchitectureWatchSelection() {
            var registers = registerControl.registersWithoutWatches();
            $('#architecutre-elementList').empty();
            registerControl.architectureListLength = 0;
            for (var i = 0; i < registers.length; i++) {
                //add only registers who belong to architecture side panel.
                if (Stebs.registerControl.defaultRegistersArchitecture.indexOf(registers[i].getType()) > -1) {
                    let link = function () {
                        var register = registers[i];
                        return $('<a>')
                            .prop('href', '#')
                            .addClass('registerLink')
                            .text(register.getDisplayName())
                            //create delegated bingind using .on() (won't work with .click()):
                            //see: https://stackoverflow.com/questions/6658752/click-event-doesnt-work-on-dynamically-generated-elements
                            .on('click', function (event) {
                                registerControl.addWatch(register.getType());
                                $(this).remove();
                                //refresh list
                                $('#architecture-addWatches').hide();
                                $('#architecture-addWatches').show();
                                registerControl.architectureListLength--;
                                if (registerControl.architectureListLength === 0)
                                    $('#architecutre-elementList').append('<span>---</span>');                            });
                    }();
                    $('#architecutre-elementList').append(link);
                    registerControl.architectureListLength++;
                }
            }
            if (registerControl.architectureListLength === 0)
                $('#architecutre-elementList').append('<span>---</span>');
            $('#architecture-addWatches').show();
        },


        initAddWatchesEventHandler() {
            //#ram-AddWatches and #architecture-AddWatches dropdown handler
            $(".watcher.watchElement.dropdown").click(function (event) {
                let target = $(this).children('button.newWatchesButton').first();
                if (target && !$(event.target).is('a.registerLink')) {
                    let dropdownContent: any, dropdownButton: any;
                    //used to ensure that the other .addWatches gets closed
                    let otherWatcherContent: any, otherWatcherButton: any;
                    if (target.attr('id') === 'ram-newWatchesButton') {
                        dropdownContent = $('#ram-addWatches');
                        dropdownButton = $('#ram-newWatchesButton');
                        otherWatcherContent = $('#architecture-addWatches');
                        otherWatcherButton = $('#architecture-newWatchesButton');
                    } else if (target.attr('id') === 'architecture-newWatchesButton') {
                        dropdownContent = $('#architecture-addWatches');
                        dropdownButton = $('#architecture-newWatchesButton');
                        otherWatcherContent = $('#ram-addWatches');
                        otherWatcherButton = $('#ram-newWatchesButton');
                    }
                    if (dropdownContent.hasClass("open")) {
                        dropdownContent.removeClass("open").addClass("closed");
                        dropdownContent.hide();
                        dropdownButton.css("background-color", "transparent");
                    } else if (dropdownContent.hasClass("closed")) {
                        dropdownContent.removeClass("closed").addClass("open");
                        dropdownContent.show();
                        dropdownButton.css("background-color", "#5170a6");
                        if (otherWatcherContent.hasClass("open")) {
                            otherWatcherContent.removeClass("open").addClass("closed");
                            otherWatcherContent.hide();
                            otherWatcherButton.css("background-color", "transparent");
                        }
                    }
                }
            });
        },

        /**
         * Called when available registers are received from the server.
         */
        setRegisters(registersByTypes: string[]) {
            //Remove all watches
            for (var type in this.registers) {
                var register: Register = this.registers[type];
                if (register.hasWatchElemet()) { register.getWatchElement().remove(); }
            }
            //Remove all registers
            registerControl.registers = {};
            //Add new register and watches
            for (var i = 0; i < registersByTypes.length; i++) {
                var newRegister = new Register(registersByTypes[i]);
                this.registers[registersByTypes[i]] = newRegister;
                if (registerControl.defaultRegisters.indexOf(registersByTypes[i]) != -1) {
                    newRegister.addWatchElement();
                }
            }
            registerControl.resetRegisters();
        },

        /**
        * Returns all registers
        */
        getAllRegisters(): Register[] {
            var registerNames: Register[] = [];
            for (var type in registerControl.registers) {
                var register = registerControl.registers[type];
                registerNames.push(register)
            }
            return registerNames;
        },

        /**
        * Sets the highlighted flag for all registers to false.
        */
        setAllRegistersToUnhighlighted() {
            for (var type in registerControl.registers) {
                registerControl.registers[type].updateHighlight(false);
            }
        },

        /**
         * Update the register (type) to the given value.
         * @param type the register to change.
         * @param value the new calue.
         * @param changed if the register should be highlighted.
         */
        updateRegister(type: string, value: number, highlight: boolean) {
            if (type in registerControl.registers) {
                registerControl.registers[type].updateValue(value);
                registerControl.registers[type].updateHighlight(highlight);
                if (type == 'IP') {
                    ramContent.setInstructionPointer(value);
                } else if (type == 'SP') {
                    ramContent.setStackPointer(value);
                }
            }
        },

        /** 
         * Resets all registers to their initial value.
         */
        resetRegisters() {
            for (var type in registerControl.registers) {
                registerControl.registers[type].reset();
            }
            watchControl.resetHighlighting();
            ramContent.setInstructionPointer(0);
            ramContent.setStackPointer(registerControl.InitialStackPointer);
        },
        /**
         * Add a watch element to the register (type).
         * @param type the register to add a watch.
         */
        addWatch(type: string) {
            if (type in registerControl.registers) {
                registerControl.registers[type].addWatchElement();
            }
        },

        /**
         * Returns an array, which contains all register types that don't have a watch yet.
         */
        registersWithoutWatches(): Register[] {
            var registerNames: Register[] = [];
            for (var type in registerControl.registers) {
                var register = registerControl.registers[type];
                if (!register.hasWatchElemet()) { registerNames.push(register); }
            }
            return registerNames;
        }

    };
    
    export var watchControl = {

        resetHighlighting(): void {
            $('.watcher').removeClass('changed');
        }

    };

    export class Register {
        /**
        * Convert a type to a replacement name.
        */
        private static typeToName: { [type: string]: string } = {
            ['Interrupt']: 'IRF', //IRF = Interrupt Flag
            ['Status']: 'SR' //SR = Status Register
        };

        /**
        * Create a StatusWatchElement form a register.
        */
        private static watchFactories: { [type: string]: (register: Register) => WatchElement } = {
            ['Status']: (register) => new StatusWatchElement(register),
            ['MIP']: (register) => new MipWatchElement(register),
            ['Interrupt']: (register) => new IrfWatchElement(register)
        }

        private type: string;
        private value: number;
        private highlight: boolean;
        private watchElement: WatchElement;

        constructor(name: string) {
            this.type = name;
            this.value = 0;
            this.highlight = false;
        }

        public getType(): string {
            return this.type;
        }

        public getValue(): number {
            return this.value;
        }

        public getHighlight(): boolean {
            return this.highlight;
        }

        public getWatchElement(): WatchElement {
            return this.watchElement;
        }

        public hasWatchElemet(): boolean {
            return this.watchElement != null;
        }

        /**
         * Update the register to the newValue.
         * @param newValue the newValue.
         */
        public updateValue(newValue: number) {
            this.value = newValue;
            if (this.watchElement != null) {
                this.watchElement.changed();
            }
        }

        /**
        * Updates the flag, if the register sgould be highlighted.
        * @param newHighlight the new highlighted flag.
        */
        public updateHighlight(newHighlight: boolean) {
            this.highlight = newHighlight;
        }

        /** 
        * Resets the value of this register to the initial state. 
        */
        public reset() {
            if (this.getType() == 'SP') { this.updateValue(registerControl.InitialStackPointer); }
            else { this.updateValue(0); }
            this.updateHighlight(false);
        }

        /**
         * Add a watchelement.
         */
        public addWatchElement() {
            if (this.getType() in Register.watchFactories) { this.watchElement = Register.watchFactories[this.getType()](this); }
            else { this.watchElement = new WatchElement(this); }
            this.watchElement.show();
        }

        /**
         * Remove the watchElement
         */
        public removeWatchElement() {
            this.watchElement = null;
        }

        /**
        * Returns the name, which should be displayed for this watch element.
        */
        getDisplayName(): string {
            return this.getType() in Register.typeToName ? Register.typeToName[this.getType()] : this.getType()
        }
    };

    export class WatchElement {
        private register: Register;
        private showBinary: boolean = false;

        constructor(register: Register) {
            this.register = register;
        }

        getRegister(): Register {
            return this.register;
        }

        getType(): string {
            return this.getRegister().getType();
        }

        isShowBinary(): boolean {
            return this.showBinary;
        }

        setShowBinary(value: boolean) {
            this.showBinary = value;
            this.update();
        }

        /** Toggles element between binary and hex representation. */
        toggleRepresentation(): void { this.setShowBinary(!this.isShowBinary()); }

        /** Adds a new watch of this register type to the watcher elements. */
        show(): void {
            switch (this.getType()) {
                case Stebs.registerControl.defaultRamRegisters[0]:
                    this.showInRamPanel();
                    break;
                case Stebs.registerControl.defaultRamRegisters[1]:
                    this.showInRamPanel();
                    break;
                case Stebs.registerControl.defaultRamRegisters[2]:
                    this.showInRamPanel();
                    break;
                case Stebs.registerControl.defaultRamRegisters[3]:
                    this.showInRamPanel();
                    break;
                case Stebs.registerControl.defaultRamRegisters[4]:
                    this.showInRamPanel();
                    break;
                case Stebs.registerControl.defaultRamRegisters[5]:
                    this.showInRamPanel()
                    break;
                case Stebs.registerControl.defaultRamRegisters[6]:
                    this.showInRamPanel();
                    break;
                case Stebs.registerControl.defaultRegistersArchitecture[0]:
                    this.showInArchitecturePanel();
                    break;
                case Stebs.registerControl.defaultRegistersArchitecture[1]:
                    this.showInArchitecturePanel();
                    break;
                case Stebs.registerControl.defaultRegistersArchitecture[2]:
                    this.showInArchitecturePanel();
                    break;
                case Stebs.registerControl.defaultRegistersArchitecture[3]:
                    this.showInArchitecturePanel();
                    break;
                case Stebs.registerControl.defaultRegistersArchitecture[4]:
                    this.showInArchitecturePanel();
                    break;
                case Stebs.registerControl.defaultRegistersArchitecture[5]:
                    this.showInArchitecturePanel();
                    break;
                case Stebs.registerControl.defaultRegistersArchitecture[6]:
                    this.showInArchitecturePanel();
                    break;
                case Stebs.registerControl.defaultRegistersArchitecture[7]:
                    this.showInArchitecturePanel();
                    break;
                case Stebs.registerControl.defaultRegistersArchitecture[8]:
                    this.showInArchitecturePanel();
                    break;
                case Stebs.registerControl.defaultRegistersArchitecture[9]:
                    this.showInArchitecturePanel();
                    break;
            }
        }

        showInRamPanel(): void {
            $('#ram-watcher-elements').append(this.asJQuery());
            this.update();
        }
        
        showInArchitecturePanel(): void {
            $('#architecture-watcher-elements').append(this.asJQuery());
            this.update();
        }

        /** Removes this watch from the watcher elements. */
        remove(): void {
            $('#watch-' + this.getType()).remove();
            this.getRegister().removeWatchElement();
        }

        /** Updates the view of this watcher element. */
        update(): void {
            $('#watch-' + this.getType() + ' .watch-element-value').text(this.getValueFormated());
        }

        changed(): void {
            $('#watch-' + this.getType()).addClass('changed');
            this.update();
        }

        /**
         * Get the value, which should be shown for this watch element.
         * The output depends on the specified number base setting (hex or binary).
         */
        getValueFormated(): string {
            if (this.showBinary) {
                var binary = convertNumber(this.register.getValue(), 2, 8);
                return binary.slice(0, 4) + '\'' + binary.slice(4, 8);
            }
            return convertNumber(this.register.getValue(), 16, 2);
        }

        /** Creates the html structure for this watch. */
        asJQuery(): JQuery {
            var name = $('<p>').text(this.getRegister().getDisplayName());
            var link = $('<a>')
                .prop('href', '#')
                .addClass('watch-element-value')
                .text(this.getValueFormated())
                .click(() => this.toggleRepresentation());
            var closeButton = $('<button>')
                .text('x')
                .click(() => this.remove());
            return $('<div>')
                .prop('id', 'watch-' + this.getType())
                .addClass('watcher')
                .append(closeButton)
                .append(name)
                .append(link);
        }

    }

    enum CustomWatchStates { Custom, Hex, Bin };

    /**
     * Base class for whatch elements that toggle between 3 states.
     */
    abstract class CustomStateWhatchElement extends WatchElement {

        private state = CustomWatchStates.Custom

        getState(): CustomWatchStates {
            return this.state;
        }

        /** Toggles between the three possible states. */
        toggleRepresentation() {
            if (this.state == CustomWatchStates.Custom) { this.state = CustomWatchStates.Bin; this.setShowBinary(true); }
            else if (this.state == CustomWatchStates.Bin) { this.state = CustomWatchStates.Hex; this.setShowBinary(false); }
            else { this.state = CustomWatchStates.Custom; this.setShowBinary(false); }
        }
    }

    class StatusWatchElement extends CustomStateWhatchElement {

        update() {
            if (this.getState() != CustomWatchStates.Custom) { super.update(); return; }
            var value = this.getRegister().getValue();
            var interrupt = (value & 16) > 0 ? 1 : 0;
            var signed = (value & 8) > 0 ? 1 : 0;
            var overflow = (value & 4) > 0 ? 1 : 0;
            var zero = (value & 2) > 0 ? 1 : 0;
            $('#watch-' + this.getType() + ' .watch-element-value').text('I:' + interrupt + ' S:' + signed + ' O:' + overflow + ' Z:' + zero);
        }

    }

    class IrfWatchElement extends CustomStateWhatchElement {

        update() {
            if (this.getState() != CustomWatchStates.Custom) { super.update(); return; }
            $('#watch-' + this.getType() + ' .watch-element-value').text(this.getRegister().getValue());
        }

    }

    class MipWatchElement extends WatchElement {

        getValueFormated(): string {
            if (this.isShowBinary()) {
                var binary = convertNumber(this.getRegister().getValue(), 2, 12);
                return binary.slice(0, 4) + '\'' + binary.slice(4, 8) + '\'' + binary.slice(8, 12);
            }
            return convertNumber(this.getRegister().getValue(), 16, 3);
        }

    }
    
}