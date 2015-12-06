import { 
    POSITION_DICTIONARY,
    BLOCK_TYPES,
    CONTENT_SELECTOR,
    ALL_COL_SELECTOR,
    HINT_BAR_CLASSNAME,
    HINT_BAR_MESSAGE_CLASSNAME,
    HINT_BAR_UPRIGHT_CLASSNAME,
    CMS_EDITING_CLASSNAME,
    RESIZER_CLASSNAME,
    RESIZER_HANDLE_CLASSNAME,
    DRAG_CURSOR_STYLE,
    DEFAULT_CURSOR_STYLE,
    DATA_WIDGET_ATTRIBUTE,
    MIN_COLUMN_WIDTH,
    GRID_CLASSNAME,
    BLOCK_CLASSNAME,
    BLOCK_SELECTOR,
    LAYOUT_WIDGET_HEADER_CLASSNAME,
    ROW_SELECTOR,
    LAYOUT_WIDGET_HEADER_SELECTOR,
    CONTENT_SCREEN_CLASSNAME,
    CONTENT_VIEW_CLASSNAME,
    ROW_TITLE,
    DATA_GRID_ATTRIBUTE
} from './constants';

(function(win, doc) {

    class Editor {
        constructor() {
            this.windowContext = window;
        }

        init() {
            document.body.classList.add(CMS_EDITING_CLASSNAME);
            this.createHintBar();
            this.createDragIcon();
            this.createResizer();
            this.resetDirtyState();
            this.fireEvent('pageload', this);
            this._dirty = false;
        }

        setDirtyState(val) {
            this._dirty = val ? val : false;
        }

        createResizer() {
            this.resizer = doc.createElement('div');
            this.handle = doc.createElement('div');

            this.resizer.classList.add(RESIZER_CLASSNAME);
            this.handle.classList.add(RESIZER_HANDLE_CLASSNAME);

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
                cursorStyle = DRAG_CURSOR_STYLE;
                break;
            default:
                cursorStyle = DEFAULT_CURSOR_STYLE;
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
                    block.setAttribute(DATA_WIDGET_ATTRIBUTE, JSON.stringify(widgetData));
                }
                block = null;
                widgetData = null;

            }).bind(this));

            doc.addEventListener('mousemove', (function(e) {

                if (this.resizing) {
                    block = this.resizer.parentNode;
                    widgetData = JSON.parse(block.getAttribute(DATA_WIDGET_ATTRIBUTE));
                    newHeight = doc.body.scrollTop + e.clientY - block.offsetTop - 320;

                    block.querySelector(CONTENT_SELECTOR).style.height = newHeight + 'px';
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

            const col = this._draggingColumn;
            const nextSibling = col.nextElementSibling;
            const computedPercentage = this.getComputedPercentage(e, col) * 100;
            const allAssociatedColumns = Array.from(col.parentNode.querySelectorAll(ALL_COL_SELECTOR));
            const otherColsWidth = this.getOtherColsCombinedWidth(allAssociatedColumns, col);
            let finalColumnWidth;
            let remainingColumnsWidth;

            // if the width of our newly computed percentage is greater than the allowed limit, return
            if (otherColsWidth + computedPercentage + MIN_COLUMN_WIDTH >= 100) {
                return false;
            }
            else if (computedPercentage < MIN_COLUMN_WIDTH) {
                col.style.width = MIN_COLUMN_WIDTH + '%';
            }
            else {
                col.style.width = computedPercentage + '%';
            }

            // once we know what weve resized our target element to,
            // we can query the remaining elements to deterime what the nextSibling width should be
            remainingColumnsWidth = this.getWidthWithQuery(allAssociatedColumns, col.parentNode, nextSibling);

            // dont let them make a column smaller than 10%
            if (remainingColumnsWidth < MIN_COLUMN_WIDTH) {
                nextSibling.style.width = MIN_COLUMN_WIDTH + '%';
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
            this.hintbar.className = HINT_BAR_CLASSNAME;
            this.hintBarMessage.className = HINT_BAR_MESSAGE_CLASSNAME;
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

            if (msg === POSITION_DICTIONARY.LEFT || msg === POSITION_DICTIONARY.RIGHT) {
                this.hintbar.classList.add(HINT_BAR_UPRIGHT_CLASSNAME);
                this.hintbar.style.position = 'absolute';
                this.hintbar.style.height = parseInt(window.getComputedStyle(element.parentNode, null).height, 10) + 'px';
                this.hintbar.style.top = '0';
                this.hintbar.style.width = this.hintbarHeight;
                this.hintbar.style[msg.toLowerCase()] = '-2px';
            }

            const hintBarMessage = this.getModifiedMsg('col', msg, element);

            this.hintBarMessage.innerHTML = hintBarMessage;

            this.updateHintBarMessageCls(hintBarMessage);

            element.appendChild(this.hintbar);

            this.hintbar.style.display = 'block';
        }

        updateHintBarMessageCls(message) {
            this.hintBarMessage.classList.add(message.toLowerCase());
        }

        showWidgetHintBar(element, col, x, y, height, msg) {
            this.cleanhintbar();

            // dont need to hint, unless there are already widgets in this col
            if (!col.querySelector(BLOCK_SELECTOR) || !msg) {
                this.hintbar.style.display = 'none';
                return false;
            }

            const hintBarMessage = this.getModifiedMsg('widget', msg, element);

            if (msg === POSITION_DICTIONARY.TOP || msg === POSITION_DICTIONARY.BOTTOM) {
                this.hintbar.classList.remove(HINT_BAR_UPRIGHT_CLASSNAME);
                this.hintbar.style.position = 'absolute';
                this.hintbar.style[msg.toLowerCase()] = '0';
                this.hintbar.style.width = parseInt(window.getComputedStyle(element, null).width, 10) + 'px';
                this.hintbar.style.height = this.hintbarHeight;
                this.hintbar.style[msg.toLowerCase()] = '-2px';
                element.appendChild(this.hintbar);
            }

            else {
                this.hintbar.classList.add(HINT_BAR_UPRIGHT_CLASSNAME);
                this.hintbar.style.position = 'absolute';
                this.hintbar.style.height = parseInt(window.getComputedStyle(element.parentNode, null).height, 10) + 'px';
                this.hintbar.style.top = '0';
                this.hintbar.style.width = this.hintbarHeight;
                this.hintbar.style[msg.toLowerCase()] = '-2px';
                element.parentNode.appendChild(this.hintbar);
            }

            this.hintBarMessage.innerHTML = hintBarMessage;

            this.updateHintBarMessageCls(hintBarMessage);

            this.hintbar.style.display = 'block';

        }

        cleanhintbar() {
            this.hintBarMessage.className = HINT_BAR_MESSAGE_CLASSNAME;
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

            if (msg === POSITION_DICTIONARY.LEFT || msg === POSITION_DICTIONARY.RIGHT) {
                this.hintbar.classList.add(HINT_BAR_UPRIGHT_CLASSNAME);
                this.hintbar.style.position = 'absolute';
                this.hintbar.style.height = parseInt(window.getComputedStyle(element.parentNode, null).height, 10) + 'px';
                this.hintbar.style.top = '0';
                this.hintbar.style.width = this.hintbarHeight;
                this.hintbar.style[msg.toLowerCase()] = '-2px';
            }

            else {

                offset = this.getHintBarOffset.call(this, msg, element);
                this.hintbar.style.position = 'relative';
                this.hintbar.style.width = parseInt(window.getComputedStyle(element.parentNode, null).width, 10) + 'px';
                this.hintbar.style.height = this.hintbarHeight;
                this.hintbar.style[offset.key.toLowerCase()] = offset.offset;
                this.hintbar.style.left = '-21px';
                this.hintbar.classList.remove(HINT_BAR_UPRIGHT_CLASSNAME);
            }

            const hintBarMessage = this.getModifiedMsg(BLOCK_TYPES.ROW, msg, element);

            this.hintBarMessage.innerHTML = hintBarMessage;

            this.updateHintBarMessageCls(hintBarMessage);

            element.appendChild(this.hintbar);

            this.hintbar.style.display = 'block';
        }

        dragOccursOverDropZone(e, msg) {
            return e.parentNode.parentNode.parentNode.classList.contains(GRID_CLASSNAME)
                   && msg === POSITION_DICTIONARY.LEFT || e.parentNode.parentNode.parentNode.classList.contains(GRID_CLASSNAME)
                   && msg === POSITION_DICTIONARY.RIGHT;
        }

        getModifiedMsg(type, msg, element) {

            if (type === BLOCK_TYPES.ROW) {

                // ! a drag occurred in the left of a row, but theres a column to the left so we show in between;
                if (msg === POSITION_DICTIONARY.LEFT && element.parentNode.previousElementSibling
                        && element.parentNode.previousElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }

                // ! a drag occurred in the right of a row, but theres a column to the right so we show in between;
                if (msg === POSITION_DICTIONARY.RIGHT && element.parentNode.nextElementSibling
                        && element.parentNode.nextElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }
                // ! a drag occurred in the top of a row, but theres a row to the top so we show in between;
                if (msg === POSITION_DICTIONARY.TOP
                        && element.previousSibling
                        && !element.previousSibling.classList.contains(LAYOUT_WIDGET_HEADER_CLASSNAME)) {
                    return 'between';
                }

                // ! a drag occurred in the bottom of a row, but theres a row to the bottom so we show in between;
                if (msg === POSITION_DICTIONARY.BOTTOM && element.nextSibling) {
                    return 'between';
                }

                return msg;

            }

            else if (type === 'col') {
                // hinting for cols only happens left to right
                if (msg === POSITION_DICTIONARY.LEFT && element.parentNode.previousElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }

                if (msg === POSITION_DICTIONARY.RIGHT
                        && element.parentNode.nextElementSibling
                        && element.parentNode.nextElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }
            }

            else if (type === 'widget') {

                // hinting for widgets only happens top and bottom
                if (msg === POSITION_DICTIONARY.TOP
                    && element.previousElementSibling
                    && element.previousElementSibling.classList.contains(BLOCK_CLASSNAME)) {
                    return 'between';
                }

                if (msg === POSITION_DICTIONARY.BOTTOM
                     && element.nextElementSibling
                     && element.nextElementSibling.classList.contains(BLOCK_CLASSNAME)) {
                    return 'between';
                }

                if (msg === POSITION_DICTIONARY.LEFT
                     && element.parentNode.previousElementSibling
                     && element.parentNode.previousElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }

                if (msg === POSITION_DICTIONARY.RIGHT
                     && element.parentNode.nextElementSibling
                     && element.parentNode.nextElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }
            }

            return msg;
        }

        getHintBarOffset(msg, element) {
            if (msg === POSITION_DICTIONARY.TOP) {
                return {
                    key: POSITION_DICTIONARY.TOP,
                    offset: '-' + this.hintbarPadding + 'px'
                };
            }

            else {
                return {
                    key: POSITION_DICTIONARY.TOP,
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
            Array.from(doc.querySelectorAll(LAYOUT_WIDGET_HEADER_SELECTOR)).forEach((el) => {
                el.style.display = bool ? 'block' : 'none';
            });

            Array.from(doc.querySelectorAll('.mz-layout-widget, .mz-cms-col-')).forEach((el) => {
                if (bool && Chorizo.helper.isInEditableDropzone(el)) {
                    if (!el.parentNode.classList.contains('mz-cms-grid')) {
                        el.classList.add(CONTENT_VIEW_CLASSNAME);
                    }
                }
                else {
                    el.classList.remove(CONTENT_VIEW_CLASSNAME);
                }
            });

            Array.from(doc.querySelectorAll(BLOCK_SELECTOR)).forEach((block) => {
                if (bool && Chorizo.helper.isInEditableDropzone(block)) {
                    block.classList.add(CONTENT_SCREEN_CLASSNAME);
                }

                else {
                    block.classList.remove(CONTENT_SCREEN_CLASSNAME);
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
                    id: JSON.parse(grid.getAttribute(DATA_GRID_ATTRIBUTE)).id,
                    rows: []
                };

                Array.from(grid.querySelectorAll(ROW_SELECTOR)).forEach((row) => {

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
                    title: JSON.parse(row.getAttribute(DATA_WIDGET_ATTRIBUTE))
                                ? JSON.parse(row.getAttribute(DATA_WIDGET_ATTRIBUTE)).title
                                : ROW_TITLE,
                    columns: []
                };
                let colData;

                Array.from(row.querySelectorAll(ALL_COL_SELECTOR)).forEach((col) => {

                    if (col.parentNode.isSameNode(row)) {

                        colData = {
                            span: Chorizo.editor.getSpanClass(col.classList),
                            rows: [],
                            widgets: [],
                            width: col.style.width
                        };

                        if (col.querySelectorAll(ROW_SELECTOR).length > 0) {
                            Array.from(col.querySelectorAll(ROW_SELECTOR)).forEach((interiorRow) => {
                                if (interiorRow.parentNode.isSameNode(col)) {
                                    colData.rows.push(getData(interiorRow));
                                }
                            });
                        }

                        else {
                            Array.from(col.querySelectorAll(BLOCK_SELECTOR)).forEach((block) => {
                                colData.widgets.push(JSON.parse(block.getAttribute(DATA_WIDGET_ATTRIBUTE)));
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