import {
    COL_CLASSNAME,
    DEFAULT_GRID_SPAN,
    DATA_GRID_ATTRIBUTE,
    DROP_HINT_CLASSNAME,
    DROP_HINT_TEXT,
    BLOCK_SELECTOR,
    ROW_SELECTOR,
    ALL_COL_SELECTOR,
    LAYOUT_WIDGET_HEADER_CLASSNAME,
    BLOCK_TYPES,
    GRID_CLASSNAME,
    DRAG_EVENTS,
    POSITION_DICTIONARY,
    BLOCK_CLASSNAME,
    CONTENT_VIEW_CLASSNAME,
    DROP_HINT_SELECTOR,
    DATA_WIDGET_ATTRIBUTE,
    ROW_CLASSNAME,
    ROW_TITLE,
    COL_COPY_SELECTOR
} from './../constants';

import Column from './../ui-components/Column';
import Row from './../ui-components/Row';
import Block from './../ui-components/Block';

import { contentWidget } from './../widgets/Content';

// ugh to fix ie11 issue; delete when browsers support Array.from
Array.from = function() {
    return Array.prototype.slice.call(arguments[0]);
};


// ugh to the firefox issue where isSameNode isn't a function
Element.prototype.isSameNode = Element.prototype.isSameNode || function (node) {
    return this === node;
};

/*
* utility function to remove a DOM node
* IE Safe
*
* @returns {null}
* @param {DOMnode}
* @example
* remove(document.getElementByID('div'));
**/
export function remove(DOMnode) {
    if (DOMnode.remove) {
        DOMnode.remove();
    }
    else {
        DOMnode.parentNode.removeChild(DOMnode);
    }
}

/*
* utility function get mz-column span class
* mz-cms-12-12
*
* @returns {string}
* @param {string} gridSpan
* @param {ans} int
* @param {rem} int
* @example
* getSpanClass(12, 4, 4);
**/
export function getSpanClass(gridSpan, ans, rem) {
    const width = ans + (rem-- > 0 ? 1 : 0);
    const cls = classMaker(width, gridSpan);
    return cls;
}

/*
* utility function to refresh a row an event occurrs
* events could be delete, add, widget drop, etc
*
* @returns {null}
* @param {DOMnode}
* @example
* const row = new Row();
* rebaseRow(row);
**/
export function rebaseRow(containingRow) {
    const cols = Array.from(containingRow.querySelectorAll(ALL_COL_SELECTOR))
        .filter((col) => col.parentNode.isSameNode(containingRow));

    const grid = closest(containingRow, GRID_CLASSNAME);
    const gridSpan = getGridSpan(grid);

    const ans = Math.floor(gridSpan / cols.length);
    let rem = gridSpan % cols.length;

    cols.forEach((col) => {
        const cls = getSpanClass(gridSpan, ans, rem);
        col.style.width = (1 / cols.length) * 100 + '%';

        updateColSpanCls(col, cls);
    });

    // if we're rebasing an empty row, just remove it
    if (cols.length === 0) {
        removeRow(containingRow);
    }
}

/*
* utility function to find the closes DOM node, by matching
* a class by regex
*
* @returns {DOMnode}
* @param {DOMnode, string}
* @example
* closestByRegex(document.getElementByID('div'), 'cms-block');
**/
export function closestByRegex(el, cls) {

    while (el !== document.body) {
        if (el.classList.toString().match(cls)) {
            return el;
        }
        else {
            el = el.parentNode;
        }
    }
}

/*
* utility function to find the closes DOM node, by matching a class
*
* @returns {DOMnode}
* @param {DOMnode, string}
* @example
* closest(document.getElementByID('div'), 'cms-block');
**/
export function closest(el, cls) {

    while (el !== document.body) {
        if (el.classList.contains(cls)) {
            return el;
        }
        else {
            el = el.parentNode;
        }
    }
}

