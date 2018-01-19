module Stebs {

    export class ArchitectureCanvas {

        private ctx: CanvasRenderingContext2D;
        private canvas: HTMLCanvasElement;
        private opdDynTable: DynamicTable;
        private canvasFontSize: number = 20;
        private mpmDynTable: DynamicTable;

        constructor(canvas: HTMLCanvasElement, mpmTable: HTMLTableElement, opdTable: HTMLTableElement) {
            this.canvas = canvas;
            this.mpmDynTable = new DynamicTable($(mpmTable), $(mpmTable).parent());
            this.opdDynTable = new DynamicTable($(opdTable), $(opdTable).parent());
            this.ctx = this.canvas.getContext('2d');
        }

        /**
        * Stores a global reference of the canvas and sets the global style.
        */
        setupCanvas(): void {
            var that: Stebs.ArchitectureCanvas = this;
            this.normalizeCanvas();
            this.ctx.font = this.canvasFontSize + 'pt Helvetica';
            this.ctx.textAlign = 'center';

            $(this.canvas).click(e => {
                var clickedX = e.pageX;
                var clickedY = e.pageY;
                var relWidth: number = (($(that.canvas).width() * 1000) / Widths.canvas) / 1000;
                var relHeight: number = $(that.canvas).height() / Heights.canvas;
                var leftOffset: number = $(that.canvas).offset().left;

                if (clickedX > leftOffset + relWidth * 270 && clickedX < leftOffset + relWidth * 315 && clickedY > relHeight * 208 && clickedY < relHeight * 245) {
                    Stebs.state.hwInterrupt();
                }
            });

            $(this.canvas).mousemove(e => {
                var clickedX = e.pageX;
                var clickedY = e.pageY;
                var relWidth: number = (($(that.canvas).width() * 1000) / Widths.canvas) / 1000;
                var relHeight: number = $(that.canvas).height() / Heights.canvas;
                var leftOffset: number = $(that.canvas).offset().left;

                if (clickedX > leftOffset + relWidth * 270 && clickedX < leftOffset + relWidth * 315 && clickedY > relHeight * 208 && clickedY < relHeight * 245) {
                    $(that.canvas).css('cursor', 'pointer');
                }
                else {
                    $(that.canvas).css('cursor', 'auto');
                }
            });
        }

        /**
         * Resize canvas to real size (otherwise the content gets stretched).
         */
        normalizeCanvas(): void {
            var width = parseInt($(this.canvas).css('width'), 10);
            var height = parseInt($(this.canvas).css('height'), 10);
            if (this.canvas.width != width || this.canvas.height != height) {
                this.canvas.width = width;
                this.canvas.height = height;
            }
        }

        /**
        * Initializes the canvas and puts default values into all register values.
        * Updates the canvas and all register values.
        */
        initAndUpdateCanvas(alu: string = '', statusRegisterChanges: boolean[] = new Array(false, false, false, false)): void {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            var img = <HTMLVideoElement>document.getElementById("archpic");
            this.ctx.drawImage(img, 0, 0, Widths.canvas, Heights.canvas);

            for (var i: number = 0; i < registerControl.getAllRegisters().length; i++) {
                var r = registerControl.getAllRegisters()[i];
                var registerName: string = registerControl.getAllRegisters()[i].getDisplayName();
                var registerValue: number = registerControl.getAllRegisters()[i].getValue();
                var registerHighlight: boolean = registerControl.getAllRegisters()[i].getHighlight();
                var x: number = 20;
                var y: number = 20;
                var rectWidth: number = 68;
                var rectHeight: number = 38;
                var changedColor: string = "#FFCC33";
                var unchangedColor: string = "#FFFF55";

                if (alu != "NOP") this.ctx.fillText(alu, 893, 200);



                switch (registerName) {
                    case "X":
                        x = 811; y = 51;
                        break;
                    case "Y":
                        x = 976; y = 52;
                        break;
                    case "RES":
                        x = 894; y = 329;
                        break;
                    case "SEL":
                        x = 1251; y = 197;
                        break;
                    case "AL":
                        x = 1251; y = 284;
                        break;
                    case "BL":
                        x = 1251; y = 338;
                        break;
                    case "CL":
                        x = 1251; y = 391;
                        break;
                    case "DL":
                        x = 1251; y = 444;
                        break;
                    case "SP":
                        x = 1251; y = 511;
                        break;
                    case "IP":
                        x = 1251; y = 605;
                        break;
                    case "MBR":
                        x = 1251; y = 658;
                        break;
                    case "MAR":
                        x = 1223; y = 711;
                        break;
                    case "MDR":
                        x = 1278; y = 764;
                        break;
                    case "IR":
                        x = 576; y = 111;
                        break;
                    case "MIP":
                        x = 250; y = 571;
                        break;
                    case "IRF":
                        x = 485; y = 228;
                        break;
                }

                if (registerName == "MIP") {
                    if (registerHighlight) this.ctx.fillStyle = changedColor;
                    else this.ctx.fillStyle = unchangedColor;
                    this.ctx.fillRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth, rectHeight);
                    this.ctx.fillStyle = "#000000";
                    this.ctx.fillText((convertNumber(registerValue, 16, 3)).toUpperCase(), x, y + this.canvasFontSize / 2);
                }
                else if (registerName == "SR") {
                    var srWidth: number = 26;
                    var srHeight: number = 38;
                    var xPos: number[] = new Array(638, 674, 701, 728);
                    var yPos: number = 417;

                    for (var j: number = 0; j < 4; j++) {
                        if (statusRegisterChanges[j]) this.ctx.fillStyle = changedColor;
                        else this.ctx.fillStyle = unchangedColor;
                        this.ctx.fillRect(xPos[j] - srWidth / 2, yPos - srHeight / 2, srWidth, srHeight);
                    }

                    this.ctx.fillStyle = "#000000";
                    var interrupt = (registerValue & 16) > 0 ? 1 : 0;
                    var signed = (registerValue & 8) > 0 ? 1 : 0;
                    var overflow = (registerValue & 4) > 0 ? 1 : 0;
                    var zero = (registerValue & 2) > 0 ? 1 : 0;
                    this.ctx.fillText('' + interrupt, xPos[0], yPos + this.canvasFontSize / 2);
                    this.ctx.fillText('' + signed, xPos[1], yPos + this.canvasFontSize / 2);
                    this.ctx.fillText('' + overflow, xPos[2], yPos + this.canvasFontSize / 2);
                    this.ctx.fillText('' + zero, xPos[3], yPos + this.canvasFontSize / 2);
                }
                else if (registerName == "IRF") {
                    var irfSize: number = 42;
                    if (registerHighlight) this.ctx.fillStyle = changedColor;
                    else this.ctx.fillStyle = unchangedColor;
                    this.ctx.fillRect(x - irfSize / 2, y - irfSize / 2, irfSize, irfSize);
                    this.ctx.fillStyle = "#000000";
                    this.ctx.fillText(registerValue + '', x, y + this.canvasFontSize / 2);
                }
                else {
                    if (registerHighlight) this.ctx.fillStyle = changedColor;
                    else this.ctx.fillStyle = unchangedColor;
                    this.ctx.fillRect(x - rectWidth / 2, y - rectHeight / 2, rectWidth, rectHeight);
                    this.ctx.fillStyle = "#000000";
                    this.ctx.fillText((convertNumber(registerValue, 16, 2)).toUpperCase(), x, y + this.canvasFontSize / 2);
                }
            }
        }

        /**
         * Set mpmTable with all elements and initialize dynamic table. Set the title to always contain the widest element.
         * @param adr
         * @param na
         * @param ci
         * @param ev
         * @param jc
         * @param val
         * @param af
         * @param alu
         * @param io
         * @param src
         * @param dest
         * @param rw
         */
        setMpm(adr: number[], na: string[], ci: boolean[], ev: boolean[], jc: string[], val: number[], af: boolean[], alu: string[], io: string[], src: string[], dest: string[], rw: string[]) {
            this.mpmDynTable.clear();

            for (var i: number = 0; i < adr.length; i++) {
                var row = <HTMLTableRowElement>this.mpmDynTable.getTableElement().insertRow(this.mpmDynTable.getTableElement().rows.length);
                row.id = 'row_' + i;
                row.insertCell(0).innerHTML = convertNumber(adr[i], 16, 3).toUpperCase();
                row.insertCell(1).innerHTML = na[i];
                row.insertCell(2).innerHTML = (ci[i] ? 'En' : '');
                row.insertCell(3).innerHTML = (ev[i] ? 'En' : '');
                row.insertCell(4).innerHTML = (jc[i] == "Empty" ? '' : jc[i]);
                row.insertCell(5).innerHTML = convertNumber(val[i], 16, 3).toUpperCase();
                row.insertCell(6).innerHTML = (af[i] ? 'En' : '');
                row.insertCell(7).innerHTML = (alu[i] == "NOP" ? '' : alu[i]);
                row.insertCell(8).innerHTML = io[i];
                row.insertCell(9).innerHTML = (src[i] == "Empty" ? '' : src[i].substring(0, 6));
                row.insertCell(10).innerHTML = (dest[i] == "Empty" ? '' : dest[i].substring(0, 6));
                row.insertCell(11).innerHTML = rw[i];
            }
            this.mpmDynTable.init(adr, 30);
        }

        /**
         * Set OPCode table with all its elements
         * @param opc
         * @param adr
         * @param instr
         * @param type
         */
        setOpDecoder(opc: number[], adr: number[], instr: string[], type: string[][]) {
            this.opdDynTable.clear();

            for (var i: number = 0; i < opc.length; i++) {
                if (adr[i] != null) {
                    var opcString: string = convertNumber(opc[i], 16, 2).toUpperCase();
                    var row = <HTMLTableRowElement>this.opdDynTable.getTableElement().insertRow(this.opdDynTable.getTableElement().rows.length);
                    row.id = 'row_' + i;
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    cell1.innerHTML = opcString;
                    cell2.innerHTML = convertNumber(adr[i], 16, 3).toUpperCase();
                    var cell3String = instr[i];
                    cell3.innerHTML = cell3String;
                }
            }
            this.opdDynTable.init(opc, 30);
        }

        /**
         * Calculates new size for Canvas with the size of the architecture container
         * @param newArchitectureWidth
         */
        setCanvasSize(newArchitectureWidth: number) {
            var mpmTitle: JQuery = $(this.mpmDynTable.getTableContainerElement()).parent().find('#staticMpmTitle');
            var opdTitle: JQuery = $(this.opdDynTable.getTableContainerElement()).parent().find('#staticOpdTitle');
            var mpmTable = $(this.getMpmDynTable().getTableElement());
            var opdTable = $(this.getOpdDynTable().getTableElement());
            var mpmTitleSizes = (<HTMLTableRowElement>mpmTable.find('.tabletitle')[0]);
            var opdTitleSizes = (<HTMLTableRowElement>opdTable.find('.tabletitle')[0]);
            var fontSize: string;
           
            $(this.canvas).width((newArchitectureWidth - parseInt(Widths.sidebar) - 5) + 'px');
            $(this.canvas).height(((newArchitectureWidth - parseInt(Widths.sidebar) - 5) / 3 * 2) + 'px');
            $(this.mpmDynTable.getTableContainerElement()).width((this.canvas.offsetWidth / 2.035) + 'px');
            $(this.mpmDynTable.getTableContainerElement()).add(mpmTitle).css({ left: (this.canvas.offsetWidth / 10 * 2.9) + 'px' });
            $(this.mpmDynTable.getTableContainerElement()).add(mpmTitle).css({ top: (this.canvas.offsetHeight / 3 * 2.02) + 'px' });

            fontSize = String((this.canvas.offsetWidth / Widths.canvas * 110) - 6) + '%'; // -6% is min size, and 120% is dynamic
            $(this.mpmDynTable.getTableContainerElement())
                .add(mpmTitle)
                .add(opdTitle)
                .add(this.opdDynTable.getTableContainerElement()).css('font-size', fontSize);
            $(this.mpmDynTable.getTableContainerElement()).height((($(mpmTitleSizes).height() * 6) -15) + 'px');

            $(this.opdDynTable.getTableContainerElement()).width((this.canvas.offsetWidth / 4.7) + 'px');
            $(this.opdDynTable.getTableContainerElement()).height((($(opdTitleSizes).height() * 6) -15) + 'px');
            $(this.opdDynTable.getTableContainerElement()).add(opdTitle).css({ left: (this.canvas.offsetWidth / 12 * 0.85) + 'px' });
            $(this.opdDynTable.getTableContainerElement()).add(opdTitle).css({ top: (this.canvas.offsetHeight / 15 * 0.95) + 'px' });

            mpmTitle.width(mpmTable.width()); // Does not work if table is hidden while resizing.
            opdTitle.width(opdTable.width()); 

            for (var i: number = 0; i < mpmTitleSizes.cells.length; i++) {
                mpmTitle.children(':eq(' + i + ')').width(mpmTitleSizes.cells[i].clientWidth);
            }

            for (var i: number = 0; i < opdTitleSizes.cells.length; i++) {
                opdTitle.children(':eq(' + i + ')').width(opdTitleSizes.cells[i].clientWidth);
            }
        }

        /**
         * Returns width of a scrollbar.
         */
        private getScrollBarWidth() {
            var $outer = $('<div>').css({ visibility: 'hidden', width: 100, overflow: 'scroll' }).appendTo('body'),
                widthWithScroll = $('<div>').css({ width: '100%' }).appendTo($outer).outerWidth();
            $outer.remove();
            return 100 - widthWithScroll;
        };

        /**
         * Highlights a line and jumps to it.
         * @param name Identifier of the line
         */
        highlightMpm(name: string) { //TODO: Highlight color #FFCC33 if it the table jumped and highlighted a different line in this step.
            var line: number = this.mpmDynTable.numberOfRow(name);
            this.mpmDynTable.jumpToPosition(line - 3, true);
            this.mpmDynTable.setHighlightedLine(line); 
        }

        /**
        * Unhighlights all lines in the mpm table and jumps back to the start.
        */
        resetMpm() {
            this.mpmDynTable.jumpToPosition(0, true);
            this.mpmDynTable.unHighlight();
        }

        /**
        * Unhighlights all lines in the opd table and jumps back to the start.
        */
        resetOpd() {
            this.opdDynTable.jumpToPosition(0, true);
            this.opdDynTable.unHighlight();
        }

        /**
        * Highlights a line and jumps to it.
        * @param name Identifier of the line
        */
        highlightOpd(name: string) {
            var line: number = this.opdDynTable.numberOfRow(name);
            this.opdDynTable.jumpToPosition(line - 3, true);
            this.opdDynTable.setHighlightedLine(line);
        }

        getMpmDynTable() {
            return this.mpmDynTable;
        }

        getOpdDynTable() {
            return this.opdDynTable;
        }
    }
}