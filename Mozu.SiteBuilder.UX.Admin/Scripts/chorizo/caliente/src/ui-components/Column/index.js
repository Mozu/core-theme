import {
    COL_CLASSNAME,
    CONTENT_VIEW_CLASSNAME,
    BLOCK_TYPES,
    ALL_COL_SELECTOR,
    DROPOVER_CLASSNAME,
    DRAG_HANDLE_CLASSES,
    BLOCK_SELECTOR,
    DRAG_EVENTS,
    POSITION_DICTIONARY,
    GRID_CLASSNAME,
    BLOCK_CLASSNAME,
    DATA_WIDGET_ATTRIBUTE,
    COL_COPY_ID,
    MZ_CMS_SHOW_CLASS
} from './../../constants';

import {
    addDropHint,
    attachEvents,
    addLayoutHeader,
    remove,
    setupDraggable,
    resetMousePosition,
    closest,
    showWidgetHintBarMessage,
    afterDrop,
    removeElementWhereDragStarted,
    createDomNode,
    applyClasses,
    dropLayoutWithContent
} from './../../utilities';

import {
    removeColumn,
    addDragHandle,
    showHintBarMessage,
    getHintingData
} from './util';

/*
* COLUMN_CLASSES {array of string}
* column classes to be added to all generated Columns
**/

const COLUMN_CLASSES = ['mz-layout-col', COL_CLASSNAME, 'mz-editing', CONTENT_VIEW_CLASSNAME, MZ_CMS_SHOW_CLASS];

/*
*   COLUMN_HEADER_EVENTS
**/

const COLUMN_HEADER_EVENTS = [
    {
        type: 'click',
        customEvent: 'destroy',
        func: removeColumn
    }
];
/*
* Column Class
*
* The central UI Element Class for Caliente
*
* Rows, Layouts, and Blocks can spin up new Columns
* but they do not inherit from them
*
* If an element is passed to the Column constructor, that element
* is initialized
*
* isEmptyGrid is used to intialize a DropZone, because that element
* doesn't need a `toolset` or `header`
*
* ignoreDropEvent is used to initialize a column that does not need
* a drop event -- this is only used when a column must be reinitialized
*
* @param {domNode} el (optional)
* @param {boolean} isEmptyGrid (optional)
* @returns {boolean} ignoreDropEvent (optional)
* @example
* const column = new Column(document.getElementById('id'), false, false);
**/

export default class Column {
    constructor(el, isEmptyGrid, ignoreDropEvent) {

        this.element = el
            ? applyClasses(el, COLUMN_CLASSES)
            : createDomNode('div', ...COLUMN_CLASSES);

        this._type = BLOCK_TYPES.COL;
        this.init(isEmptyGrid, ignoreDropEvent);
        this._colmouseposition = null;

        if (Chorizo.editor.areDropzonesHidden) {
            this.element.classList.remove(MZ_CMS_SHOW_CLASS);
        }

        addDropHint(this.element);
    }

    init(isEmptyGrid, ignoreDropEvent) {
        addLayoutHeader(this, BLOCK_TYPES.COL, COLUMN_HEADER_EVENTS, isEmptyGrid);

        attachEvents(this, {
            dragover: this.dragover.bind(this),
            dragleave: this.dragleave.bind(this),
            mouseover: this.showDragHandle.bind(this),
            mouseout: this.showDragHandle.bind(this)
        });

        if (!ignoreDropEvent) {
            attachEvents(this, {
                drop: this.drop.bind(this)
            });
        }

        if (this.move) {
            setupDraggable(this);
        }

        if (!isEmptyGrid) {
            addDragHandle(this, DRAG_HANDLE_CLASSES);
        }

    }

    doDragWidth(e) {
        if (Chorizo && Chorizo.editor) {
            Chorizo.editor._draggingColumn = e.type === 'mousedown' ? this.element : null;
        }
    }