/*
* remove a caliente row
*
* @returns {null}
* @param {object || domNode}
* @example
*
* const row = new Row();
* removeRow(row);
**/
export function removeRow(block) {

    if (Chorizo && Chorizo.editor) {
        Chorizo.editor.setDirtyState(true);
    }

    const row = block.element || block;

    const parentLayout = closestByRegex(row.parentNode, COL_CLASSNAME);

    remove(row);

    if (Array.from(parentLayout.childNodes)
            .filter((child) => child.classList && !child.classList.contains('mz-layout-widget-col-header'))) {

        if (!parentLayout.querySelector(ROW_SELECTOR)) {
            addDropHint(parentLayout);
        }
    }
}

/*
* wrapper for document.createElement
*
* @returns {domNode}
* @param {string} type
* @param {...string} classes
* @example
*
* createDomNode('ul', 'mz-cms-tools');
**/
export function createDomNode(type, ...classes) {
    const dom = document.createElement(type);
    applyClasses(dom, classes);
    return dom;
}

/*
* wrapper for document.classList.add();
*
* @returns {domNode}
* @param {domNode} domNode
* @param {...string} classes
* @example
*
* applyClasses('class', 'class2');
**/
export function applyClasses(domNode, classes) {

    if (Array.isArray(classes)) {
        classes.forEach((cls) => domNode.classList.add(cls));
    }

    else {
        domNode.classList(classes);
    }

    return domNode;
}

/*
* add LayoutHeader to Column/Row
*
* @returns {null}
* @param {object} block
* @param {array} headerEvents
* @example
*
* const column = new Column();
* const events = [
*   {
*      type: 'dragstart',
*      func: () => { console.log('drag started'); }
*   }
* ];
* addLayoutHeaderTools(column);
**/
export function addLayoutHeaderTools(block, headerEvents, blockType) {
    block.toolbar = createDomNode('ul', 'mz-cms-tools');
    block.del = createDomNode('li', 'trash');
    block.edit = createDomNode('li', 'pencil');
    block.move = createDomNode('li', 'drag-handle');

    // COLS dont have move attribute
    if (blockType !== BLOCK_TYPES.COL) {
        block.toolbar.appendChild(block.edit);
    }

    // ROWS dont have move attribute
    if (blockType !== BLOCK_TYPES.ROW) {
        block.toolbar.appendChild(block.move);
    }

    block.toolbar.appendChild(block.del);

    if (!block.header) {
        console.warn('Layout Block has not been initiated with a header');
        return false;
    }

    block.header.appendChild(block.toolbar);

    if (Array.isArray(headerEvents)) {
        headerEvents.forEach((eventObject) => {

            if (eventObject.customEvent === 'destroy') {
                block.del.addEventListener(eventObject.type || 'click', eventObject.func.bind(this, block));
            }

            if (eventObject.customEvent === 'edit') {
                block.edit.addEventListener(eventObject.type || 'click', eventObject.func.bind(this, block));
            }

        });
    }
}

/*
* adds a layout header to caliente block classes
* @returns {null}
* @param {object} block
* @param {array} events
* @param {boolean} isEmptyGrid
* @example
*
* const block = new Block();
* addLayoutHeader(block, BLOCK_TYPES.BLOCK, [], false);
**/
export function addLayoutHeader(block, blockType, events, isEmptyGrid) {
    const child = block.element.firstChild;
    const header = createDomNode('div', LAYOUT_WIDGET_HEADER_CLASSNAME, BLOCK_TYPES[blockType].toLowerCase());

    block.header = header;

    if (!isEmptyGrid) {
        addLayoutHeaderTools(block, events, blockType);
        block.element.insertBefore(header, child);
    }

}

/*
* make an caliente element draggable
* @returns {null}
* @param {object} block
* @param {domNode} trigger
* @param {array of object} dragEvents
* @example
*
* const block = new Block();
* contst events = [
*   {
*      type: 'dragstart',
    func: () => { console.log('drag started'); }
*   }
* ]
* attachEvents(block, block.move, events);
**/
export function makeDraggable(block, trigger, dragEvents) {
    trigger.setAttribute('draggable', 'true');

    dragEvents.forEach(function(ev) {
        trigger.addEventListener(ev.type, ev.func.bind(block));
    });
}

