import {
    LAYOUT_WIDGET_HEADER_CLASSNAME,
    COL_CLASSNAME,
    ROW_SELECTOR,
    POSITION_DICTIONARY,
    BLOCK_TYPES,
    BLOCK_CLASSNAME,
    GRID_CLASSNAME
} from './../../constants';

import {
    closest,
    remove,
    closestByRegex,
    addDropHint,
    rebaseRow,
    createDomNode,
    findPosition
} from './../../utilities';

/*
* remove a caliente column
*
* @returns {null}
* @param {object}
* @example
*
* const column = new Column();
* removeColumn(column);
**/
export function removeColumn(block) {

    if (Chorizo && Chorizo.editor) {
        Chorizo.editor.setDirtyState(true);
    }

    const containingRow = closest(block.element, 'mz-layout-row');

    remove(block.element);

    // are there any existing columns in the element being deleted
    // not including the hint bar | and not including the row header?
    // if not, we need to readd the drophint son

    const children = Array.from(containingRow.childNodes)
        .some((child) => child.classList
                && !child.classList.contains(LAYOUT_WIDGET_HEADER_CLASSNAME)
                && !child.classList.contains('mz-cms-hint-bar'));

    // get the column which contains the element
    const parentLayout = containingRow.parentNode
        ? closestByRegex(containingRow.parentNode, COL_CLASSNAME) : null;

    // if the element has children DONT add the drop hint
    if (!children) {

        remove(containingRow);

        // if the element has no children, but the parent container DOES have children
        // do not add a drop hint
        if(!parentLayout.querySelector(ROW_SELECTOR)) {
            addDropHint(parentLayout);
        }
    }
    else {
        rebaseRow(containingRow);
    }
}

/*
* add a drag handle to a component
* currently this is just used by Column
* @returns {null}
* @param {object}
* @example
*
* const column = new Column();
* addDragHandle(column);
**/
export function addDragHandle(block, classes) {

    block.handle = createDomNode('div', ...classes);

    block.element.appendChild(block.handle);

    block.handle.addEventListener('mousedown', block.doDragWidth.bind(block));
    block.handle.addEventListener('mouseup', block.doDragWidth.bind(block));
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
* showHintBarMessage(e.target, x, y, width, height);
**/
export function showHintBarMessage(block, x, y, width, height, element, msg) {
    Chorizo.editor.showColHintBar(block.element.querySelector('.mz-layout-widget-header'), x, y, width, msg);
}

/*
* get hinting data for Columns on dragover
* @returns {object}
* @param {boolean} hideLayouts
* @param {int} x
* @param {int} y
* @param {int} height
* @param {domNode} element
* @param {object} hoveredTarget
* @example
* this._colmouseposition = getHintingData(
*      Chorizo.editor.hideLayouts,
*      x,
*      y,
*      width,
*      height,
*      this.element,
*      target,
*      e);
**/
export function getHintingData(hideLayouts, x, y, width, height, element, hoveredTarget) {
    let position;
    let targetedBlock;
    let pos = false;

    // if were in layout mode, hint for that
    if (!hideLayouts) {

        position = x / width;

        if (element.parentNode.parentNode.classList.contains(GRID_CLASSNAME)) {
            pos = false;
        }

        else if (position < 0.09) {
            pos = POSITION_DICTIONARY.LEFT;
        }

        else if (position > 0.89) {
            pos = POSITION_DICTIONARY.RIGHT;
        }

        return {
            position: pos,
            element: element,
            type: BLOCK_TYPES.COL
        };
    }

    // else were hinting on widgets -- top and bottom
    else {
        targetedBlock = closest(hoveredTarget, BLOCK_CLASSNAME);

        if (targetedBlock) {
            // position = y / parseInt(window.getComputedStyle(targetedBlock, null).height, 10);
            position = findPosition(x, y, width, height);
        }

        else {
            position = POSITION_DICTIONARY.TOP;
        }

        // if (position) {

        // }

        // // console.log(this.findPosition(x, y, width, height));

        // if (position < 0.49) {
        //     pos = POSITION_DICTIONARY.TOP;
        // }

        // else {
        //     pos = POSITION_DICTIONARY.BOTTOM;
        // }

        return {
            position: position,
            element: targetedBlock,
            type: 'widget-col'
        };
    }
}
