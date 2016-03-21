import {
    ALL_COL_SELECTOR,
    ROW_SELECTOR,
    BLOCK_SELECTOR,
    EDITABLE_GRID_SELECTOR
} from './constants';

import {
    showResizer
} from './utilities';

import Grid from './ui-components/Grid';
import Row from './ui-components/Row';
import Column from './ui-components/Column';
import Block from './ui-components/Block';

import { factory } from './utilities/factory';
import { editor } from './editor';

(function() {

    window._mouseposition = null;

    document.addEventListener('DOMContentLoaded', function() {

        if (!window.Chorizo) {
            window.Chorizo = {};
        }

        // initialize singleton editor
        Chorizo.editor = editor;
        Chorizo.editor.init();

        // init grids that aren't inherited
        factory(EDITABLE_GRID_SELECTOR, Grid);
        factory(ROW_SELECTOR, Row);
        factory(ALL_COL_SELECTOR, Column);
        factory(BLOCK_SELECTOR, Block);

        if (Chorizo.editor.hideLayouts) {
            Chorizo.editor.showLayoutHeaders(false);
            Chorizo.editor.resetDirtyState();
        }

        document.addEventListener('click', showResizer.bind(this, this));
    });

})();