/*
* generic utility function to add
* an array of events to a domNode
* @returns {null}
* @param {object} block
* @param {array of object} events
* @example
*
* const block = new Block();
* contst events = [
*   {
*       click: () => { console.log('click ocurred'); }
*   }
* ]
* attachEvents(block,);
**/
export function attachEvents(block, events) {
    Object.keys(events)
        .forEach((k) => block.element.addEventListener(k, events[k]), block);
}

/*
* get the gridSpan associated with a dropZone
* @returns {string}
* @param {domNode} grid
* @example
*
* const grid = new Grid();
* getGridSpan(grid.element);
**/
export function getGridSpan(grid) {
    const gridSpan = grid
        && grid.getAttribute(DATA_GRID_ATTRIBUTE)
        ? JSON.parse(grid.getAttribute(DATA_GRID_ATTRIBUTE)).span
        : DEFAULT_GRID_SPAN;

    return gridSpan;
}

/*
* add drop hint to an empty Column
* @returns {null}
* @param {domNode} element
* @example
*
* const column = new Column();
* addDropHint(column.element);
**/
export function addDropHint(element) {
    const content = createDomNode('div', DROP_HINT_CLASSNAME);
    const text = createDomNode('span');
    text.innerHTML = DROP_HINT_TEXT;
    content.appendChild(text);

    if (!element.querySelector(`${BLOCK_SELECTOR}, ${ROW_SELECTOR}, ${ALL_COL_SELECTOR}`)) {
        element.appendChild(content);
    }
}

/*
* create a mz-cms-{span}-{gridSpan} className
* @returns {string}
* @param {string} span
* @param {string} gridSpan
* @example
*
* const cls = classMaker('12', '12');
**/
export function classMaker(span, gridSpan) {

    if (!span || !gridSpan) {
        return COL_CLASSNAME;
    }

    return `${COL_CLASSNAME}${span}-${gridSpan}`;
}

/*
* create a mz-cms-{span}-{gridSpan} className
* @returns {string}
* @param {domNode} col
* @param {string} newCls
* @example
*
* const col = new Column().element;
* const cls = updateColSpanCls(col, 'mz-cms-12-12');
**/
export function updateColSpanCls(col, newCls) {

    Array.from(col.classList).forEach((colClass) => {

        if (colClass.match(/col-/)) {
            col.classList.remove(colClass);
            col.classList.add(newCls);
        }

    });
}

/*
* utility to reset mouseposition for Grid, Columns and Rows
* @returns {null}
* @param {object} block
* @example
*
* const block = new Block();
* resetMousePosition(block);
**/
export function resetMousePosition(block) {
    block._colmouseposition = null;
    window._mouseposition = null;
}

/*
* wrapper for makeDraggable
* @returns {null}
* @param {object} block
* @example
*
* const block = new Block();
* setupDraggable(block);
**/
export function setupDraggable(block) {
    if (!block.move) {
        console.warn('Block has no `move` component');
        return false;
    }

    makeDraggable(block, block.move, [
        { type: DRAG_EVENTS.dragEnd, func: block.onDragEnd.bind(block) },
        { type: DRAG_EVENTS.dragStart, func: block.onDragStart.bind(block) },
        { type: DRAG_EVENTS.drag, func: block.onDrag.bind(block)}
    ]);
}

/*
* tell caliente-editor which message to show for row hints
* @returns {null}
* @param {object} block
* @param {domNode} element
* @param {int} x
* @param {int} y
* @param {string} width
* @param {string} height
* @param {string} type
* @example
* showRowHintBarMessage(block, e.target, x, y, width, height, BLOCK_TYPES.ROW);
**/
export function showRowHintBarMessage(block, element, x, y, width, height, type) {
    window._mouseposition = setMousePosition(x, y, width, height, element, type);
    Chorizo.editor.showRowHintBar(element, x, y, width, window._mouseposition.position);
}

