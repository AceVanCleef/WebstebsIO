module Stebs {
    export class Ram {

        public static RamSize = 256;

        private ramContent: number[];
        private ramToLine: number[];
        private lineToRam: { [key: number]: number; } = {};
        private breakpointArray: number[];
        private isHighlighted: string[] = [];
        private isHidden: boolean = false;
        private stackPointerPos: number = 0;
        private instructionPointerPos: number = 0;
        private ramSlideInProgress: boolean = false;

        constructor(size: number = Ram.RamSize) {
            this.ramContent = Array(size);
            this.breakpointArray = Array(size);
            for (var i: number = 0; i < size; i++) {
                this.ramContent[i] = 0;
                this.breakpointArray[i] = 0;
            }
        }

        /**
         * Initialise the ram.
         */
        public init() {
            var me = this;
            $('#ramTable').empty();
            $('#ramTable').append(this.getAsTable(16));
            $('#hideShowRam').off('click');
            $('#hideShowRamMenu').click(e => {
                e.stopPropagation();
                if (me.ramSlideInProgress) return;
                me.ramSlideInProgress = true;
                me.transactionHideShowRam();

                $('#ramTable').slideToggle(400, () => me.ramSlideInProgress = false);
            });
           // $('#hideShowRamNew').click(me.transactionHideShowRam());
            $('#hideShowRam').click(e => {
                e.stopPropagation();
                if (me.ramSlideInProgress) return;
                me.ramSlideInProgress = true;
                me.transactionHideShowRam();

                $('#ramTable').slideToggle(400, () => me.ramSlideInProgress = false);
                //close #ram-AddWatches dropdown
                if ($('#ram-addWatches').hasClass('open'))
                    $('#ram-newWatchesButton').click();

                visible.ramTable = !visible.ramTable;

                if (visible.ramTable) {
                    $('#collapseRamTable').text('Close RAM');
                } else {
                    $('#collapseRamTable').text('Open RAM');
                }
            });
        }

        /**
         * Hide and show the ram
         */
        private transactionHideShowRam() {
            if (this.isHidden) {
                $('#hideShowRam i.fa[class*="fa-angle-"]').removeClass('fa-angle-down')
                    .addClass('fa-angle-up');
            } else {
                $('#hideShowRam i.fa[class*="fa-angle-"]').removeClass('fa-angle-up')
                    .addClass('fa-angle-down');
            }
            this.isHidden = !this.isHidden;
        }

        /**
         * Set the array containing with ram position points to which line in the editor.
         * @param ram2Line The array containing the positions.
         */
        public setRamToLine(ramToLine: number[]): void {
            this.ramToLine = ramToLine;
            this.lineToRam = {};
            for (var i: number = ramToLine.length - 1; i >= 0; i--)
                this.lineToRam[ramToLine[i]] = i;
        }

        /**
         * Get the linenumber of the instructionpointer
         * @param ipNr the instructionpointer
         */
        public getLineNr(ipNr: number): number {
            return this.ramToLine[ipNr];
        }

        /**
        * Check if line number is an instruction, also returns false on instruction 00 (after ORG 00)
        * so a breakpoint can't be set on the first instruction
        * @param line
        */
        public isLineInRam(line: number): boolean {
            if (this.lineToRam[line]) return true;
            return false;
        }

        /**
         * Get the instruction pointer of the line
         * @param line
         */
        public getIpNr(line: number): number {
            return this.lineToRam[line];
        }

        /**
         * Get the breakpoint iterations of the given ram position(instruction pointer)
         * @param ipNr the instructionpointer
         */
        public getBreakpoint(ipNr: number): number {
            return this.breakpointArray[ipNr];
        }

        /**
         * Set the breakpoint iterations of the given ram position
         * @param ipNr the instructionpointer
         * @param iterations after how many iterations the breakpoint should trigger
         */
        public setBreakpoint(ipNr: number, iterations: number): void {
            this.breakpointArray[ipNr] = iterations;
        }

        /**
         * @returns entire breakpoint to iterations array.
         */
        public getBreakpointArray(): number[] {
            return this.breakpointArray;
        }

        /**
         * Remove breakpoints that are at non-instruction position.
         */
        removeObsoleteBreakpoints(lines: number) {
            for (var i = 0; i < lines; i++)
                if (!ramContent.isLineInRam(i)) breakpoints.removeBreakpoint(i);
        }

        /**
         * Set the ram content.
         * @param ram The array containing the new ram Data.
         */
        public setContent(ram: number[]): boolean {
            if (ram == null && ram.length != this.ramContent.length) {
                return false;
            } else {
                this.ramContent = ram;
                $('#ramTable').empty();
                $('#ramTable').append(this.getAsTable(16));
                return true;
            }
        }

        /**
         * Highlight the changed ram pos
         * @param elementName The elementname to highlight.
         */
        private highlight(elementName: string): void {
            this.resetHighlights();
            $(elementName).prop('class', 'changed');
            this.isHighlighted.push(elementName);
        }

        /**
         * Reset all highlighted lines.
         */
        public resetHighlights(): void {
            this.isHighlighted.forEach(element => {
                $(element).removeClass('changed');
            });
        }

        /**
         * Set the stackpointer to te given position.
         * @param position The new position of the stackpointer
         */
        public setStackPointer(position: number) {
            $('#cell-' + this.stackPointerPos).removeClass('stackPointer');
            $('#cell-' + position).addClass('stackPointer');
            this.stackPointerPos = position;
        }


        /**
         * Set the intructionpointer to the given position.
         * @param position The new position of the instructionpointer.
         */
        public setInstructionPointer(position: number) {
            $('#cell-' + this.instructionPointerPos).removeClass('instructionPointer');
            $('#cell-' + position).addClass('instructionPointer');
            this.instructionPointerPos = position;
        }

        /**
         * Change the ram at the given position to the new value.
         * @param pos The position to change the value;
         * @param value The new value witch will be set.
         */
        public setRamAt(pos: number, value: number): boolean {
            if (pos < 0 || pos >= this.ramContent.length || value < 0 || value > 255) {
                return false;
            }
            this.ramContent[pos] = value;
            $('#cell-' + pos).text(Stebs.convertNumber(value, 16, 2));
            this.highlight('#cell-' + pos);
            return true;
        }

        /**
         * Get the ramcontent as string (was used for testing).
         * @param lineBreak 
         */
        public getAsString(lineBreak: number): string {
            var asString: string = '';
            for (var i: number = 0; i < this.ramContent.length; i++) {
                if (i % lineBreak == 0) {
                    asString += '\n';
                }
                if (i % 2 == 0) {
                    asString += ' ';
                }
                asString += this.ramContent[i].toString(16);
            }
            return asString;
        }

        /**
         * Load the ram as Table.
         * @param lineLengh the length of a row
         */
        public getAsTable(lineLengh: number): HTMLTableElement {
            var table: HTMLTableElement;
            var thead: HTMLTableSectionElement;
            var tbody: HTMLTableSectionElement;

            table = document.createElement('table');
            //table.setAttribute('id', 'ramContent');
            thead = <HTMLTableSectionElement>table.createTHead();
            tbody = <HTMLTableSectionElement>table.createTBody();
            var hrow = <HTMLTableRowElement>table.tHead.insertRow(0);
            var bolt_elem_id = 'bold-elem';

            hrow.insertCell(0).innerHTML = '';
            for (var i: number = 0; i < lineLengh; i++) {
                var cell = hrow.insertCell(i + 1);
                cell.innerHTML = i.toString(16);
                cell.id = bolt_elem_id;
            }
            var newWith = (this.ramContent.length / (lineLengh));
            for (var i: number = 0; i < newWith; i++) {
                var row = <HTMLTableRowElement>tbody.insertRow();
                for (var j: number = 0; j < lineLengh; j++) {
                    if (j == 0) {
                        var cell = row.insertCell(0);
                        cell.id = bolt_elem_id;
                        cell.innerHTML = i.toString(16) + '0';
                    }
                    var cell = row.insertCell(j + 1);

                    cell.innerHTML = Stebs.convertNumber(this.ramContent[(i * newWith) + j], 16, 2);
                    cell.id = 'cell-' + ((i * newWith) + j);
                }
            }
            return table;
        }

        //#stefan
        /**
         * evaluates whether at least one breakpoint has been set by the user.
         */
        public hasAnyBreakpoints() {
            for (var i: number = 0; i < this.breakpointArray.length; i++) {
                if (this.breakpointArray[i] > 0) { return true; }
            }
            return false;
        }
    };

    /**
     * Create the ram class and set it to ramContent 
     * (Call ramContent if you want to interact with this class)
     */
    export var ramContent = new Stebs.Ram(256);
}
