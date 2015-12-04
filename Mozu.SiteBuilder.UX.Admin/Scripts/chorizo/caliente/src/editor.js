(function(win, doc) {

    class Editor {
        constructor() {
            this.windowContext = window;
        }

        init() {
            document.body.classList.add('mz-cms-editing');
            this.createHintBar();
            this.createDragIcon();
            this.createResizer();
            this.resetDirtyState();
            this.fireEvent('pageload', this);
            this._dirty = false;
        }

        setDirtyState(val) {
            this._dirty = val ? val : false;
            console.log(this._dirty);
        }

        createResizer() {
            this.resizer = doc.createElement('div');
            this.handle = doc.createElement('div');

            this.resizer.classList.add('mz-cms-resizer');
            this.handle.classList.add('mz-cms-bottom');

            this.resizer.appendChild(this.handle);

            this.initResizerEvents();

            doc.body.appendChild(this.resizer);
        }

        idSanitizer(str) {
            return str.replace(/[^0-9a-zA-Z]+/g, '');
        }

        getWidgetIcon(id) {
            return this.widgetIconDefinitions[this.idSanitizer(id)];
        }

        setCursorStyle(type) {

            let cursorStyle = null;

            switch (type) {
            case 'drag':
                cursorStyle = 'ew-resize';
                break;
            default:
                cursorStyle = 'auto';
            }

            document.body.style.cursor = cursorStyle;
        }

        initResizerEvents() {

            let block;
            let widgetData;
            let newHeight;

            this.handle.addEventListener('mousedown', (function() {
                this.resizing = true;
            }).bind(this));

            doc.addEventListener('mouseup', (function() {
                this.setCursorStyle();
                this.resizing = false;
                this._draggingColumn = false;

                if (block && widgetData) {
                    widgetData.config.height = newHeight;
                    block.setAttribute('data-widget', JSON.stringify(widgetData));
                }
                block = null;
                widgetData = null;

            }).bind(this));

            doc.addEventListener('mousemove', (function(e) {

                if (this.resizing) {
                    block = this.resizer.parentNode;
                    widgetData = JSON.parse(block.getAttribute('data-widget'));
                    newHeight = doc.body.scrollTop + e.clientY - block.offsetTop - 320;

                    block.querySelector('.mz-cms-content').style.height = newHeight + 'px';
                }

                else if (this._draggingColumn) {
                    this.setDirtyState(true);
                    this.resizePercentage(e);
                }

            }).bind(this));
        }

        getComputedPercentage(e, col) {

            // algorithm: where the mouse is relative to the whole page -
            // the offset left of the column were dragging / the width of the parent row

            const percentage = ((e.clientX - col.getBoundingClientRect().left) / this.getComputedWidth(col.parentNode));

            return percentage;
        }

        getOtherColsCombinedWidth(allAssociatedColumns, col) {
            return Math.abs(allAssociatedColumns.reduce((prev, curr) => {
                if (!curr.isSameNode(col)
                    && !curr.isSameNode(col.nextElementSibling)
                    && curr.parentNode.isSameNode(col.parentNode)) {
                    return prev + parseFloat(curr.style.width);
                }
                return prev;
            }, 0));
        }

        getWidthWithQuery(allAssociatedColumns, parent, col) {
            return Math.abs(allAssociatedColumns.reduce((prev, curr) => {
                if (curr.parentNode.isSameNode(parent) && !curr.isSameNode(col)) {
                    return prev + parseFloat(curr.style.width);
                }
                return prev;
            }, 0) - 100);
        }

        resizePercentage(e) {
            e.preventDefault();
            this.setCursorStyle('drag');

            const MIN_WIDTH = 10;
            const col = this._draggingColumn;
            const nextSibling = col.nextElementSibling;
            const computedPercentage = this.getComputedPercentage(e, col) * 100;
            const allAssociatedColumns = Array.from(col.parentNode.querySelectorAll('[class*="mz-cms-col-"]'));
            const otherColsWidth = this.getOtherColsCombinedWidth(allAssociatedColumns, col);
            let finalColumnWidth;
            let remainingColumnsWidth;

            // if the width of our newly computed percentage is greater than the allowed limit, return
            if (otherColsWidth + computedPercentage + MIN_WIDTH >= 100) {
                return false;
            }
            else if (computedPercentage < MIN_WIDTH) {
                col.style.width = MIN_WIDTH + '%';
            }
            else {
                col.style.width = computedPercentage + '%';
            }

            // once we know what weve resized our target element to,
            // we can query the remaining elements to deterime what the nextSibling width should be
            remainingColumnsWidth = this.getWidthWithQuery(allAssociatedColumns, col.parentNode, nextSibling);

            // dont let them make a column smaller than 10%
            if (remainingColumnsWidth < MIN_WIDTH) {
                nextSibling.style.width = MIN_WIDTH + '%';
                finalColumnWidth = this.getWidthWithQuery(col.parentNode, col);
                col.style.width = finalColumnWidth + '%';
            }

            else {
                nextSibling.style.width = remainingColumnsWidth + '%';
            }
        }

        getComputedWidth(el) {
            return parseInt(window.getComputedStyle(el, null).width, 10);
        }

        getResizer() {
            return this.resizer;
        }

        createHintBar() {
            this.hintbar = doc.createElement('div');
            this.hintBarMessage = doc.createElement('div');
            this.hintbar.className = 'mz-cms-hint-bar';
            this.hintBarMessage.className = 'mz-cms-hint-message';
            this.hintbar.appendChild(this.hintBarMessage);

            this.hintbarHeight = '3px';
            this.hintbarPadding = 45;

            doc.body.appendChild(this.hintbar);

        }

        hideHintBar() {
            this.hintbar.style.display = 'none';
        }

        showColHintBar(element, x, y, width, msg) {
            this.cleanhintbar();

            if (msg === 'left' || msg === 'right') {
                this.hintbar.classList.add('mz-cms-upright');
                this.hintbar.style.position = 'absolute';
                this.hintbar.style.height = parseInt(window.getComputedStyle(element.parentNode, null).height, 10) + 'px';
                this.hintbar.style.top = '0';
                this.hintbar.style.width = this.hintbarHeight;
                this.hintbar.style[msg] = '-2px';
            }

            const hintBarMessage = this.getModifiedMsg('col', msg, element);

            this.hintBarMessage.innerHTML = hintBarMessage;

            this.updateHintBarMessageCls(hintBarMessage);

            element.appendChild(this.hintbar);

            this.hintbar.style.display = 'block';
        }

        updateHintBarMessageCls(message) {
            this.hintBarMessage.classList.add(message);
        }

        showWidgetHintBar(element, col, x, y, height, msg) {
            this.cleanhintbar();

            // dont need to hint, unless there are already widgets in this col
            if (!col.querySelector('.mz-cms-block') || !msg) {
                this.hintbar.style.display = 'none';
                return false;
            }

            else {
                this.hintbar.classList.remove('mz-cms-upright');
                this.hintbar.style.position = 'absolute';
                this.hintbar.style[msg] = '0';
                this.hintbar.style.width = parseInt(window.getComputedStyle(element, null).width, 10) + 'px';
                this.hintbar.style.height = this.hintbarHeight;
                this.hintbar.style[msg] = '-2px';
            }

            const hintBarMessage = this.getModifiedMsg('widget', msg, element);

            this.hintBarMessage.innerHTML = hintBarMessage;

            this.updateHintBarMessageCls(hintBarMessage);

            element.appendChild(this.hintbar);

            this.hintbar.style.display = 'block';

        }

        cleanhintbar() {
            this.hintBarMessage.className = 'mz-cms-hint-message';
            this.hintbar.style.right = null;
            this.hintbar.style.left = null;
            this.hintbar.style.bottom = null;
            this.hintbar.style.top = null;
        }

        showRowHintBar(element, x, y, width, msg) {

            let offset;

            if (this.dragOccursOverDropZone(element, msg)) {
                return false;
            }
            // to do: make this css -- not awful, awful js
            this.cleanhintbar();

            if (msg === 'left' || msg === 'right') {
                this.hintbar.classList.add('mz-cms-upright');
                this.hintbar.style.position = 'absolute';
                this.hintbar.style.height = parseInt(window.getComputedStyle(element.parentNode, null).height, 10) + 'px';
                this.hintbar.style.top = '0';
                this.hintbar.style.width = this.hintbarHeight;
                this.hintbar.style[msg] = '-2px';
            }

            else {

                offset = this.getHintBarOffset.call(this, msg, element);
                this.hintbar.style.position = 'relative';
                this.hintbar.style.width = parseInt(window.getComputedStyle(element.parentNode, null).width, 10) + 'px';
                this.hintbar.style.height = this.hintbarHeight;
                this.hintbar.style[offset.key] = offset.offset;
                this.hintbar.style.left = '-21px';
                this.hintbar.classList.remove('mz-cms-upright');
            }

            const hintBarMessage = this.getModifiedMsg('row', msg, element);

            this.hintBarMessage.innerHTML = hintBarMessage;

            this.updateHintBarMessageCls(hintBarMessage);

            element.appendChild(this.hintbar);

            this.hintbar.style.display = 'block';
        }

        dragOccursOverDropZone(e, msg) {
            return e.parentNode.parentNode.parentNode.classList.contains('mz-drop-zone')
                   && msg === 'left' || e.parentNode.parentNode.parentNode.classList.contains('mz-drop-zone')
                   && msg === 'right';
        }

        getModifiedMsg(type, msg, element) {

            if (type === 'row') {

                // ! a drag occurred in the left of a row, but theres a column to the left so we show in between;
                if (msg === 'left' && element.parentNode.previousElementSibling
                        && element.parentNode.previousElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }

                // ! a drag occurred in the right of a row, but theres a column to the right so we show in between;
                if (msg === 'right' && element.parentNode.nextElementSibling
                        && element.parentNode.nextElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }
                // ! a drag occurred in the top of a row, but theres a row to the top so we show in between;
                if (msg === 'top'
                        && element.previousSibling
                        && !element.previousSibling.classList.contains('mz-layout-widget-header')) {
                    return 'between';
                }

                // ! a drag occurred in the bottom of a row, but theres a row to the bottom so we show in between;
                if (msg === 'bottom' && element.nextSibling) {
                    return 'between';
                }

                return msg;

            }

            else if (type === 'col') {
                // hinting for cols only happens left to right
                if (msg === 'left' && element.parentNode.previousElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }

                if (msg === 'right'
                        && element.parentNode.nextElementSibling
                        && element.parentNode.nextElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }
            }

            else if (type === 'widget') {
                // hinting for widgets only happens top and bottom
                if (msg === 'top'
                    && element.previousElementSibling
                    && element.previousElementSibling.classList.contains('mz-cms-block')) {
                    return 'between';
                }
                if (msg === 'bottom'
                     && element.nextElementSibling
                     && element.nextElementSibling.classList.contains('mz-cms-block')) {
                    return 'between';
                }
            }

            return msg;
        }

        getHintBarOffset(msg, element) {
            if (msg === 'top') {
                return {
                    key: 'top',
                    offset: '-' + this.hintbarPadding + 'px'
                };
            }

            else {
                return {
                    key: 'top',
                    offset: parseInt(window.getComputedStyle(element, null).height, 10) - 44 + 'px'
                };
            }

        }

        controller() {
            if (!this._controller) {
                this._controller = win.parent.Taco.app.controllers.get('Website');
            }
            return this._controller;
        }

        fireEvent() {
            this.controller().fireEvent.apply(this.controller(), arguments);
        }

        showLayoutHeaders(bool) {
            Array.from(doc.querySelectorAll('.mz-layout-widget-header')).forEach((el) => {
                el.style.display = bool ? 'block' : 'none';
            });

            Array.from(doc.querySelectorAll('.mz-layout-widget, .mz-cms-col-')).forEach((el) => {
                if (bool && Chorizo.helper.isInEditableDropzone(el)) {
                    if (!el.parentNode.classList.contains('mz-cms-grid')) {
                        el.classList.add('content-view');
                    }
                }
                else {
                    el.classList.remove('content-view');
                }
            });

            Array.from(doc.querySelectorAll('.mz-cms-block')).forEach((block) => {
                if (bool && Chorizo.helper.isInEditableDropzone(block)) {
                    block.classList.add('mz-content-screen');
                }

                else {
                    block.classList.remove('mz-content-screen');
                }
            });
        }

        showDropZones() {
            Array.from(doc.querySelectorAll('.mz-cms-grid, .mz-cms-col-')).forEach((grid) => {
                grid.classList.add('mz-cms-show-zone');
            });
        }

        hideDropZones() {
            Array.from(doc.querySelectorAll('.mz-cms-grid, .mz-cms-col-')).forEach((grid) => {
                grid.classList.remove('mz-cms-show-zone');
            });
        }

        createDragIcon() {
            this.dragIcon = doc.createElement('div');
            this.dragIcon.className = 'mz-drag-icon';
            doc.body.appendChild(this.dragIcon);
        }

        initDragIcon(src) {
            let imgSrc = '';
            if (src === 'layout') {
                imgSrc = `url(${this.getWidgetIcon('mz1col')})`;
            }
            else {
                imgSrc = src.indexOf('url(') !== -1 ? src : `url(${src})`;
            }
            this.dragIcon.style.display = 'block';
            this.dragIcon.style.backgroundImage = imgSrc;
        }

        updateDragIconPosition(event) {
            this.dragIcon.style.left = event.pageX + 'px';
            this.dragIcon.style.top = event.pageY + 'px';
        }

        hideDragIcon() {
            this.dragIcon.style.display = 'none';
        }

        getSpanClass(list) {
            let str;
            let nums;
            list.forEach((cls) => {
                if (cls.indexOf('mz-cms-col-') !== -1) {
                    str = cls.substring('mz-cms-col-'.length);
                    if (str) {
                        // check on this, but i think we send col span, and not zone span? talk to taco
                        nums = str.split('-')[0];
                    }
                }
            });
            return nums;
        }

        persistanceData() {

            const data = [];

            Array.from(doc.querySelectorAll('.mz-cms-grid')).forEach((grid) => {

                const gridData = {
                    build: 'CALIENTE',
                    id: JSON.parse(grid.getAttribute('data-drop-zone')).id,
                    rows: []
                };

                Array.from(grid.querySelectorAll('.mz-cms-row')).forEach((row) => {

                    // sweet spot of just the outer rows, that were not generated by the drop zone
                    if (!row.parentNode.classList.contains('mz-cms-grid')
                            && row.parentNode.parentNode.parentNode.classList.contains('mz-cms-grid')) {
                        gridData.rows.push(getData(row));
                    }

                });

                data.push(gridData);
            });

            function getData(row) {

                const rowData = {
                    title: JSON.parse(row.getAttribute('data-widget'))
                                ? JSON.parse(row.getAttribute('data-widget')).title
                                : 'Mozu Layout Element',
                    columns: []
                };
                let colData;

                Array.from(row.querySelectorAll('[class*=mz-cms-col]')).forEach((col) => {

                    if (col.parentNode.isSameNode(row)) {

                        colData = {
                            span: Chorizo.editor.getSpanClass(col.classList),
                            rows: [],
                            widgets: [],
                            width: col.style.width
                        };

                        if (col.querySelectorAll('.mz-cms-row').length > 0) {
                            Array.from(col.querySelectorAll('.mz-cms-row')).forEach((interiorRow) => {
                                if (interiorRow.parentNode.isSameNode(col)) {
                                    colData.rows.push(getData(interiorRow));
                                }
                            });
                        }

                        else {
                            Array.from(col.querySelectorAll('.mz-cms-block')).forEach((block) => {
                                colData.widgets.push(JSON.parse(block.getAttribute('data-widget')));
                            });
                        }

                        rowData.columns.push(colData);
                    }

                });

                return rowData;
            }

            return data;
        }

        isDirty() {
            return this._dirty;
        }

        resetDirtyState() {
            this._currentState = JSON.stringify(this.persistanceData());
            this._dirty = false;
        }

        dirtyStateCheck() {
            const newState = JSON.stringify(this.persistanceData());
            const dirty = newState !== this._currentState;

            if (this._dirty === dirty) {
                return false;
            }

            this._dirty = dirty;
            this.fireEvent('dirtychange', this, dirty);
        }
    }

    doc.addEventListener('DOMContentLoaded', function() {

        if (!win.Chorizo) {
            win.Chorizo = {};
        }

        Chorizo.editor = new Editor();
        Chorizo.editor.init();
    });

})(window, document);