/*
* tell caliente what the window._position object is
* @returns {object}
* @param {int} x
* @param {int} y
* @param {int} width
* @param {int} height
* @param {string} type
* @example
* setMousePosition(x, y, width, height, block.element, BLOCK_TYPES.ROW);
**/
export function setMousePosition(x, y, width, height, element, type) {
    const _mouseposition = {
        position: findPosition(x, y, width, height),
        element: element,
        type: type
    };

    return _mouseposition;
}

/*
* tell caliente-editor what hint bar message to show
* @returns {object}
* @param {int} x
* @param {int} y
* @param {int} width
* @param {int} height
* @param {domNode} element
* @param {string} msg
* @example
* showWidgetHintBarMessage(e.target, x, y, width, height);
**/
export function showWidgetHintBarMessage(block, x, y, width, height, element, msg) {
    Chorizo.editor.showWidgetHintBar(closest(element, BLOCK_CLASSNAME), block.element, x, y, height, msg);
}

/*
* generic position finder function
* for caliente-elements
* @returns {string}
* @param {int} x
* @param {int} y
* @param {int} w
* @param {int} h
* @example
* findPosition(x, y, w, h);
**/
export function findPosition(x, y, w, h) {
    // element is divided into four triangles
    // using mouseX, mouseY, and width and height, we find which quad
    let quadrants = [
        [POSITION_DICTIONARY.LEFT, POSITION_DICTIONARY.BOTTOM],
        [POSITION_DICTIONARY.TOP, POSITION_DICTIONARY.RIGHT]
    ];

    if (y > h / w * x) {
        quadrants = quadrants[0];
    }

    else {
        quadrants = quadrants[1];
    }

    return (y < -h / w * x + h) ? quadrants[0] : quadrants[1];

}

/*
* adds a column to the left|right of an existing column
* @returns {null}
* @param {object} block
* @param {object} positionObject
* @param {function} cb
* @example
* doColumnInsert(block, block._colmouseposition, () => {});
**/
export function doColumnInsert(block, positionObject, cb) {
    const cols = block.layout.element.querySelectorAll('.mz-layout-col');
    let newlyAddedCol;

    Array.from(cols).forEach((col) => {

        if (positionObject.position === POSITION_DICTIONARY.RIGHT) {

            // if the drop element has children, we need to append it to the containing row, and not the column
            if (containsInteriorRow(positionObject.element)) {
                positionObject.element.parentNode.parentNode.insertBefore(
                                                                col,
                                                                positionObject.element.parentNode.nextSibling);
                newlyAddedCol = new Column(col);
                rebaseRow(positionObject.element.parentNode.parentNode);
            }

            else {
                positionObject.element.parentNode.insertBefore(col, positionObject.element.nextSibling);
                newlyAddedCol = new Column(col);
            }
        }

        else {
            // adding new columns to left

            // if the drop element has children, we need to append it to the containing row, and not the column
            if (containsInteriorRow(positionObject.element)) {
                positionObject.element.parentNode.parentNode.insertBefore(col, positionObject.element.parentNode);
                newlyAddedCol = new Column(col);
                rebaseRow(positionObject.element.parentNode.parentNode);
            }

            else {
                positionObject.element.parentNode.insertBefore(col, positionObject.element);
                newlyAddedCol = new Column(col);
            }
        }

        if (cb) {
            cb.call(this, newlyAddedCol);
        }
    });

    rebaseRow(positionObject.element.parentNode);
}

/*
* utility function to determine if element contains a row
* @returns {boolean}
* @param {domNode} element
* @example
* containsInteriorRow(block.element);
**/
export function containsInteriorRow(element) {
    return element.classList && element.classList.contains(ROW_CLASSNAME);
}

