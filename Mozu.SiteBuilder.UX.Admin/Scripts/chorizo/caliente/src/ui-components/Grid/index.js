import {
    GRID_WRAPPER_SELECTOR,
    ROW_SELECTOR,
    DATA_GRID_ATTRIBUTE,
    CONTENT_VIEW_CLASSNAME
} from './../../constants';

import {
    createDomNode,
    attachEvents,
    rebaseRow
} from './../../utilities';

import Column from './../Column';
import Row from './../Row';

export default class Grid {
    constructor(el) {
        this.element = el || createDomNode('div');

        this._type = 'grid';

        this.dropZoneData = JSON.parse(this.element.getAttribute(DATA_GRID_ATTRIBUTE));
        this.span = this.dropZoneData ? this.dropZoneData.span : null;

        attachEvents(this, {
            dragover: this.dragover.bind(this),
            dragleave: this.dragleave.bind(this)
        });

        this.rebase();
    }

    createLayout(isEmptyGrid) {
        const row = new Row(null, isEmptyGrid);
        const column = new Column(null, isEmptyGrid);
        row.element.appendChild(column.element);
        this.element.appendChild(row.element);
        rebaseRow(row.element);
    }

    wrapLayout(isEmptyGrid) {
        // if there is existing dropzone content, we need to wrap it with a layout element, and then init the column
        this.element.innerHTML = ['<div class="mz-layout-widget mz-layout-row mz-cms-row mz-editing">',
                                        '<div class="mz-layout-col mz-cms-col-12-12 mz-editing" style="width:100%">',
                                             this.element.innerHTML,
                                        '</div>',
                                  '</div>'].join('');

        const wrapper = new Column(this.element.querySelector(GRID_WRAPPER_SELECTOR), isEmptyGrid);

        // adding the class to correct padding -- not to the newly generated wrapper layout
        Array.from(this.element.querySelectorAll(ROW_SELECTOR)).forEach((row) => {
            if (!row.parentNode.classList.contains('mz-cms-grid')) {
                row.classList.add(CONTENT_VIEW_CLASSNAME);
            }
        });
    }

    rebase() {

        if (!this.element.querySelector(ROW_SELECTOR)) {

            this.createLayout(true);
        }

        else {
            this.wrapLayout(true);
        }
    }

    dragover(e) {
        e.preventDefault();
    }

    dragleave(e) {
        e.preventDefault();
    }
}