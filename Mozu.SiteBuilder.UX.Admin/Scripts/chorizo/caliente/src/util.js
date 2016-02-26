import {
    COL_CLASSNAME,
    DEFAULT_GRID_SPAN,
    DATA_GRID_ATTRIBUTE
} from './constants';

// ugh to fix ie11 issue; delete when browsers support Array.from
Array.from = function() {
    return Array.prototype.slice.call(arguments[0]);
};

export function getGridSpan(grid) {
    const gridSpan = grid
        && grid.getAttribute(DATA_GRID_ATTRIBUTE)
        ? JSON.parse(grid.getAttribute(DATA_GRID_ATTRIBUTE)).span
        : DEFAULT_GRID_SPAN;

    return gridSpan;
}

export function classMaker(span, gridSpan) {

    if (!span || !gridSpan) {
        return COL_CLASSNAME;
    }

    return `${COL_CLASSNAME}${span}-${gridSpan}`;
}

export function updateColSpanCls(col, newCls) {

    col.classList.forEach((colClass) => {

        if (colClass.match(/col-/)) {
            col.classList.remove(colClass);
            col.classList.add(newCls);
        }

    });
}