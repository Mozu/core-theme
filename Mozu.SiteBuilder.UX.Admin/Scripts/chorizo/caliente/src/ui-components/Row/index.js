import {
    ROW_CLASSNAME,
    BLOCK_TYPES,
    POSITION_DICTIONARY,
    GRID_CLASSNAME
} from './../../constants';

import {
    addLayoutHeader,
    attachEvents,
    resetMousePosition,
    setMouseIndicator,
    showRowHintBarMessage,
    removeRow,
    editLayout,
    getRowTitle,
    updateRowTitle,
    createDomNode,
    applyClasses
} from './../../utilities';

export const ROW_CLASSES = ['mz-layout-widget', 'mz-layout-row', ROW_CLASSNAME, 'mz-editing'];

export const ROW_HEADER_EVENTS = [
    {
        type: 'click',
        customEvent: 'destroy',
        func: removeRow
    },
    {
        type: 'click',
        customEvent: 'edit',
        func: editLayout
    }
];

export default class Row {
    constructor(el, isEmptyGrid) {
        this.element = el
            ? applyClasses(el, ROW_CLASSES)
            : createDomNode('div', ...ROW_CLASSES);

        this._type = BLOCK_TYPES.ROW;
        this.title = getRowTitle(this);
        this.init(isEmptyGrid);
    }

    isValidHint() {

        if (window._mouseposition && window._mouseposition.position === POSITION_DICTIONARY.RIGHT
                || window._mouseposition && window._mouseposition.position === POSITION_DICTIONARY.LEFT) {
            if (this.element.parentNode.parentNode.parentNode.classList.contains(GRID_CLASSNAME)) {
                return false;
            }
        }
        return true;
    }

    ondragOver(e) {

        resetMousePosition(this);
        e.preventDefault();
        e.stopPropagation();

        if (!this.isValidHint()) {
            setMouseIndicator(e, false);
        }
        // if you're hovering over a row, and not a droppable column
        if (!Chorizo.editor.hideLayouts && e.target.classList.contains('mz-layout-row')) {
            const x = e.offsetX;
            const y = e.offsetY;
            const width = parseInt(window.getComputedStyle(e.target, null).width, 10);
            const height = parseInt(window.getComputedStyle(e.target, null).height, 10);

            showRowHintBarMessage(this, e.target, x, y, width, height, BLOCK_TYPES.ROW);
        }
    }

    ondragLeave(e) {
        e.preventDefault();
        window._mouseposition = null;
        Chorizo.editor.hideHintBar();
    }

    drop() {

    }

    init(isEmptyGrid) {

        // if the row isnt the inherited row for the dropzone
        if (!this.element.parentNode || !this.element.parentNode.classList.contains(GRID_CLASSNAME)) {
            // see README for isEmptyGrid
            if (!isEmptyGrid) {
                addLayoutHeader(this, BLOCK_TYPES.ROW, ROW_HEADER_EVENTS, isEmptyGrid);
                updateRowTitle(this, { title: this.title });
            }

        }

        attachEvents(this, {
            dragover: this.ondragOver.bind(this),
            dragleave: this.ondragLeave.bind(this),
            drop: this.drop.bind(this)
        });

    }
}