    drop(e) {
        e.stopPropagation();
        e.preventDefault();
        this.dragleave(e);
        Chorizo.editor.hideDragIcon();

        if (!this.isValidDrop(e)) {
            return false;
        }

        Chorizo.editor.setDirtyState(true);

        const widgetData = JSON.parse(e.dataTransfer.getData('text')) || Chorizo.editor.widgetData;

        const afterDropCallback = function(layout) {
            if (widgetData.hasContent) {
                dropLayoutWithContent(this, layout);
            }
            else {
                removeElementWhereDragStarted();
            }
        };

        const event = 'widgetdrop';
        let eventConfig = {};
        let options = null;

        // // if were dragging a widget, lets ignore the widget editor
        if (widgetData.dragMethod === 'widgetDrag') {

            eventConfig = {
                widgetTypeId: widgetData.id,
                type: widgetData.type,
                ignoreEditor: true,
                element: this.element,
                data: JSON.parse(document.querySelector('#mz-widget-copy').getAttribute(DATA_WIDGET_ATTRIBUTE)),
                callback: afterDrop.bind(this, this, function() {
                    const copy = document.querySelector('#mz-widget-copy');
                    const parentColumn = copy
                        ? copy.parentNode : null;

                    // destory the dragged element relic
                    remove(copy);

                    // add a drop hint
                    // if that was the only widget in the column
                    if (parentColumn) {
                        addDropHint(parentColumn);
                    }
                })
            };

            options = true;

        }

        // if the layout drop occurs as an addition to a row, ignore the widget editor
        else if ((this._colmouseposition
            && this._colmouseposition.position)
            && !window._mouseposition) {

            eventConfig = {
                widgetTypeId: widgetData.id,
                type: widgetData.type,
                callback: afterDrop.bind(this, this, afterDropCallback),
                ignoreEditor: widgetData.type !== 'content'
            };
        }

        else {
            eventConfig = {
                widgetTypeId: widgetData.id,
                type: widgetData.type,
                callback: afterDrop.bind(this, this, afterDropCallback),
                ignoreEditor: false
            };
        }

        Chorizo.editor.fireEvent(event, eventConfig, options);

        Chorizo.editor.hideHintBar();
    }

    dragover(e) {
        resetMousePosition(this);
        this.element.classList[!this.isValidDrop(e) ? 'remove' : 'add'](DROPOVER_CLASSNAME);

        e.preventDefault();

        const x = e.offsetX;
        const y = e.offsetY;
        const closetWidget = closest(e.target, BLOCK_CLASSNAME);
        let width = parseInt(window.getComputedStyle(e.target, null).width, 10);
        let height = parseInt(window.getComputedStyle(e.target, null).height, 10);
        let target = e.target;

        // if were dropping widgets, we need to get the width/height of the
        // current widget were hovering over
        if (Chorizo
            && Chorizo.editor
            && Chorizo.editor.hideLayouts
            && closetWidget) {
            width = parseInt(window.getComputedStyle(closetWidget, null).width, 10);
            height = parseInt(window.getComputedStyle(closetWidget, null).height, 10);
            target = closetWidget;
        }

        this._colmouseposition = getHintingData(
                                    Chorizo.editor.hideLayouts,
                                    x,
                                    y,
                                    width,
                                    height,
                                    this.element,
                                    target,
                                    e);

        if (!Chorizo.editor.hideLayouts) {
            if (this._colmouseposition.position) {
                showHintBarMessage(this, x, y, width, height, e.target, this._colmouseposition.position);
            }

            else {
                Chorizo.editor.hideHintBar();
            }
        }

        else {
            showWidgetHintBarMessage(this, x, y, width, height, e.target, this._colmouseposition.position);
        }

    }

    isValidDrop(e) {

        // if were trying to drag a layoutelement onto a a layout with a widget (YOU CANT DROP -- DONT SHOW HINT)
        if (this.element.querySelector(BLOCK_SELECTOR) && e.type === DRAG_EVENTS.dragOver) {
            return false;
        }

        // if this is a drop zone, and you're trying to drop right or left
        if ((window._mouseposition && window._mouseposition.position === POSITION_DICTIONARY.RIGHT
            || window._mouseposition && window._mouseposition.position === POSITION_DICTIONARY.LEFT)
            && this.element.parentNode.parentNode.classList.contains(GRID_CLASSNAME)) {
            return false;
        }

        // if you're trying to drop a col into a place where theres already a widget
        if (!window._mouseposition
                && this._colmouseposition
                && !this._colmouseposition.position
                && this.element.querySelector(BLOCK_SELECTOR)) {
            return false;
        }

        return true;
    }

    dragleave() {
        Array.from(document.querySelectorAll(ALL_COL_SELECTOR))
            .forEach((col) => col.classList.remove(DROPOVER_CLASSNAME));
    }

    onDragStart(e) {
        let widgetData;
        const hasContent = this.element
                            .querySelectorAll(`${BLOCK_SELECTOR}, ${ALL_COL_SELECTOR}, mz-cms-row`).length > 0;

        if (this.element.querySelector(BLOCK_SELECTOR)) {
            widgetData = this.element.querySelector(BLOCK_SELECTOR).getAttribute(DATA_WIDGET_ATTRIBUTE);
        }

        Chorizo.editor.initDragIcon('layout');

        this.element.id = COL_COPY_ID;

        e.dataTransfer
            .setData('text', JSON.stringify({
                dragMethod: 'layoutDrag',
                id: 'mz-1-col',
                type: 'layout',
                data: widgetData,
                hasContent: hasContent
            }));
    }

    onDragEnd(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    onDrag(e) {
        if (!Chorizo
            || !Chorizo.editor
            || !Chorizo.editor.updateDragIconPosition) {
            return false;
        }

        Chorizo.editor.updateDragIconPosition(e);
    }

    showDragHandle(e) {
        if (this.handle && this.element.nextElementSibling) {
            this.handle.style.display = e.type === 'mouseover' ? 'block' : 'none';
        }
    }
}