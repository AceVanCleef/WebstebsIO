module Stebs {
    /**
     * dynamicTable only shows a given amount of elements while still containing all Elements.
     */
    export class DynamicTable {

        private totalElements: number;
        private visibleElements: number;
        private table: JQuery;
        private tableContainer: JQuery;
        private tableRowSelector: string;
        private rowNames: { [key: string]: number; } = {};
        private highlightedLine: number;

        /**
         * Create a dynamic table out of a given HTML table.
         * @param table contains the table as the only element
         * @param tableContainer the container of the table, usually the parent of the table
         */
        constructor(table: JQuery, tableContainer: JQuery) {
            this.table = table;
            this.tableContainer = tableContainer;
            this.tableRowSelector = '#' + table[0].id + " tr";
        }

        /**
         * Show only first elements and create scroll listener
         * @param firstCellArray Array with numbers of the first cell, each number has to be unique.
         * @param visibleElements Number of Elements that should be set visible at once. Should be bigger than the visible Elements and smaller than the total Elements.
         */
        init(firstCellArray: number[], visibleElements: number) {
            this.totalElements = firstCellArray.length + 1; // Title makes +1
            this.visibleElements = visibleElements;
            var that: DynamicTable = this;
            this.table.children('tbody').children(that.tableRowSelector).slice(that.visibleElements).css('display', 'none');
            this.table.children('tbody').children(that.tableRowSelector).slice(0, that.visibleElements).css('display', 'inherit');
            this.setRowNames(firstCellArray);
            this.tableContainer.scrollTop(0);
            this.setTableDivHeights();
            this.tableContainer.on('scroll', () => {
                var scrollTop = that.tableContainer.scrollTop();
                var scrollUpdate = 20; // distance of last visible element to the border of the table before it updates.
                var lastElement = that.table.find("tr:visible:last");
                if (!lastElement) return; // if table is not visible, there is no last element.
                var firstElement = that.table.find("tr:visible:not(.tabletitle):first");
                var lastElementNum = parseInt(lastElement[0].id.substr(4, lastElement[0].id.length - 4));
                var firstElementNum = parseInt(firstElement[0].id.substr(4, firstElement[0].id.length - 4));
                var currentTopElement = Math.round(scrollTop / lastElement.height());

                if ((lastElementNum !== that.totalElements - 2) && (lastElement.position().top < that.tableContainer.height() + scrollUpdate)) {
                    that.jumpToPosition(currentTopElement);
                }
                if ((firstElementNum !== 0) && (firstElement.position().top > scrollUpdate * -1) && (firstElement.position().top != 0)) {
                    that.jumpToPosition(currentTopElement);
                }
            });
        }

        private setTableDivHeights() {
            var firstElement = this.table.find("tr:visible:not(.tabletitle):first");
            if (firstElement.length === 0) return;
            var currentTopPos = parseInt(firstElement[0].id.substr(4, firstElement[0].id.length - 4));
            var divTopHeight = currentTopPos * firstElement.height();
            var divBotHeight = (this.totalElements-1 - (currentTopPos + this.visibleElements)) * firstElement.height();
            this.tableContainer.children('.tabletop').height(divTopHeight);
            this.tableContainer.children('.tablebottom').height(divBotHeight);
        }

        /**
         * Maps the elements of a row in the table to the line number.
         * This is required to highlight specific lines because the update processor function does not know on which line the information is stored.
         * @param elements
         */
        setRowNames(elements: number[]) {
            for (var i: number = 0; i < elements.length; i++) {
                this.rowNames[elements[i] + ''] = i;
            }
        }

        /**
        * Returns the line number of the row with the given name.
        */
        numberOfRow(name: string): number {
            return this.rowNames[name];
        }


        /**
         * Jump to a given position in table and hide other Elements that are not within the range of the position.
         * @param position
         */
        jumpToPosition(position: number, doScroll: boolean = false): void {
            var rowOffset = 0;
            var minRow = position - (this.visibleElements / 2);

            if (minRow <= 0) {
                rowOffset = Math.abs(minRow);
                minRow = 0;
            }
            var maxRow = position + rowOffset + (this.visibleElements / 2);
            if (maxRow > this.totalElements) {
                rowOffset = this.totalElements - maxRow;
                maxRow = this.totalElements;
            }
            if (rowOffset < 0) minRow += rowOffset;
            this.table.children('tbody').children(this.tableRowSelector).slice(minRow, maxRow).css('display', 'inherit');
            this.table.children('tbody').children(this.tableRowSelector).slice(1, minRow).css('display', 'none'); //Hide everything but the first line, which is the title. For the spacing of the table //TODO: optimize
            this.table.children('tbody').children(this.tableRowSelector).slice(maxRow, this.totalElements).css('display', 'none'); //TODO: optimize

            this.setTableDivHeights();

            if (doScroll) this.scrollToPosition(position);
        
        }

        getTableElement(): HTMLTableElement {
            return <HTMLTableElement>this.table[0];
        }

        getTableContainerElement(): HTMLTableElement {
            return <HTMLTableElement>this.tableContainer[0];
        }

        /**
         * Sets the highlighted line in the table.
         */
        setHighlightedLine(line: number) {
            line = Math.round(line);
            this.table.find('#row_' + this.highlightedLine).removeClass('active');
            this.highlightedLine = line;
            this.table.find('#row_' + line).addClass('active');
        }

        /**
        * Removes the highlight from the current line.
        */
        unHighlight() {
            this.table.find('#row_' + this.highlightedLine).removeClass('active');
        }

        /**
         * Scrolls the table top to a position.
         * @param position
         */
        scrollToPosition(position: number) {
            this.tableContainer.scrollTop(0); // scroll to top first, otherwise the offset is going to be wrong
            var row: JQuery = this.table.children('tbody').children('#row_' + position);
            if(row.length > 0)
            this.tableContainer.scrollTop(row.position().top);
        }

        /**
         * Clears the table except for the title. Removes scroll listener.
         * Table has to be reinitialized before it is usable again.
         */
        clear() {
            var title = this.table.children('tbody').children('.tabletitle')[0];
            this.table.children('tbody').empty();
            this.table.children('tbody').append(title);
            this.tableContainer.off('scroll');
            this.totalElements = 1;
        }
    }
}