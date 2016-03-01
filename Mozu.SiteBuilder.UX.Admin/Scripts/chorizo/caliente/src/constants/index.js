export const POSITION_DICTIONARY = {
    TOP: 'TOP',
    RIGHT: 'RIGHT',
    BOTTOM: 'BOTTOM',
    LEFT: 'LEFT'
};

export const BLOCK_TYPES = {
    ROW: 'ROW',
    COL: 'COL',
    WIDGET: 'WIDGET',
    BLOCK: 'BLOCK'
};

export const DRAG_EVENTS = {
    dragStart: 'dragstart',
    dragEnd: 'dragend',
    dragOver: 'dragover',
    drag: 'drag',
    drop: 'drop'
};

export const DRAG_HANDLE_CLASSES = ['ui-draggable', 'resizer-column'];

export const DEFAULT_GRID_SPAN = 12;

export const CMS_EDITING_CLASSNAME = 'mz-cms-editing';

export const GRID_CLASSNAME = 'mz-drop-zone';

export const GRID_SELECTOR = `.${GRID_CLASSNAME}`;

export const EDITABLE_GRID_SELECTOR = `${GRID_SELECTOR}.mz-cms-editing`;

export const COL_CLASSNAME = 'mz-cms-col-';

export const GRID_WRAPPER_SELECTOR = `.${COL_CLASSNAME}12-12`;

export const COL_SELECTOR = `.${COL_CLASSNAME}`;

export const ALL_COL_SELECTOR = `[class*="${COL_CLASSNAME}"]`;

export const ROW_CLASSNAME = 'mz-cms-row';

export const ROW_SELECTOR = `.${ROW_CLASSNAME}`;

export const BLOCK_CLASSNAME = 'mz-cms-block';

export const BLOCK_SELECTOR = `.${BLOCK_CLASSNAME}`;

export const CONTENT_CLASSNAME = 'mz-cms-content';

export const CONTENT_SELECTOR = `.${CONTENT_CLASSNAME}`;

export const MZ_CMS_SHOW_CLASS = 'mz-cms-show-zone';

export const MZ_CMS_TOOLS_CLASS = 'mz-cms-tools';

export const MZ_CMS_TOOLS_SELECTOR = `.${MZ_CMS_TOOLS_CLASS}`;

export const DROP_HINT_TEXT = 'Drop an Element';

export const DROP_HINT_CLASSNAME = 'mz-drop-hint';

export const DROP_HINT_SELECTOR = `.${DROP_HINT_CLASSNAME}`;

export const ROW_TITLE = 'Dropzone';

export const HINT_BAR_CLASSNAME = 'mz-cms-hint-bar';

export const HINT_BAR_MESSAGE_CLASSNAME = 'mz-cms-hint-message';

export const HINT_BAR_UPRIGHT_CLASSNAME = 'mz-cms-upright';

export const RESIZER_CLASSNAME = 'mz-cms-resizer';

export const RESIZER_HANDLE_CLASSNAME = 'mz-cms-bottom';

export const DEFAULT_CURSOR_STYLE = 'auto';

export const DRAG_CURSOR_STYLE = 'ew-resize';

export const DATA_WIDGET_ATTRIBUTE = 'data-widget';

export const DATA_GRID_ATTRIBUTE = 'data-drop-zone';

export const LAYOUT_WIDGET_HEADER_CLASSNAME = 'mz-layout-widget-header';

export const LAYOUT_WIDGET_HEADER_SELECTOR = `.${LAYOUT_WIDGET_HEADER_CLASSNAME}`;

export const CONTENT_SCREEN_CLASSNAME = 'mz-content-screen';

export const CONTENT_VIEW_CLASSNAME = 'content-view';

export const DROPOVER_CLASSNAME = 'mz-cms-drop-over';

export const WIDGET_COPY_ID = 'mz-widget-copy';

export const WIDGET_COPY_SELECTOR = `#${WIDGET_COPY_ID}`;

export const COL_COPY_ID = 'mz-node-copy';

export const COL_COPY_SELECTOR = `#${COL_COPY_ID}`;

export const MIN_COLUMN_WIDTH = 10;

// content widget

export const TRASH_ICON = 'chorizo-icon';

export const EDITING_STATE_CLASS = 'mz-cms-state-editing';

export const TEMP_LINK_ID = '#mz-cms-temp-link';

export const URL_TOOLTIP_CLASS = 'mz-cms-tooltip';

export const CONTENT_WIDGET_STYLE_ATTRIBUTE = 'data-style';

export const CONTENT_WIDGET_FORMAT_BAR = 'mz-cms-format-bar';

export const CONTENT_WIDGET_ROLE_ATTRIBUTE = 'data-role';

export const CONTENT_WIDGET_STYLE_DROPDOWN_ATTRIBUTE = 'data-role="styles"';

export const CONTENT_WIDGET_STYLE_DROPDOWN_SELECTOR = `[${CONTENT_WIDGET_STYLE_DROPDOWN_ATTRIBUTE}] ul`;