/*
* inserts a layout element into a empty column
* @returns {null}
* @param {object} block
* @param {domNode} cfg
* @param {function} cb
* @example
* insertLayoutElement(block, { type: 'layout'}, function() {
    console.log('fires after a layout element has been added');
});
**/
export function insertLayoutElement(block, cfg, cb) {
    let isColInsert = false;
    let newCol;
    let row;

    // defer to column actions first
    if (block._colmouseposition && block._colmouseposition.position) {
        isColInsert = true;
        doColumnInsert(block, block._colmouseposition, cb);
    }

    // else, a action happend within a row
    else {

        // since action happened in a row -- we may need to remove drop hint
        removeDropHint(block.element);

        if (!window._mouseposition) {
            block.element.appendChild(block.layout.element);
        }

        else if (window._mouseposition.position === POSITION_DICTIONARY.TOP) {
            block.element.insertBefore(block.layout.element, window._mouseposition.element);
        }

        else if (window._mouseposition.position === POSITION_DICTIONARY.BOTTOM) {
            window._mouseposition.element.parentNode.insertBefore(
                                                block.layout.element,
                                                window._mouseposition.element.nextSibling);
        }

        else if (window._mouseposition.position === POSITION_DICTIONARY.RIGHT
                    || window._mouseposition.position === POSITION_DICTIONARY.LEFT) {
            if (block.element.parentNode.parentNode.classList.contains(GRID_CLASSNAME)) {
                return false;
            }
            isColInsert = true;
            doColumnInsert(block, window._mouseposition, cb);
        }
    }

    row = new Row(block.layout.element);

    updateRowTitle(row, cfg.config);

    Array.from(block.layout.element.querySelectorAll(ALL_COL_SELECTOR)).forEach((col) => {
        newCol = new Column(col);
    }, this);

    // if the cb wasnt handled already, its a new row, so we need to see if content was dragged
    if (newCol && cb) {
        cb.call(newCol, newCol);
    }

    if (!isColInsert) {
        updateColClasses(row);
    }
}

/*
* utility function to get a `Layout` wrapper
* @returns {null}
* @param {domNode} el
* @example
* block.layout = new getLayout();
**/
export function getLayout(el) {
    this.element = el || createDomNode('div');
    this._type = 'layout';
}

/*
* afterDrop event for Column
* @returns {null}
* @param {object} block
* @param {function} cb
* @param {domNode} html
* @param {object} cfg
* @example
* afterDrop.bind(this, function() {
*   console.log('after drop');
* }, block.element, {});
**/
export function afterDrop(block, cb, html, cfg) {

    if (cfg.type === 'layout') {
        block.layout = new getLayout();
        createFromDrop(block.layout, html);
        insertLayoutElement(block, cfg, cb);
    }

    else {
        insertWidgetElement(block, cb, html, cfg);
    }

    resetMousePosition(block);
}

/*
* remove a drop hint from a column
* @returns {null}
* @param {domNode} element
* @example
* removeDropHint(block.element);
**/
export function removeDropHint(element) {

    const dropHint = element.querySelector(DROP_HINT_SELECTOR);

    if (dropHint
        && dropHint.parentNode.isSameNode(element)) {
        remove(element.querySelector(DROP_HINT_SELECTOR));
    }

}

/*
* update column class names within a row
* @returns {null}
* @param {object} row
* @example
* updateColClasses(row);
**/
export function updateColClasses(row) {
    const children = getChildrenColumns(row);
    const grid = closest(row.element, GRID_CLASSNAME);
    const gridSpan = getGridSpan(grid);

    const ans = Math.floor(gridSpan / children.length);
    let rem = gridSpan % children.length;

    children.forEach((col) => {
        const cls = getSpanClass(gridSpan, ans, rem);
        updateColSpanCls(col, cls);
    });
}

/*
* get all column elements within a row
* @returns {null}
* @param {object} row
* @example
* const columns = getChildrenColumns(row);
**/
export function getChildrenColumns(row) {
    return Array.from(row.element.querySelectorAll(ALL_COL_SELECTOR)).filter((col) => {
        return col.parentNode.isSameNode(row.element);
    }, this);
}

/*
* get mouse cursor
* @returns {null}
* @param {object} e
* @example
* setMouseIndicator(e);
**/
export function setMouseIndicator(e) {
    e.dataTransfer.dropEffect = 'none';
    return false;
}

/*
* createFromDrop used in afterDrop method for column
* @returns {null}
* @param {object} layout
* @param {string} html
* @example
* const layout = new Layout();
* createFromDrop(layout, '<div>html</html>`);
**/
export function createFromDrop(layout, html) {
    const shell = createDomNode('div');
    layout.element.appendChild(shell);
    shell.outerHTML = html;
    // first child gets around the shell div created from safe insert of outerHTML
    layout.element = layout.element.firstChild;
    layout.element.classList.add(CONTENT_VIEW_CLASSNAME);
}

/*
* getConvertedWidth used in afterDrop method for column
* @returns {int}
* @param {column} column
* @example
* const column = new Column();
* const width = getConvertedWidth(column);
* console.log(width); // 50
**/
export function getConvertedWidth(column) {
    let width;
    let str;
    let nums;

    if (column.style.width) {
        width = column.style.width;
    }

    else {
        column.classList.forEach((cls) => {
            if (cls.indexOf(COL_CLASSNAME) !== -1) {
                str = cls.substring(COL_CLASSNAME.length);
                if (str) {
                    nums = str.split('-');
                    width = parseInt(nums[0], 10) / parseInt(nums[1], 10) * 100;
                }
            }
        });
    }

    return width;

}

export function updateRowTitle(row, cfg) {

    const title = cfg.title || ROW_TITLE;
    let titleRow;

    if (row.element.querySelector('.mozu-row-title')) {
        row.element.querySelector('.mozu-row-title').innerHTML = title;
    }

    else {
        titleRow = createDomNode('span', 'mozu-row-title');
        titleRow.innerHTML = title;
        row.header.appendChild(titleRow);
    }

    row.element.setAttribute(DATA_WIDGET_ATTRIBUTE, JSON.stringify({title: title}));

}

/*
* remove a column if its been dragged
* and rebase the parent row of the column
* @returns {null}
* @example
* const column = new Column();
* removeElementWhereDragStarted(column.element);
**/
export function removeElementWhereDragStarted() {
    const copy = document.querySelector(COL_COPY_SELECTOR);
    if (copy) {
        const parentRow = copy.parentNode;
        remove(copy);
        rebaseRow(parentRow);
    }
}

/*
* get rowTitle from a Row class
* @returns {string}
* @param {object} row
* @example
* const rowTitle = getRowTitle(row);
**/
export function getRowTitle(row) {
    const jsonData = JSON.parse(row.element.getAttribute(DATA_WIDGET_ATTRIBUTE));

    if (jsonData) {
        return jsonData.title;
    }

    else {
        return ROW_TITLE;
    }
}

/*
* if a widget is dropped into an empty grid (which no layouts)
* a layout element must be created to wrap it
*
* if the widget is being dropped to the left or right
* isOnlyCol = true
*
* @returns {object}
* @param {object} block
* @param {boolean} isOnlyCol
* @example
* dropWidgetWithLayout(newWidget);
**/
export function dropWidgetWithLayout(block, isOnlyCol = false) {
    const row = new Row();
    const column = new Column();
    removeDropHint(column.element);
    column.element.appendChild(block.element);

    if (isOnlyCol) {
        return column;
    }
    else {
        row.element.appendChild(column.element);
        return row;
    }
}

/*
* when a widget is dropped to the left or right of an exisiting widget
* while in content mode, it needs to be wrapped in a layout element
*
*
* @returns {null}
* @param {object} eventedBlock
* @param {object} block
* @param {object} position
* @example
* dropWidgetWithLayout(newWidget);
**/
export function insertColWithWidget(eventedBlock, block, position) {
    const layout = dropWidgetWithLayout(block, true);

    if (position === POSITION_DICTIONARY.RIGHT) {
        eventedBlock.element.parentNode.insertBefore(layout.element, eventedBlock.element.nextElementSibling);
    }

    else if (position === POSITION_DICTIONARY.LEFT) {
        eventedBlock.element.parentNode.insertBefore(layout.element, eventedBlock.element);
    }

    Chorizo.editor.showLayoutHeaders(false);
    rebaseRow(eventedBlock.element.parentNode);
}

/*
* insertWidgetElement is the central function for dropping any widget
* into a layout element, or into a grid, or ontop of an existing widget
*
*
* @returns {null}
* @param {object} eventedBlock
* @param {function} cb
* @param {string} html
* @param {object} cfg
* @example
* insertWidgetElement(block, () => {}, '<div>widget</div>', { widgetId: 'content'});
**/
export function insertWidgetElement(eventedBlock, cb, html, cfg) {

    removeDropHint(eventedBlock.element);
    const row = new Row();
    const block = new Block();
    let layout;

    block.create(cfg, html);

    // if we drop a widget into a dropzone, lets create a layout element around it
    if (eventedBlock.element.parentNode.parentNode.classList.contains(GRID_CLASSNAME)) {
        layout = dropWidgetWithLayout(block, false);
        eventedBlock.element.appendChild(layout.element);
        Chorizo.editor.showLayoutHeaders(false);
        updateColClasses(layout);
    }

    else if (eventedBlock._colmouseposition.position === POSITION_DICTIONARY.BOTTOM) {
        if (!eventedBlock.element.querySelector(BLOCK_SELECTOR)) {
            eventedBlock.element.appendChild(block.element);
        }

        else {
            eventedBlock._colmouseposition.element.parentNode.insertBefore(
                                                        block.element,
                                                        eventedBlock._colmouseposition.element.nextSibling);
        }
    }

    else if (eventedBlock._colmouseposition.position === POSITION_DICTIONARY.TOP) {
        eventedBlock.element.insertBefore(block.element, eventedBlock._colmouseposition.element);
    }

    else if (eventedBlock._colmouseposition.position === POSITION_DICTIONARY.LEFT
        || eventedBlock._colmouseposition.position === POSITION_DICTIONARY.RIGHT) {
        insertColWithWidget(eventedBlock, block, eventedBlock._colmouseposition.position);
        row.element = block.element.parentNode.parentNode;
        updateColClasses(row);
    }

    if (cb) {
        cb.call(this);
    }
}

/*
* editLayout is called when you click the pencil icon on a row element
*
* @returns {null}
* @param {object} row
* @example
* pencil.addEventListener('click', editLayout.bind(this, row));
**/
export function editLayout(row) {

    const config = {};
    const layoutJSON = JSON.parse(row.element.getAttribute(DATA_WIDGET_ATTRIBUTE));
    let counter = 1;

    Array.from(row.element.querySelectorAll(ALL_COL_SELECTOR)).forEach((col) => {

        if (col.parentNode.isSameNode(row.element)) {

            config['mz-col' + counter] = getConvertedWidth(col);
            counter++;
        }

    }, row);

    config.title = layoutJSON ? layoutJSON.title : 'mz-col-' + counter;

    // if you dont know about 0 index, you're gonna have a bad time;
    counter -= 1;

    // dont have widget editor for greater than 4 columns, so we'll just use that one
    if (counter > 4) {
        counter = 4;
    }

    Chorizo.editor.fireEvent('widgetedit', {
        widgetTypeId: 'mz-' + counter + '-col',
        type: 'layout',
        data: {
            definitionId: 'mz-' + counter + '-col',
            config: config
        },
        layoutCallback: function(cfg) {
            const widths = Object.keys(cfg.config);
            let colIndex = 0;
            updateRowTitle(row, cfg.config);

            widths.splice(widths.indexOf('title'), 1);

            Array.from(row.element.querySelectorAll(ALL_COL_SELECTOR)).forEach((col) => {
                const width = cfg.config[widths[colIndex]];
                if (col.parentNode.isSameNode(row.element)) {
                    col.style.width = width + '%';
                    colIndex++;
                    updateColClassAfterResize(row.element, col, width);
                }
            }, row);
        }
    });

}

/*
* when a layout element is edited, we need to match their new widths
* to mz-cms-span-gridSpan
* this function is called within editLayout
*
* @param {object} row
* @param {domNode} col
* @returns {int| width
* @example
* updateColClassesAfterResize(row, column.element, 60);
**/
export function updateColClassAfterResize(containingRow, col, width) {
    const grid = closest(containingRow, GRID_CLASSNAME);
    const gridSpan = getGridSpan(grid);
    const newSpan = Math.round((width / 100) * gridSpan);
    const cls = classMaker(newSpan, gridSpan);

    updateColSpanCls(col, cls);
}

/*
* when a layout element is dropped
* (generally via dragging an existing layout that has some content)
* this function is called by Column
*
* @param {object} block
* @param {object} layout
* @returns {null}
* @example
* dropLayoutWithContent(column, layout);
**/
export function dropLayoutWithContent(block, layout) {

    const previousHTML = document.querySelector(COL_COPY_SELECTOR)
            ? document.querySelector(COL_COPY_SELECTOR).cloneNode(true) : null;

    if (previousHTML) {
        removeDropHint(layout.element);

        Array.from(previousHTML.querySelectorAll('.mz-cms-tools, .mz-layout-widget-header'))
            .forEach((toolset) => {
                remove(toolset);
            }, this);

        layout.element.innerHTML = previousHTML.innerHTML;

        reinitializeContent(layout);
    }

    removeElementWhereDragStarted();

}

/*
* when a layout element is dropped
* (generally via dragging an existing layout that has some content)
* this function is called by Column to reinitialize all
* rows, colums, and widgets that may have been contained by this layout
*
* @param {object} layout
* @returns {null}
* @example
* reinitializeContent(layout);
**/
export function reinitializeContent(layout) {
    const rows = layout.element.querySelectorAll(ROW_SELECTOR);
    const cols = layout.element.querySelectorAll(ALL_COL_SELECTOR);
    const blocks = layout.element.querySelectorAll(BLOCK_SELECTOR);
    const nodeList = Array.prototype.slice.call(rows)
        .concat(Array.prototype.slice.call(cols))
        .concat(Array.prototype.slice.call(blocks));

    /* eslint-disable no-unused-vars */
    // reinit the layouts edit events becuase theyve been destroyed
    const regeneratedLayout = new Column(layout.element, false, true);

    nodeList.forEach(function(el) {

        let constructor;
        let temp;

        if (el.classList.contains(ROW_CLASSNAME)) {
            constructor = Row;
        }

        else if (el.classList.contains(BLOCK_CLASSNAME)) {
            constructor = Block;
        }

        else {
            constructor = Column;
        }

        temp = new constructor(el);

        if (temp instanceof Column) {
            temp.removeDropHint();
        }

    });
}

/*
* showResizer is called when you click the DOM, or click a widget
*
* @returns {null}
* @param {object} block
* @param {event} e
* @example
* pencil.addEventListener('click', editLayout.bind(this, row));
**/
export function showResizer(block, e) {
    e.stopPropagation();

    Array.from(document.querySelectorAll(`${ALL_COL_SELECTOR}, ${BLOCK_SELECTOR}`)).forEach((col) => {
        col.classList.remove('mz-cms-state-selected');
    });

    if (this._type === BLOCK_TYPES.BLOCK
            && Chorizo.editor.hideLayouts
            && this.widgetData
            && this.widgetData.config.heightResizable) {
        this.resizer = Chorizo.editor.getResizer();
        this.element.classList.add('mz-cms-state-selected');
        this.element.appendChild(this.resizer);
    }

    // showing content editor on single click
    if (this.widgetData
            && this.widgetData.definitionId
            && this.widgetData.definitionId === 'content'
            && !e.target.classList.contains('trash')) {

        contentWidget.revealEditor(this);
    }
}