(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var POSITION_DICTIONARY = {
    TOP: 'TOP',
    RIGHT: 'RIGHT',
    BOTTOM: 'BOTTOM',
    LEFT: 'LEFT'
};

exports.POSITION_DICTIONARY = POSITION_DICTIONARY;
var BLOCK_TYPES = {
    ROW: 'ROW',
    COL: 'COL',
    WIDGET: 'WIDGET',
    BLOCK: 'BLOCK'
};

exports.BLOCK_TYPES = BLOCK_TYPES;
var DRAG_EVENTS = {
    dragStart: 'dragstart',
    dragEnd: 'dragend',
    dragOver: 'dragover',
    drag: 'drag',
    drop: 'drop'
};

exports.DRAG_EVENTS = DRAG_EVENTS;
var DRAG_HANDLE_CLASSES = ['ui-draggable', 'resizer-column'];

exports.DRAG_HANDLE_CLASSES = DRAG_HANDLE_CLASSES;
var DEFAULT_GRID_SPAN = 12;

exports.DEFAULT_GRID_SPAN = DEFAULT_GRID_SPAN;
var CMS_EDITING_CLASSNAME = 'mz-cms-editing';

exports.CMS_EDITING_CLASSNAME = CMS_EDITING_CLASSNAME;
var GRID_CLASSNAME = 'mz-drop-zone';

exports.GRID_CLASSNAME = GRID_CLASSNAME;
var GRID_SELECTOR = '.' + GRID_CLASSNAME;

exports.GRID_SELECTOR = GRID_SELECTOR;
var EDITABLE_GRID_SELECTOR = GRID_SELECTOR + '.mz-cms-editing';

exports.EDITABLE_GRID_SELECTOR = EDITABLE_GRID_SELECTOR;
var COL_CLASSNAME = 'mz-cms-col-';

exports.COL_CLASSNAME = COL_CLASSNAME;
var GRID_WRAPPER_SELECTOR = '.' + COL_CLASSNAME + '12-12';

exports.GRID_WRAPPER_SELECTOR = GRID_WRAPPER_SELECTOR;
var COL_SELECTOR = '.' + COL_CLASSNAME;

exports.COL_SELECTOR = COL_SELECTOR;
var ALL_COL_SELECTOR = '[class*="' + COL_CLASSNAME + '"]';

exports.ALL_COL_SELECTOR = ALL_COL_SELECTOR;
var ROW_CLASSNAME = 'mz-cms-row';

exports.ROW_CLASSNAME = ROW_CLASSNAME;
var ROW_SELECTOR = '.' + ROW_CLASSNAME;

exports.ROW_SELECTOR = ROW_SELECTOR;
var BLOCK_CLASSNAME = 'mz-cms-block';

exports.BLOCK_CLASSNAME = BLOCK_CLASSNAME;
var BLOCK_SELECTOR = '.' + BLOCK_CLASSNAME;

exports.BLOCK_SELECTOR = BLOCK_SELECTOR;
var CONTENT_CLASSNAME = 'mz-cms-content';

exports.CONTENT_CLASSNAME = CONTENT_CLASSNAME;
var CONTENT_SELECTOR = '.' + CONTENT_CLASSNAME;

exports.CONTENT_SELECTOR = CONTENT_SELECTOR;
var MZ_CMS_SHOW_CLASS = 'mz-cms-show-zone';

exports.MZ_CMS_SHOW_CLASS = MZ_CMS_SHOW_CLASS;
var MZ_CMS_TOOLS_CLASS = 'mz-cms-tools';

exports.MZ_CMS_TOOLS_CLASS = MZ_CMS_TOOLS_CLASS;
var MZ_CMS_TOOLS_SELECTOR = '.' + MZ_CMS_TOOLS_CLASS;

exports.MZ_CMS_TOOLS_SELECTOR = MZ_CMS_TOOLS_SELECTOR;
var DROP_HINT_TEXT = 'Drop an Element';

exports.DROP_HINT_TEXT = DROP_HINT_TEXT;
var DROP_HINT_CLASSNAME = 'mz-drop-hint';

exports.DROP_HINT_CLASSNAME = DROP_HINT_CLASSNAME;
var DROP_HINT_SELECTOR = '.' + DROP_HINT_CLASSNAME;

exports.DROP_HINT_SELECTOR = DROP_HINT_SELECTOR;
var ROW_TITLE = 'Dropzone';

exports.ROW_TITLE = ROW_TITLE;
var HINT_BAR_CLASSNAME = 'mz-cms-hint-bar';

exports.HINT_BAR_CLASSNAME = HINT_BAR_CLASSNAME;
var HINT_BAR_MESSAGE_CLASSNAME = 'mz-cms-hint-message';

exports.HINT_BAR_MESSAGE_CLASSNAME = HINT_BAR_MESSAGE_CLASSNAME;
var HINT_BAR_UPRIGHT_CLASSNAME = 'mz-cms-upright';

exports.HINT_BAR_UPRIGHT_CLASSNAME = HINT_BAR_UPRIGHT_CLASSNAME;
var RESIZER_CLASSNAME = 'mz-cms-resizer';

exports.RESIZER_CLASSNAME = RESIZER_CLASSNAME;
var RESIZER_HANDLE_CLASSNAME = 'mz-cms-bottom';

exports.RESIZER_HANDLE_CLASSNAME = RESIZER_HANDLE_CLASSNAME;
var DEFAULT_CURSOR_STYLE = 'auto';

exports.DEFAULT_CURSOR_STYLE = DEFAULT_CURSOR_STYLE;
var DRAG_CURSOR_STYLE = 'ew-resize';

exports.DRAG_CURSOR_STYLE = DRAG_CURSOR_STYLE;
var DATA_WIDGET_ATTRIBUTE = 'data-widget';

exports.DATA_WIDGET_ATTRIBUTE = DATA_WIDGET_ATTRIBUTE;
var DATA_GRID_ATTRIBUTE = 'data-drop-zone';

exports.DATA_GRID_ATTRIBUTE = DATA_GRID_ATTRIBUTE;
var LAYOUT_WIDGET_HEADER_CLASSNAME = 'mz-layout-widget-header';

exports.LAYOUT_WIDGET_HEADER_CLASSNAME = LAYOUT_WIDGET_HEADER_CLASSNAME;
var LAYOUT_WIDGET_HEADER_SELECTOR = '.' + LAYOUT_WIDGET_HEADER_CLASSNAME;

exports.LAYOUT_WIDGET_HEADER_SELECTOR = LAYOUT_WIDGET_HEADER_SELECTOR;
var CONTENT_SCREEN_CLASSNAME = 'mz-content-screen';

exports.CONTENT_SCREEN_CLASSNAME = CONTENT_SCREEN_CLASSNAME;
var CONTENT_VIEW_CLASSNAME = 'content-view';

exports.CONTENT_VIEW_CLASSNAME = CONTENT_VIEW_CLASSNAME;
var DROPOVER_CLASSNAME = 'mz-cms-drop-over';

exports.DROPOVER_CLASSNAME = DROPOVER_CLASSNAME;
var WIDGET_COPY_ID = 'mz-widget-copy';

exports.WIDGET_COPY_ID = WIDGET_COPY_ID;
var WIDGET_COPY_SELECTOR = '#' + WIDGET_COPY_ID;

exports.WIDGET_COPY_SELECTOR = WIDGET_COPY_SELECTOR;
var COL_COPY_ID = 'mz-node-copy';

exports.COL_COPY_ID = COL_COPY_ID;
var COL_COPY_SELECTOR = '#' + COL_COPY_ID;

exports.COL_COPY_SELECTOR = COL_COPY_SELECTOR;
var MIN_COLUMN_WIDTH = 10;

exports.MIN_COLUMN_WIDTH = MIN_COLUMN_WIDTH;
// content widget

var TRASH_ICON = 'chorizo-icon';

exports.TRASH_ICON = TRASH_ICON;
var EDITING_STATE_CLASS = 'mz-cms-state-editing';

exports.EDITING_STATE_CLASS = EDITING_STATE_CLASS;
var TEMP_LINK_ID = '#mz-cms-temp-link';

exports.TEMP_LINK_ID = TEMP_LINK_ID;
var URL_TOOLTIP_CLASS = 'mz-cms-tooltip';

exports.URL_TOOLTIP_CLASS = URL_TOOLTIP_CLASS;
var CONTENT_WIDGET_STYLE_ATTRIBUTE = 'data-style';

exports.CONTENT_WIDGET_STYLE_ATTRIBUTE = CONTENT_WIDGET_STYLE_ATTRIBUTE;
var CONTENT_WIDGET_FORMAT_BAR = 'mz-cms-format-bar';

exports.CONTENT_WIDGET_FORMAT_BAR = CONTENT_WIDGET_FORMAT_BAR;
var CONTENT_WIDGET_ROLE_ATTRIBUTE = 'data-role';

exports.CONTENT_WIDGET_ROLE_ATTRIBUTE = CONTENT_WIDGET_ROLE_ATTRIBUTE;
var CONTENT_WIDGET_STYLE_DROPDOWN_ATTRIBUTE = 'data-role="styles"';

exports.CONTENT_WIDGET_STYLE_DROPDOWN_ATTRIBUTE = CONTENT_WIDGET_STYLE_DROPDOWN_ATTRIBUTE;
var CONTENT_WIDGET_STYLE_DROPDOWN_SELECTOR = '[' + CONTENT_WIDGET_STYLE_DROPDOWN_ATTRIBUTE + '] ul';
exports.CONTENT_WIDGET_STYLE_DROPDOWN_SELECTOR = CONTENT_WIDGET_STYLE_DROPDOWN_SELECTOR;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./../constants');

var _utilities = require('./../utilities');

var _utilitiesFactory = require('./../utilities/factory');

var _widgetsContent = require('./../widgets/Content');

var Editor = (function () {
    function Editor() {
        _classCallCheck(this, Editor);

        this.windowContext = window;
    }

    _createClass(Editor, [{
        key: 'init',
        value: function init() {
            document.body.classList.add(_constants.CMS_EDITING_CLASSNAME);
            this.createHintBar();
            this.createDragIcon();
            this.createResizer();
            this.fireEvent('pageload', this);
        }
    }, {
        key: 'updateAllContentWidgets',
        value: function updateAllContentWidgets() {
            Array.from(document.querySelectorAll(_constants.BLOCK_SELECTOR)).forEach(function (block) {

                if (!block) {
                    return false;
                }

                var type = JSON.parse(block.getAttribute('data-widget'));

                if (type && type.definitionId === 'content') {

                    var widget = block.querySelector(_constants.CONTENT_SELECTOR);
                    var newWidgetData = widget.innerHTML;
                    var existingData = JSON.parse(widget.parentElement.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));

                    if (existingData) {
                        existingData.config.body = newWidgetData;
                        widget.parentElement.setAttribute(_constants.DATA_WIDGET_ATTRIBUTE, JSON.stringify(existingData));
                    }
                }
            });
        }
    }, {
        key: 'setDirtyState',
        value: function setDirtyState(val) {
            _widgetsContent.contentWidget.toggleAllContentWidgets();
            _widgetsContent.contentWidget.hideEditor();
            this._dirty = val ? val : false;
        }
    }, {
        key: 'createResizer',
        value: function createResizer() {
            this.resizer = document.createElement('div');
            this.handle = document.createElement('div');

            this.resizer.classList.add(_constants.RESIZER_CLASSNAME);
            this.handle.classList.add(_constants.RESIZER_HANDLE_CLASSNAME);

            this.resizer.appendChild(this.handle);

            this.initResizerEvents();

            document.body.appendChild(this.resizer);
        }
    }, {
        key: 'idSanitizer',
        value: function idSanitizer(str) {
            return str.replace(/[^0-9a-zA-Z]+/g, '');
        }
    }, {
        key: 'getWidgetIcon',
        value: function getWidgetIcon(id) {
            return this.widgetIconDefinitions[this.idSanitizer(id)];
        }
    }, {
        key: 'setCursorStyle',
        value: function setCursorStyle(type) {

            var cursorStyle = null;

            switch (type) {
                case 'drag':
                    cursorStyle = _constants.DRAG_CURSOR_STYLE;
                    break;
                default:
                    cursorStyle = _constants.DEFAULT_CURSOR_STYLE;
            }

            document.body.style.cursor = cursorStyle;
        }
    }, {
        key: 'getBrowserDragEvents',
        value: function getBrowserDragEvents() {

            var dragEvents = {
                dragStart: 'dragstart',
                dragEnd: 'dragend',
                dragOver: 'dragover',
                drag: 'drag',
                drop: 'drop'
            };

            if (this.isInternetExplorer()) {
                dragEvents = {
                    dragStart: 'dragstart',
                    dragEnd: 'dragend',
                    dragOver: 'dragover',
                    drag: 'drag',
                    drop: 'drop'
                };
            }

            return dragEvents;
        }
    }, {
        key: 'isInternetExplorer',
        value: function isInternetExplorer() {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");

            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
                return true;
            }
        }
    }, {
        key: 'initResizerEvents',
        value: function initResizerEvents() {

            var block = undefined;
            var widgetData = undefined;
            var newHeight = undefined;

            this.handle.addEventListener('mousedown', (function () {
                this.resizing = true;
            }).bind(this));

            document.addEventListener('mouseup', (function () {
                this.setCursorStyle();
                this.resizing = false;
                this._draggingColumn = false;

                if (block && widgetData) {
                    widgetData.config.height = newHeight;
                    block.setAttribute(_constants.DATA_WIDGET_ATTRIBUTE, JSON.stringify(widgetData));
                }
                block = null;
                widgetData = null;
            }).bind(this));

            document.addEventListener('mousemove', (function (e) {

                if (this.resizing) {
                    block = this.resizer.parentNode;
                    widgetData = JSON.parse(block.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));
                    newHeight = document.body.scrollTop + e.clientY - block.offsetTop - 320;

                    block.querySelector(_constants.CONTENT_SELECTOR).style.height = newHeight + 'px';
                } else if (this._draggingColumn) {
                    this.setDirtyState(true);
                    this.resizePercentage(e);
                }
            }).bind(this));
        }
    }, {
        key: 'getComputedPercentage',
        value: function getComputedPercentage(e, col) {

            // algorithm: where the mouse is relative to the whole page -
            // the offset left of the column were dragging / the width of the parent row

            var percentage = (e.clientX - col.getBoundingClientRect().left) / this.getComputedWidth(col.parentNode);

            return percentage;
        }
    }, {
        key: 'getOtherColsCombinedWidth',
        value: function getOtherColsCombinedWidth(allAssociatedColumns, col) {
            return Math.abs(allAssociatedColumns.reduce(function (prev, curr) {
                if (!curr.isSameNode(col) && !curr.isSameNode(col.nextElementSibling) && curr.parentNode.isSameNode(col.parentNode)) {
                    return prev + parseFloat(curr.style.width);
                }
                return prev;
            }, 0));
        }
    }, {
        key: 'getWidthWithQuery',
        value: function getWidthWithQuery(allAssociatedColumns, parent, col) {
            return Math.abs(allAssociatedColumns.reduce(function (prev, curr) {
                if (curr.parentNode.isSameNode(parent) && !curr.isSameNode(col)) {
                    return prev + parseFloat(curr.style.width);
                }
                return prev;
            }, 0) - 100);
        }
    }, {
        key: 'resizePercentage',
        value: function resizePercentage(e) {
            e.preventDefault();
            this.setCursorStyle('drag');

            var col = this._draggingColumn;
            var nextSibling = col.nextElementSibling;
            var computedPercentage = this.getComputedPercentage(e, col) * 100;
            var allAssociatedColumns = Array.from(col.parentNode.querySelectorAll(_constants.ALL_COL_SELECTOR));
            var otherColsWidth = this.getOtherColsCombinedWidth(allAssociatedColumns, col);
            var finalColumnWidth = undefined;
            var remainingColumnsWidth = undefined;

            // if the width of our newly computed percentage is greater than the allowed limit, return
            if (otherColsWidth + computedPercentage + _constants.MIN_COLUMN_WIDTH >= 100) {
                return false;
            } else if (computedPercentage < _constants.MIN_COLUMN_WIDTH) {
                col.style.width = _constants.MIN_COLUMN_WIDTH + '%';
            } else {
                col.style.width = computedPercentage + '%';
            }

            // once we know what weve resized our target element to,
            // we can query the remaining elements to deterime what the nextSibling width should be
            remainingColumnsWidth = this.getWidthWithQuery(allAssociatedColumns, col.parentNode, nextSibling);

            // dont let them make a column smaller than 10%
            if (remainingColumnsWidth < _constants.MIN_COLUMN_WIDTH) {
                nextSibling.style.width = _constants.MIN_COLUMN_WIDTH + '%';
                finalColumnWidth = this.getWidthWithQuery(col.parentNode, col);
                col.style.width = finalColumnWidth + '%';
            } else {
                nextSibling.style.width = remainingColumnsWidth + '%';
            }

            this.updateSpan(computedPercentage, 12, col, nextSibling);
        }
    }, {
        key: 'updateSpan',
        value: function updateSpan(colWithPercent, gridSpan, col, nextSibling) {
            var colSpan = this.getSpanClass(col.classList);
            var nextSiblingSpan = this.getSpanClass(nextSibling.classList);
            var newSpan = Math.round(colWithPercent / 100 * gridSpan);
            var delta = newSpan - colSpan;
            var nextColSpan = Math.abs(delta - parseInt(nextSiblingSpan, 10));

            (0, _utilities.updateColSpanCls)(col, (0, _utilities.classMaker)(newSpan, gridSpan));
            (0, _utilities.updateColSpanCls)(nextSibling, (0, _utilities.classMaker)(nextColSpan, gridSpan));
        }
    }, {
        key: 'getComputedWidth',
        value: function getComputedWidth(el) {
            return parseInt(window.getComputedStyle(el, null).width, 10);
        }
    }, {
        key: 'getResizer',
        value: function getResizer() {
            return this.resizer;
        }
    }, {
        key: 'createHintBar',
        value: function createHintBar() {
            this.hintbar = document.createElement('div');
            this.hintBarMessage = document.createElement('div');
            this.hintbar.className = _constants.HINT_BAR_CLASSNAME;
            this.hintBarMessage.className = _constants.HINT_BAR_MESSAGE_CLASSNAME;
            this.hintbar.appendChild(this.hintBarMessage);

            this.hintbarHeight = '3px';
            this.hintbarPadding = 45;

            document.body.appendChild(this.hintbar);
        }
    }, {
        key: 'hideHintBar',
        value: function hideHintBar() {
            this.hintbar.style.display = 'none';
        }
    }, {
        key: 'showColHintBar',
        value: function showColHintBar(element, x, y, width, msg) {
            this.cleanhintbar();

            if (msg === _constants.POSITION_DICTIONARY.LEFT || msg === _constants.POSITION_DICTIONARY.RIGHT) {
                this.hintbar.classList.add(_constants.HINT_BAR_UPRIGHT_CLASSNAME);
                this.hintbar.style.position = 'absolute';
                this.hintbar.style.height = parseInt(window.getComputedStyle(element.parentNode, null).height, 10) + 'px';
                this.hintbar.style.top = '0';
                this.hintbar.style.width = this.hintbarHeight;
                this.hintbar.style[msg.toLowerCase()] = '-2px';
            }

            var hintBarMessage = this.getModifiedMsg('col', msg, element);

            this.hintBarMessage.innerHTML = hintBarMessage;

            this.updateHintBarMessageCls(hintBarMessage);

            element.appendChild(this.hintbar);

            this.hintbar.style.display = 'block';
        }
    }, {
        key: 'updateHintBarMessageCls',
        value: function updateHintBarMessageCls(message) {
            this.hintBarMessage.classList.add(message.toLowerCase());
        }
    }, {
        key: 'showWidgetHintBar',
        value: function showWidgetHintBar(element, col, x, y, height, msg) {
            this.cleanhintbar();

            // dont need to hint, unless there are already widgets in this col
            if (!col.querySelector(_constants.BLOCK_SELECTOR) || !msg) {
                this.hintbar.style.display = 'none';
                return false;
            }

            var hintBarMessage = this.getModifiedMsg('widget', msg, element);

            if (msg === _constants.POSITION_DICTIONARY.TOP || msg === _constants.POSITION_DICTIONARY.BOTTOM) {
                this.hintbar.classList.remove(_constants.HINT_BAR_UPRIGHT_CLASSNAME);
                this.hintbar.style.position = 'absolute';
                this.hintbar.style[msg.toLowerCase()] = '0';
                this.hintbar.style.width = parseInt(window.getComputedStyle(element, null).width, 10) + 'px';
                this.hintbar.style.height = this.hintbarHeight;
                this.hintbar.style[msg.toLowerCase()] = '-2px';
                element.appendChild(this.hintbar);
            } else {
                this.hintbar.classList.add(_constants.HINT_BAR_UPRIGHT_CLASSNAME);
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
    }, {
        key: 'cleanhintbar',
        value: function cleanhintbar() {
            this.hintBarMessage.className = _constants.HINT_BAR_MESSAGE_CLASSNAME;
            this.hintbar.style.right = null;
            this.hintbar.style.left = null;
            this.hintbar.style.bottom = null;
            this.hintbar.style.top = null;
        }
    }, {
        key: 'showRowHintBar',
        value: function showRowHintBar(element, x, y, width, msg) {

            var offset = undefined;

            if (this.dragOccursOverDropZone(element, msg)) {
                return false;
            }
            // to do: make this css -- not awful, awful js
            this.cleanhintbar();

            if (msg === _constants.POSITION_DICTIONARY.LEFT || msg === _constants.POSITION_DICTIONARY.RIGHT) {
                this.hintbar.classList.add(_constants.HINT_BAR_UPRIGHT_CLASSNAME);
                this.hintbar.style.position = 'absolute';
                this.hintbar.style.height = parseInt(window.getComputedStyle(element.parentNode, null).height, 10) + 'px';
                this.hintbar.style.top = '0';
                this.hintbar.style.width = this.hintbarHeight;
                this.hintbar.style[msg.toLowerCase()] = '-2px';
            } else {

                offset = this.getHintBarOffset.call(this, msg, element);
                this.hintbar.style.position = 'relative';
                this.hintbar.style.width = parseInt(window.getComputedStyle(element.parentNode, null).width, 10) + 'px';
                this.hintbar.style.height = this.hintbarHeight;
                this.hintbar.style[offset.key.toLowerCase()] = offset.offset;
                this.hintbar.style.left = '-21px';
                this.hintbar.classList.remove(_constants.HINT_BAR_UPRIGHT_CLASSNAME);
            }

            var hintBarMessage = this.getModifiedMsg(_constants.BLOCK_TYPES.ROW, msg, element);

            this.hintBarMessage.innerHTML = hintBarMessage;

            this.updateHintBarMessageCls(hintBarMessage);

            element.appendChild(this.hintbar);

            this.hintbar.style.display = 'block';
        }
    }, {
        key: 'dragOccursOverDropZone',
        value: function dragOccursOverDropZone(e, msg) {
            return e.parentNode.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME) && msg === _constants.POSITION_DICTIONARY.LEFT || e.parentNode.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME) && msg === _constants.POSITION_DICTIONARY.RIGHT;
        }
    }, {
        key: 'getModifiedMsg',
        value: function getModifiedMsg(type, msg, element) {

            if (type === _constants.BLOCK_TYPES.ROW) {

                // ! a drag occurred in the left of a row, but theres a column to the left so we show in between;
                if (msg === _constants.POSITION_DICTIONARY.LEFT && element.parentNode.previousElementSibling && element.parentNode.previousElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }

                // ! a drag occurred in the right of a row, but theres a column to the right so we show in between;
                if (msg === _constants.POSITION_DICTIONARY.RIGHT && element.parentNode.nextElementSibling && element.parentNode.nextElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }
                // ! a drag occurred in the top of a row, but theres a row to the top so we show in between;
                if (msg === _constants.POSITION_DICTIONARY.TOP && element.previousSibling && !element.previousSibling.classList.contains(_constants.LAYOUT_WIDGET_HEADER_CLASSNAME)) {
                    return 'between';
                }

                // ! a drag occurred in the bottom of a row, but theres a row to the bottom so we show in between;
                if (msg === _constants.POSITION_DICTIONARY.BOTTOM && element.nextSibling) {
                    return 'between';
                }

                return msg;
            } else if (type === 'col') {
                // hinting for cols only happens left to right
                if (msg === _constants.POSITION_DICTIONARY.LEFT && element.parentNode.previousElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }

                if (msg === _constants.POSITION_DICTIONARY.RIGHT && element.parentNode.nextElementSibling && element.parentNode.nextElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }
            } else if (type === 'widget') {

                // hinting for widgets only happens top and bottom
                if (msg === _constants.POSITION_DICTIONARY.TOP && element.previousElementSibling && element.previousElementSibling.classList.contains(_constants.BLOCK_CLASSNAME)) {
                    return 'between';
                }

                if (msg === _constants.POSITION_DICTIONARY.BOTTOM && element.nextElementSibling && element.nextElementSibling.classList.contains(_constants.BLOCK_CLASSNAME)) {
                    return 'between';
                }

                if (msg === _constants.POSITION_DICTIONARY.LEFT && element.parentNode.previousElementSibling && element.parentNode.previousElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }

                if (msg === _constants.POSITION_DICTIONARY.RIGHT && element.parentNode.nextElementSibling && element.parentNode.nextElementSibling.classList.contains('mz-layout-col')) {
                    return 'between';
                }
            }

            return msg;
        }
    }, {
        key: 'getHintBarOffset',
        value: function getHintBarOffset(msg, element) {
            if (msg === _constants.POSITION_DICTIONARY.TOP) {
                return {
                    key: _constants.POSITION_DICTIONARY.TOP,
                    offset: '-' + this.hintbarPadding + 'px'
                };
            } else {
                return {
                    key: _constants.POSITION_DICTIONARY.TOP,
                    offset: parseInt(window.getComputedStyle(element, null).height, 10) - 44 + 'px'
                };
            }
        }
    }, {
        key: 'controller',
        value: function controller() {
            if (!this._controller) {
                this._controller = window.parent.Taco.app.controllers.get('Website');
            }
            return this._controller;
        }
    }, {
        key: 'fireEvent',
        value: function fireEvent() {
            this.controller().fireEvent.apply(this.controller(), arguments);
        }
    }, {
        key: 'showLayoutHeaders',
        value: function showLayoutHeaders(bool) {
            Array.from(document.querySelectorAll(_constants.LAYOUT_WIDGET_HEADER_SELECTOR)).forEach(function (el) {
                el.style.display = bool ? 'block' : 'none';
            });

            Array.from(document.querySelectorAll('.mz-layout-widget, .mz-cms-col-')).forEach(function (el) {
                if (bool && (0, _utilitiesFactory.isInEditableDropzone)(el)) {
                    if (!el.parentNode.classList.contains('mz-cms-grid')) {
                        el.classList.add(_constants.CONTENT_VIEW_CLASSNAME);
                    }
                } else {
                    el.classList.remove(_constants.CONTENT_VIEW_CLASSNAME);
                }
            });

            Array.from(document.querySelectorAll(_constants.BLOCK_SELECTOR)).forEach(function (block) {
                if (bool && (0, _utilitiesFactory.isInEditableDropzone)(block)) {
                    block.classList.add(_constants.CONTENT_SCREEN_CLASSNAME);
                } else {
                    block.classList.remove(_constants.CONTENT_SCREEN_CLASSNAME);
                }
            });
        }
    }, {
        key: 'showDropZones',
        value: function showDropZones() {
            Array.from(document.querySelectorAll('.mz-cms-grid, .mz-cms-col-')).forEach(function (grid) {
                grid.classList.add(_constants.MZ_CMS_SHOW_CLASS);
            });
        }
    }, {
        key: 'hideDropZones',
        value: function hideDropZones() {
            Array.from(document.querySelectorAll('.mz-cms-grid, .mz-cms-col-')).forEach(function (grid) {
                grid.classList.remove(_constants.MZ_CMS_SHOW_CLASS);
            });
        }
    }, {
        key: 'createDragIcon',
        value: function createDragIcon() {
            this.dragIcon = document.createElement('div');
            this.dragIcon.className = 'mz-drag-icon';
            document.body.appendChild(this.dragIcon);
        }
    }, {
        key: 'initDragIcon',
        value: function initDragIcon(src) {
            var imgSrc = '';
            if (src === 'layout') {
                imgSrc = 'url(' + this.getWidgetIcon('mz1col') + ')';
            } else {
                imgSrc = src.indexOf('url(') !== -1 ? src : 'url(' + src + ')';
            }
            this.dragIcon.style.display = 'block';
            this.dragIcon.style.backgroundImage = imgSrc;
        }
    }, {
        key: 'updateDragIconPosition',
        value: function updateDragIconPosition(event) {
            this.dragIcon.style.left = event.pageX + 'px';
            this.dragIcon.style.top = event.pageY + 'px';
        }
    }, {
        key: 'hideDragIcon',
        value: function hideDragIcon() {
            this.dragIcon.style.display = 'none';
        }
    }, {
        key: 'getSpanClass',
        value: function getSpanClass(list) {
            var str = undefined;
            var nums = undefined;
            Array.from(list).forEach(function (cls) {
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
    }, {
        key: 'persistanceData',
        value: function persistanceData() {

            this.updateAllContentWidgets();

            var data = [];

            Array.from(document.querySelectorAll('.mz-cms-grid')).forEach(function (grid) {

                var gridData = {
                    build: 'CALIENTE',
                    id: JSON.parse(grid.getAttribute(_constants.DATA_GRID_ATTRIBUTE)).id,
                    rows: []
                };

                Array.from(grid.querySelectorAll(_constants.ROW_SELECTOR)).forEach(function (row) {

                    // sweet spot of just the outer rows, that were not generated by the drop zone
                    if (!row.parentNode.classList.contains('mz-cms-grid') && row.parentNode.parentNode.parentNode.classList.contains('mz-cms-grid')) {
                        gridData.rows.push(getData(row));
                    }
                });

                data.push(gridData);
            });

            function getData(row) {

                var rowData = {
                    title: JSON.parse(row.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE)) ? JSON.parse(row.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE)).title : _constants.ROW_TITLE,
                    columns: []
                };
                var colData = undefined;

                Array.from(row.querySelectorAll(_constants.ALL_COL_SELECTOR)).forEach(function (col) {

                    if (col.parentNode.isSameNode(row)) {

                        colData = {
                            span: Chorizo.editor.getSpanClass(col.classList),
                            rows: [],
                            widgets: [],
                            width: col.style.width
                        };

                        if (col.querySelectorAll(_constants.ROW_SELECTOR).length > 0) {
                            Array.from(col.querySelectorAll(_constants.ROW_SELECTOR)).forEach(function (interiorRow) {
                                if (interiorRow.parentNode.isSameNode(col)) {
                                    colData.rows.push(getData(interiorRow));
                                }
                            });
                        } else {
                            Array.from(col.querySelectorAll(_constants.BLOCK_SELECTOR)).forEach(function (block) {
                                colData.widgets.push(JSON.parse(block.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE)));
                            });
                        }

                        rowData.columns.push(colData);
                    }
                });

                return rowData;
            }

            return data;
        }
    }, {
        key: 'isDirty',
        value: function isDirty() {
            return this._dirty;
        }
    }, {
        key: 'resetDirtyState',
        value: function resetDirtyState() {
            this._currentState = JSON.stringify(this.persistanceData());
            this._dirty = false;
        }
    }, {
        key: 'dirtyStateCheck',
        value: function dirtyStateCheck() {
            var newState = JSON.stringify(this.persistanceData());
            var dirty = newState !== this._currentState;

            if (this._dirty === dirty) {
                return false;
            }

            this._dirty = dirty;
            this.fireEvent('dirtychange', this, dirty);
        }
    }]);

    return Editor;
})();

exports['default'] = Editor;
var editor = new Editor();
exports.editor = editor;

},{"./../constants":1,"./../utilities":10,"./../utilities/factory":9,"./../widgets/Content":11}],3:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constants = require('./constants');

var _utilities = require('./utilities');

var _uiComponentsGrid = require('./ui-components/Grid');

var _uiComponentsGrid2 = _interopRequireDefault(_uiComponentsGrid);

var _uiComponentsRow = require('./ui-components/Row');

var _uiComponentsRow2 = _interopRequireDefault(_uiComponentsRow);

var _uiComponentsColumn = require('./ui-components/Column');

var _uiComponentsColumn2 = _interopRequireDefault(_uiComponentsColumn);

var _uiComponentsBlock = require('./ui-components/Block');

var _uiComponentsBlock2 = _interopRequireDefault(_uiComponentsBlock);

var _utilitiesFactory = require('./utilities/factory');

var _editor = require('./editor');

(function () {

    window._mouseposition = null;

    document.addEventListener('DOMContentLoaded', function () {

        if (!window.Chorizo) {
            window.Chorizo = {};
        }

        // initialize singleton editor
        Chorizo.editor = _editor.editor;
        Chorizo.editor.init();

        // init grids that aren't inherited
        (0, _utilitiesFactory.factory)(_constants.EDITABLE_GRID_SELECTOR, _uiComponentsGrid2['default']);
        (0, _utilitiesFactory.factory)(_constants.ROW_SELECTOR, _uiComponentsRow2['default']);
        (0, _utilitiesFactory.factory)(_constants.ALL_COL_SELECTOR, _uiComponentsColumn2['default']);
        (0, _utilitiesFactory.factory)(_constants.BLOCK_SELECTOR, _uiComponentsBlock2['default']);

        if (Chorizo.editor.hideLayouts) {
            Chorizo.editor.showLayoutHeaders(false);
            Chorizo.editor.resetDirtyState();
        }

        document.addEventListener('click', _utilities.showResizer.bind(this, this));
    });
})();

},{"./constants":1,"./editor":2,"./ui-components/Block":4,"./ui-components/Column":5,"./ui-components/Grid":7,"./ui-components/Row":8,"./utilities":10,"./utilities/factory":9}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./../../constants');

var _utilities = require('./../../utilities');

var Block = (function () {
    function Block(el) {
        _classCallCheck(this, Block);

        this.element = el || (0, _utilities.createDomNode)('div');
        this._type = _constants.BLOCK_TYPES.BLOCK;
        this.widgetData = JSON.parse(this.element.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));
        this.content = this.element.querySelector(_constants.CONTENT_SELECTOR) || (0, _utilities.createDomNode)('div');
        (0, _utilities.attachEvents)(this, {
            mouseover: this.onHover.bind(this),
            mouseleave: this.ondragLeave.bind(this),
            dblclick: this.onDoubleClick.bind(this),
            click: _utilities.showResizer.bind(this, this)
        });

        // to do: use addLayoutHeader instead of custom layout
        // widget impl
        this.addTools();

        if (this.move) {
            (0, _utilities.makeDraggable)(this, this.move, [{ type: _constants.DRAG_EVENTS.dragEnd, func: this.onDragEnd.bind(this) }, { type: _constants.DRAG_EVENTS.dragStart, func: this.onDragStart.bind(this) }, { type: _constants.DRAG_EVENTS.drag, func: this.onDrag.bind(this) }]);
        }
    }

    _createClass(Block, [{
        key: 'onDrag',
        value: function onDrag(e) {
            Chorizo.editor.setDirtyState(true);
            Chorizo.editor.updateDragIconPosition(e);
        }
    }, {
        key: 'onDragStart',
        value: function onDragStart(e) {

            var widgetData = JSON.parse(this.element.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));
            var body = this.element.innerHTML;

            Chorizo.editor.initDragIcon(Chorizo.editor.getWidgetIcon(widgetData.definitionId));

            this.element.id = _constants.WIDGET_COPY_ID;

            e.dataTransfer.setData('text', JSON.stringify({
                id: widgetData.definitionId,
                body: body,
                type: 'content',
                data: widgetData,
                dragMethod: 'widgetDrag'
            }));
        }
    }, {
        key: 'onDragEnd',
        value: function onDragEnd(e) {
            e.preventDefault();
            Chorizo.editor.hideDragIcon();
        }
    }, {
        key: 'ondragLeave',
        value: function ondragLeave() {
            this.element.querySelector(_constants.MZ_CMS_TOOLS_SELECTOR).style.display = 'none';
        }
    }, {
        key: 'onHover',
        value: function onHover() {
            if (Chorizo.editor.hideLayouts) {
                this.element.querySelector(_constants.MZ_CMS_TOOLS_SELECTOR).style.display = 'block';
            }
        }
    }, {
        key: 'doEdit',
        value: function doEdit() {
            var block = this;
            var isContentWidget = block.widgetData.definitionId === 'content';

            Chorizo.editor.setDirtyState(true);

            if (!isContentWidget) {
                Chorizo.editor.fireEvent('widgetedit', {
                    widgetTypeId: this.widgetData.definitionId,
                    type: 'content',
                    element: this.element,
                    data: this.widgetData,
                    callback: function callback(html, cfg) {
                        block.update(html, cfg);
                    }
                });
            } else {
                Chorizo.contentWidget.revealEditor(block);
            }
        }
    }, {
        key: 'update',
        value: function update(html, cfg) {
            this.content.innerHTML = html;
            this.widgetData = cfg;
            this.element.setAttribute(_constants.DATA_WIDGET_ATTRIBUTE, JSON.stringify(cfg));

            if (cfg.config.imageHeight) {
                this.content.style.height = Number(cfg.config.imageHeight) ? cfg.config.imageHeight + 'px' : cfg.config.imageHeight;
            }
        }
    }, {
        key: 'onDoubleClick',
        value: function onDoubleClick() {
            this.doEdit();
        }
    }, {
        key: 'onDrop',
        value: function onDrop(e) {
            e.preventDefault();
        }
    }, {
        key: 'create',
        value: function create(cfg, html) {
            this.element.className = _constants.BLOCK_CLASSNAME;
            this.content.className = _constants.CONTENT_CLASSNAME;
            this.element.appendChild(this.content);
            this.widgetData = cfg;
            this.element.setAttribute(_constants.DATA_WIDGET_ATTRIBUTE, JSON.stringify(cfg));

            if (cfg.config && cfg.config.height) {
                this.content.style.height = cfg.config.height + 'px';
            }

            this.insertWidget(html);

            if (this.move) {
                (0, _utilities.makeDraggable)(this, this.move, [{ type: _constants.DRAG_EVENTS.dragEnd, func: this.onDragEnd.bind(this) }, { type: _constants.DRAG_EVENTS.dragStart, func: this.onDragStart.bind(this) }]);
            }
        }
    }, {
        key: 'addTools',
        value: function addTools() {
            this.toolbar = (0, _utilities.createDomNode)('ul', _constants.MZ_CMS_TOOLS_CLASS, 'chorizo-icon');
            this.del = (0, _utilities.createDomNode)('li', 'trash', 'chorizo-icon');
            this.edit = (0, _utilities.createDomNode)('li', 'pencil', 'chorizo-icon');
            this.move = (0, _utilities.createDomNode)('li', 'drag-handle', 'chorizo-icon');

            this.toolbar.appendChild(this.edit);
            this.toolbar.appendChild(this.move);
            this.toolbar.appendChild(this.del);

            this.element.appendChild(this.toolbar);

            this.addEditEvents();
        }
    }, {
        key: 'addEditEvents',
        value: function addEditEvents() {
            var _this = this;

            [{ el: this.del, ev: this.destroy }, { el: this.edit, ev: this.doEdit }].forEach(function (ob) {
                return ob.el.addEventListener(ob.type || 'click', ob.ev.bind(_this));
            }, this);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            var colParent = this.element.parentNode;
            Chorizo.editor.setDirtyState(true);
            (0, _utilities.remove)(this.element);
            (0, _utilities.addDropHint)(colParent);
        }
    }, {
        key: 'insertWidget',
        value: function insertWidget(html) {
            var shell = (0, _utilities.createDomNode)('div');
            this.content.appendChild(shell);
            shell.outerHTML = html;
            // first child gets around the shell div created from safe insert of outerHTML
            this.content = this.content.firstChild;
        }
    }]);

    return Block;
})();

exports['default'] = Block;
module.exports = exports['default'];

},{"./../../constants":1,"./../../utilities":10}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./../../constants');

var _utilities = require('./../../utilities');

var _util = require('./util');

/*
* COLUMN_CLASSES {array of string}
* column classes to be added to all generated Columns
**/

var COLUMN_CLASSES = ['mz-layout-col', _constants.COL_CLASSNAME, 'mz-editing', _constants.CONTENT_VIEW_CLASSNAME, _constants.MZ_CMS_SHOW_CLASS];

/*
*   COLUMN_HEADER_EVENTS
**/

var COLUMN_HEADER_EVENTS = [{
    type: 'click',
    customEvent: 'destroy',
    func: _util.removeColumn
}];
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

var Column = (function () {
    function Column(el, isEmptyGrid, ignoreDropEvent) {
        _classCallCheck(this, Column);

        this.element = el ? (0, _utilities.applyClasses)(el, COLUMN_CLASSES) : _utilities.createDomNode.apply(undefined, ['div'].concat(COLUMN_CLASSES));

        this._type = _constants.BLOCK_TYPES.COL;
        this.init(isEmptyGrid, ignoreDropEvent);
        this._colmouseposition = null;

        if (Chorizo.editor.areDropzonesHidden) {
            this.element.classList.remove(_constants.MZ_CMS_SHOW_CLASS);
        }

        (0, _utilities.addDropHint)(this.element);
    }

    _createClass(Column, [{
        key: 'init',
        value: function init(isEmptyGrid, ignoreDropEvent) {
            (0, _utilities.addLayoutHeader)(this, _constants.BLOCK_TYPES.COL, COLUMN_HEADER_EVENTS, isEmptyGrid);

            (0, _utilities.attachEvents)(this, {
                dragover: this.dragover.bind(this),
                dragleave: this.dragleave.bind(this),
                mouseover: this.showDragHandle.bind(this),
                mouseout: this.showDragHandle.bind(this)
            });

            if (!ignoreDropEvent) {
                (0, _utilities.attachEvents)(this, {
                    drop: this.drop.bind(this)
                });
            }

            if (this.move) {
                (0, _utilities.setupDraggable)(this);
            }

            if (!isEmptyGrid) {
                (0, _util.addDragHandle)(this, _constants.DRAG_HANDLE_CLASSES);
            }
        }
    }, {
        key: 'doDragWidth',
        value: function doDragWidth(e) {
            if (Chorizo && Chorizo.editor) {
                Chorizo.editor._draggingColumn = e.type === 'mousedown' ? this.element : null;
            }
        }
    }, {
        key: 'drop',
        value: function drop(e) {
            e.stopPropagation();
            e.preventDefault();
            this.dragleave(e);
            Chorizo.editor.hideDragIcon();

            if (!this.isValidDrop(e)) {
                return false;
            }

            Chorizo.editor.setDirtyState(true);

            var widgetData = JSON.parse(e.dataTransfer.getData('text')) || Chorizo.editor.widgetData;

            var afterDropCallback = function afterDropCallback(layout) {
                if (widgetData.hasContent) {
                    (0, _utilities.dropLayoutWithContent)(this, layout);
                } else {
                    (0, _utilities.removeElementWhereDragStarted)();
                }
            };

            var event = 'widgetdrop';
            var eventConfig = {};
            var options = null;

            // // if were dragging a widget, lets ignore the widget editor
            if (widgetData.dragMethod === 'widgetDrag') {

                eventConfig = {
                    widgetTypeId: widgetData.id,
                    type: widgetData.type,
                    ignoreEditor: true,
                    element: this.element,
                    data: JSON.parse(document.querySelector('#mz-widget-copy').getAttribute(_constants.DATA_WIDGET_ATTRIBUTE)),
                    callback: _utilities.afterDrop.bind(this, this, function () {
                        var copy = document.querySelector('#mz-widget-copy');
                        var parentColumn = copy ? copy.parentNode : null;

                        // destory the dragged element relic
                        (0, _utilities.remove)(copy);

                        // add a drop hint
                        // if that was the only widget in the column
                        if (parentColumn) {
                            (0, _utilities.addDropHint)(parentColumn);
                        }
                    })
                };

                options = true;
            }

            // if the layout drop occurs as an addition to a row, ignore the widget editor
            else if (this._colmouseposition && this._colmouseposition.position && !window._mouseposition) {

                    eventConfig = {
                        widgetTypeId: widgetData.id,
                        type: widgetData.type,
                        callback: _utilities.afterDrop.bind(this, this, afterDropCallback),
                        ignoreEditor: widgetData.type !== 'content'
                    };
                } else {
                    eventConfig = {
                        widgetTypeId: widgetData.id,
                        type: widgetData.type,
                        callback: _utilities.afterDrop.bind(this, this, afterDropCallback),
                        ignoreEditor: false
                    };
                }

            Chorizo.editor.fireEvent(event, eventConfig, options);

            Chorizo.editor.hideHintBar();
        }
    }, {
        key: 'dragover',
        value: function dragover(e) {
            (0, _utilities.resetMousePosition)(this);
            this.element.classList[!this.isValidDrop(e) ? 'remove' : 'add'](_constants.DROPOVER_CLASSNAME);

            e.preventDefault();

            var x = e.offsetX;
            var y = e.offsetY;
            var closetWidget = (0, _utilities.closest)(e.target, _constants.BLOCK_CLASSNAME);
            var width = parseInt(window.getComputedStyle(e.target, null).width, 10);
            var height = parseInt(window.getComputedStyle(e.target, null).height, 10);
            var target = e.target;

            // if were dropping widgets, we need to get the width/height of the
            // current widget were hovering over
            if (Chorizo && Chorizo.editor && Chorizo.editor.hideLayouts && closetWidget) {
                width = parseInt(window.getComputedStyle(closetWidget, null).width, 10);
                height = parseInt(window.getComputedStyle(closetWidget, null).height, 10);
                target = closetWidget;
            }

            this._colmouseposition = (0, _util.getHintingData)(Chorizo.editor.hideLayouts, x, y, width, height, this.element, target, e);

            if (!Chorizo.editor.hideLayouts) {
                if (this._colmouseposition.position) {
                    (0, _util.showHintBarMessage)(this, x, y, width, height, e.target, this._colmouseposition.position);
                } else {
                    Chorizo.editor.hideHintBar();
                }
            } else {
                (0, _utilities.showWidgetHintBarMessage)(this, x, y, width, height, e.target, this._colmouseposition.position);
            }
        }
    }, {
        key: 'isValidDrop',
        value: function isValidDrop(e) {

            // if were trying to drag a layoutelement onto a a layout with a widget (YOU CANT DROP -- DONT SHOW HINT)
            if (this.element.querySelector(_constants.BLOCK_SELECTOR) && e.type === _constants.DRAG_EVENTS.dragOver) {
                return false;
            }

            // if this is a drop zone, and you're trying to drop right or left
            if ((window._mouseposition && window._mouseposition.position === _constants.POSITION_DICTIONARY.RIGHT || window._mouseposition && window._mouseposition.position === _constants.POSITION_DICTIONARY.LEFT) && this.element.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
                return false;
            }

            // if you're trying to drop a col into a place where theres already a widget
            if (!window._mouseposition && this._colmouseposition && !this._colmouseposition.position && this.element.querySelector(_constants.BLOCK_SELECTOR)) {
                return false;
            }

            return true;
        }
    }, {
        key: 'dragleave',
        value: function dragleave() {
            Array.from(document.querySelectorAll(_constants.ALL_COL_SELECTOR)).forEach(function (col) {
                return col.classList.remove(_constants.DROPOVER_CLASSNAME);
            });
        }
    }, {
        key: 'onDragStart',
        value: function onDragStart(e) {
            var widgetData = undefined;
            var hasContent = this.element.querySelectorAll(_constants.BLOCK_SELECTOR + ', ' + _constants.ALL_COL_SELECTOR + ', mz-cms-row').length > 0;

            if (this.element.querySelector(_constants.BLOCK_SELECTOR)) {
                widgetData = this.element.querySelector(_constants.BLOCK_SELECTOR).getAttribute(_constants.DATA_WIDGET_ATTRIBUTE);
            }

            Chorizo.editor.initDragIcon('layout');

            this.element.id = _constants.COL_COPY_ID;

            e.dataTransfer.setData('text', JSON.stringify({
                dragMethod: 'layoutDrag',
                id: 'mz-1-col',
                type: 'layout',
                data: widgetData,
                hasContent: hasContent
            }));
        }
    }, {
        key: 'onDragEnd',
        value: function onDragEnd(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, {
        key: 'onDrag',
        value: function onDrag(e) {
            if (!Chorizo || !Chorizo.editor || !Chorizo.editor.updateDragIconPosition) {
                return false;
            }

            Chorizo.editor.updateDragIconPosition(e);
        }
    }, {
        key: 'showDragHandle',
        value: function showDragHandle(e) {
            if (this.handle && this.element.nextElementSibling) {
                this.handle.style.display = e.type === 'mouseover' ? 'block' : 'none';
            }
        }
    }]);

    return Column;
})();

exports['default'] = Column;
module.exports = exports['default'];

},{"./../../constants":1,"./../../utilities":10,"./util":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.removeColumn = removeColumn;
exports.addDragHandle = addDragHandle;
exports.showHintBarMessage = showHintBarMessage;
exports.getHintingData = getHintingData;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _constants = require('./../../constants');

var _utilities = require('./../../utilities');

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

function removeColumn(block) {

    if (Chorizo && Chorizo.editor) {
        Chorizo.editor.setDirtyState(true);
    }

    var containingRow = (0, _utilities.closest)(block.element, 'mz-layout-row');

    (0, _utilities.remove)(block.element);

    // are there any existing columns in the element being deleted
    // not including the hint bar | and not including the row header?
    // if not, we need to readd the drophint son

    var children = Array.from(containingRow.childNodes).some(function (child) {
        return child.classList && !child.classList.contains(_constants.LAYOUT_WIDGET_HEADER_CLASSNAME) && !child.classList.contains('mz-cms-hint-bar');
    });

    // get the column which contains the element
    var parentLayout = containingRow.parentNode ? (0, _utilities.closestByRegex)(containingRow.parentNode, _constants.COL_CLASSNAME) : null;

    // if the element has children DONT add the drop hint
    if (!children) {

        (0, _utilities.remove)(containingRow);

        // if the element has no children, but the parent container DOES have children
        // do not add a drop hint
        if (!parentLayout.querySelector(_constants.ROW_SELECTOR)) {
            (0, _utilities.addDropHint)(parentLayout);
        }
    } else {
        (0, _utilities.rebaseRow)(containingRow);
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

function addDragHandle(block, classes) {

    block.handle = _utilities.createDomNode.apply(undefined, ['div'].concat(_toConsumableArray(classes)));

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

function showHintBarMessage(block, x, y, width, height, element, msg) {
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

function getHintingData(hideLayouts, x, y, width, height, element, hoveredTarget) {
    var position = undefined;
    var targetedBlock = undefined;
    var pos = false;

    // if were in layout mode, hint for that
    if (!hideLayouts) {

        position = x / width;

        if (element.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
            pos = false;
        } else if (position < 0.09) {
            pos = _constants.POSITION_DICTIONARY.LEFT;
        } else if (position > 0.89) {
            pos = _constants.POSITION_DICTIONARY.RIGHT;
        }

        return {
            position: pos,
            element: element,
            type: _constants.BLOCK_TYPES.COL
        };
    }

    // else were hinting on widgets -- top and bottom
    else {
            targetedBlock = (0, _utilities.closest)(hoveredTarget, _constants.BLOCK_CLASSNAME);

            if (targetedBlock) {
                // position = y / parseInt(window.getComputedStyle(targetedBlock, null).height, 10);
                position = (0, _utilities.findPosition)(x, y, width, height);
            } else {
                position = _constants.POSITION_DICTIONARY.TOP;
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

},{"./../../constants":1,"./../../utilities":10}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./../../constants');

var _utilities = require('./../../utilities');

var _Column = require('./../Column');

var _Column2 = _interopRequireDefault(_Column);

var _Row = require('./../Row');

var _Row2 = _interopRequireDefault(_Row);

var Grid = (function () {
    function Grid(el) {
        _classCallCheck(this, Grid);

        this.element = el || (0, _utilities.createDomNode)('div');

        this._type = 'grid';

        this.dropZoneData = JSON.parse(this.element.getAttribute(_constants.DATA_GRID_ATTRIBUTE));
        this.span = this.dropZoneData ? this.dropZoneData.span : null;

        (0, _utilities.attachEvents)(this, {
            dragover: this.dragover.bind(this),
            dragleave: this.dragleave.bind(this)
        });

        this.rebase();
    }

    _createClass(Grid, [{
        key: 'createLayout',
        value: function createLayout(isEmptyGrid) {
            var row = new _Row2['default'](null, isEmptyGrid);
            var column = new _Column2['default'](null, isEmptyGrid);
            row.element.appendChild(column.element);
            this.element.appendChild(row.element);
            (0, _utilities.rebaseRow)(row.element);
        }
    }, {
        key: 'wrapLayout',
        value: function wrapLayout(isEmptyGrid) {
            // if there is existing dropzone content, we need to wrap it with a layout element, and then init the column
            this.element.innerHTML = ['<div class="mz-layout-widget mz-layout-row mz-cms-row mz-editing">', '<div class="mz-layout-col mz-cms-col-12-12 mz-editing" style="width:100%">', this.element.innerHTML, '</div>', '</div>'].join('');

            var wrapper = new _Column2['default'](this.element.querySelector(_constants.GRID_WRAPPER_SELECTOR), isEmptyGrid);

            // adding the class to correct padding -- not to the newly generated wrapper layout
            Array.from(this.element.querySelectorAll(_constants.ROW_SELECTOR)).forEach(function (row) {
                if (!row.parentNode.classList.contains('mz-cms-grid')) {
                    row.classList.add(_constants.CONTENT_VIEW_CLASSNAME);
                }
            });
        }
    }, {
        key: 'rebase',
        value: function rebase() {

            if (!this.element.querySelector(_constants.ROW_SELECTOR)) {

                this.createLayout(true);
            } else {
                this.wrapLayout(true);
            }
        }
    }, {
        key: 'dragover',
        value: function dragover(e) {
            e.preventDefault();
        }
    }, {
        key: 'dragleave',
        value: function dragleave(e) {
            e.preventDefault();
        }
    }]);

    return Grid;
})();

exports['default'] = Grid;
module.exports = exports['default'];

},{"./../../constants":1,"./../../utilities":10,"./../Column":5,"./../Row":8}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./../../constants');

var _utilities = require('./../../utilities');

var ROW_CLASSES = ['mz-layout-widget', 'mz-layout-row', _constants.ROW_CLASSNAME, 'mz-editing'];

exports.ROW_CLASSES = ROW_CLASSES;
var ROW_HEADER_EVENTS = [{
    type: 'click',
    customEvent: 'destroy',
    func: _utilities.removeRow
}, {
    type: 'click',
    customEvent: 'edit',
    func: _utilities.editLayout
}];

exports.ROW_HEADER_EVENTS = ROW_HEADER_EVENTS;

var Row = (function () {
    function Row(el, isEmptyGrid) {
        _classCallCheck(this, Row);

        this.element = el ? (0, _utilities.applyClasses)(el, ROW_CLASSES) : _utilities.createDomNode.apply(undefined, ['div'].concat(ROW_CLASSES));

        this._type = _constants.BLOCK_TYPES.ROW;
        this.title = (0, _utilities.getRowTitle)(this);
        this.init(isEmptyGrid);
    }

    _createClass(Row, [{
        key: 'isValidHint',
        value: function isValidHint() {

            if (window._mouseposition && window._mouseposition.position === _constants.POSITION_DICTIONARY.RIGHT || window._mouseposition && window._mouseposition.position === _constants.POSITION_DICTIONARY.LEFT) {
                if (this.element.parentNode.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
                    return false;
                }
            }
            return true;
        }
    }, {
        key: 'ondragOver',
        value: function ondragOver(e) {

            (0, _utilities.resetMousePosition)(this);
            e.preventDefault();
            e.stopPropagation();

            if (!this.isValidHint()) {
                (0, _utilities.setMouseIndicator)(e, false);
            }
            // if you're hovering over a row, and not a droppable column
            if (!Chorizo.editor.hideLayouts && e.target.classList.contains('mz-layout-row')) {
                var x = e.offsetX;
                var y = e.offsetY;
                var width = parseInt(window.getComputedStyle(e.target, null).width, 10);
                var height = parseInt(window.getComputedStyle(e.target, null).height, 10);

                (0, _utilities.showRowHintBarMessage)(this, e.target, x, y, width, height, _constants.BLOCK_TYPES.ROW);
            }
        }
    }, {
        key: 'ondragLeave',
        value: function ondragLeave(e) {
            e.preventDefault();
            window._mouseposition = null;
            Chorizo.editor.hideHintBar();
        }
    }, {
        key: 'drop',
        value: function drop() {}
    }, {
        key: 'init',
        value: function init(isEmptyGrid) {

            // if the row isnt the inherited row for the dropzone
            if (!this.element.parentNode || !this.element.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
                // see README for isEmptyGrid
                if (!isEmptyGrid) {
                    (0, _utilities.addLayoutHeader)(this, _constants.BLOCK_TYPES.ROW, ROW_HEADER_EVENTS, isEmptyGrid);
                    (0, _utilities.updateRowTitle)(this, { title: this.title });
                }
            }

            (0, _utilities.attachEvents)(this, {
                dragover: this.ondragOver.bind(this),
                dragleave: this.ondragLeave.bind(this),
                drop: this.drop.bind(this)
            });
        }
    }]);

    return Row;
})();

exports['default'] = Row;

},{"./../../constants":1,"./../../utilities":10}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.factory = factory;
exports.isInEditableDropzone = isInEditableDropzone;

function factory(selector, className) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (element) {
        if (!isInEditableDropzone(element)) {
            return false;
        }

        // don't init columns if their direcent children of dropzones
        if (element.parentNode && element.parentNode.parentNode && !element.parentNode.parentNode.classList.contains('mz-cms-grid')) {
            /* eslint-disable no-unused-vars */
            var el = new className(element);
        }
    }, this);
}

function isInEditableDropzone(element) {
    var parent = element;

    while (parent && parent !== document.body) {
        if (parent && parent.classList && parent.classList.contains('mz-drop-zone')) {
            // if our dropzone has meta data, we know it's editable
            if (parent.getAttribute('data-drop-zone')) {
                return true;
            }
        }
        parent = parent.parentNode;
    }

    return false;
}

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.remove = remove;
exports.getSpanClass = getSpanClass;
exports.rebaseRow = rebaseRow;
exports.closestByRegex = closestByRegex;
exports.closest = closest;
exports.removeRow = removeRow;
exports.createDomNode = createDomNode;
exports.applyClasses = applyClasses;
exports.addLayoutHeaderTools = addLayoutHeaderTools;
exports.addLayoutHeader = addLayoutHeader;
exports.makeDraggable = makeDraggable;
exports.attachEvents = attachEvents;
exports.getGridSpan = getGridSpan;
exports.addDropHint = addDropHint;
exports.classMaker = classMaker;
exports.updateColSpanCls = updateColSpanCls;
exports.resetMousePosition = resetMousePosition;
exports.setupDraggable = setupDraggable;
exports.showRowHintBarMessage = showRowHintBarMessage;
exports.setMousePosition = setMousePosition;
exports.showWidgetHintBarMessage = showWidgetHintBarMessage;
exports.findPosition = findPosition;
exports.doColumnInsert = doColumnInsert;
exports.containsInteriorRow = containsInteriorRow;
exports.insertLayoutElement = insertLayoutElement;
exports.getLayout = getLayout;
exports.afterDrop = afterDrop;
exports.removeDropHint = removeDropHint;
exports.updateColClasses = updateColClasses;
exports.getChildrenColumns = getChildrenColumns;
exports.setMouseIndicator = setMouseIndicator;
exports.createFromDrop = createFromDrop;
exports.getConvertedWidth = getConvertedWidth;
exports.updateRowTitle = updateRowTitle;
exports.removeElementWhereDragStarted = removeElementWhereDragStarted;
exports.getRowTitle = getRowTitle;
exports.dropWidgetWithLayout = dropWidgetWithLayout;
exports.insertColWithWidget = insertColWithWidget;
exports.insertWidgetElement = insertWidgetElement;
exports.editLayout = editLayout;
exports.updateColClassAfterResize = updateColClassAfterResize;
exports.dropLayoutWithContent = dropLayoutWithContent;
exports.reinitializeContent = reinitializeContent;
exports.showResizer = showResizer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constants = require('./../constants');

var _uiComponentsColumn = require('./../ui-components/Column');

var _uiComponentsColumn2 = _interopRequireDefault(_uiComponentsColumn);

var _uiComponentsRow = require('./../ui-components/Row');

var _uiComponentsRow2 = _interopRequireDefault(_uiComponentsRow);

var _uiComponentsBlock = require('./../ui-components/Block');

var _uiComponentsBlock2 = _interopRequireDefault(_uiComponentsBlock);

var _widgetsContent = require('./../widgets/Content');

// ugh to fix ie11 issue; delete when browsers support Array.from
Array.from = function () {
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

function remove(DOMnode) {
    if (DOMnode.remove) {
        DOMnode.remove();
    } else {
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

function getSpanClass(gridSpan, ans, rem) {
    var width = ans + (rem-- > 0 ? 1 : 0);
    var cls = classMaker(width, gridSpan);
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

function rebaseRow(containingRow) {
    var cols = Array.from(containingRow.querySelectorAll(_constants.ALL_COL_SELECTOR)).filter(function (col) {
        return col.parentNode.isSameNode(containingRow);
    });

    var grid = closest(containingRow, _constants.GRID_CLASSNAME);
    var gridSpan = getGridSpan(grid);

    var ans = Math.floor(gridSpan / cols.length);
    var rem = gridSpan % cols.length;

    cols.forEach(function (col) {
        var cls = getSpanClass(gridSpan, ans, rem);
        col.style.width = 1 / cols.length * 100 + '%';

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

function closestByRegex(el, cls) {

    while (el !== document.body) {
        if (el.classList.toString().match(cls)) {
            return el;
        } else {
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

function closest(el, cls) {

    while (el !== document.body) {
        if (el.classList.contains(cls)) {
            return el;
        } else {
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

function removeRow(block) {

    if (Chorizo && Chorizo.editor) {
        Chorizo.editor.setDirtyState(true);
    }

    var row = block.element || block;

    var parentLayout = closestByRegex(row.parentNode, _constants.COL_CLASSNAME);

    remove(row);

    if (Array.from(parentLayout.childNodes).filter(function (child) {
        return child.classList && !child.classList.contains('mz-layout-widget-col-header');
    })) {

        if (!parentLayout.querySelector(_constants.ROW_SELECTOR)) {
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

function createDomNode(type) {
    var dom = document.createElement(type);

    for (var _len = arguments.length, classes = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        classes[_key - 1] = arguments[_key];
    }

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

function applyClasses(domNode, classes) {

    if (Array.isArray(classes)) {
        classes.forEach(function (cls) {
            return domNode.classList.add(cls);
        });
    } else {
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

function addLayoutHeaderTools(block, headerEvents, blockType) {
    var _this = this;

    block.toolbar = createDomNode('ul', 'mz-cms-tools');
    block.del = createDomNode('li', 'trash');
    block.edit = createDomNode('li', 'pencil');
    block.move = createDomNode('li', 'drag-handle');

    // COLS dont have move attribute
    if (blockType !== _constants.BLOCK_TYPES.COL) {
        block.toolbar.appendChild(block.edit);
    }

    // ROWS dont have move attribute
    if (blockType !== _constants.BLOCK_TYPES.ROW) {
        block.toolbar.appendChild(block.move);
    }

    block.toolbar.appendChild(block.del);

    if (!block.header) {
        console.warn('Layout Block has not been initiated with a header');
        return false;
    }

    block.header.appendChild(block.toolbar);

    if (Array.isArray(headerEvents)) {
        headerEvents.forEach(function (eventObject) {

            if (eventObject.customEvent === 'destroy') {
                block.del.addEventListener(eventObject.type || 'click', eventObject.func.bind(_this, block));
            }

            if (eventObject.customEvent === 'edit') {
                block.edit.addEventListener(eventObject.type || 'click', eventObject.func.bind(_this, block));
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

function addLayoutHeader(block, blockType, events, isEmptyGrid) {
    var child = block.element.firstChild;
    var header = createDomNode('div', _constants.LAYOUT_WIDGET_HEADER_CLASSNAME, _constants.BLOCK_TYPES[blockType].toLowerCase());

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

function makeDraggable(block, trigger, dragEvents) {
    trigger.setAttribute('draggable', 'true');

    dragEvents.forEach(function (ev) {
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

function attachEvents(block, events) {
    Object.keys(events).forEach(function (k) {
        return block.element.addEventListener(k, events[k]);
    }, block);
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

function getGridSpan(grid) {
    var gridSpan = grid && grid.getAttribute(_constants.DATA_GRID_ATTRIBUTE) ? JSON.parse(grid.getAttribute(_constants.DATA_GRID_ATTRIBUTE)).span : _constants.DEFAULT_GRID_SPAN;

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

function addDropHint(element) {
    var content = createDomNode('div', _constants.DROP_HINT_CLASSNAME);
    var text = createDomNode('span');
    text.innerHTML = _constants.DROP_HINT_TEXT;
    content.appendChild(text);

    if (!element.querySelector(_constants.BLOCK_SELECTOR + ', ' + _constants.ROW_SELECTOR + ', ' + _constants.ALL_COL_SELECTOR)) {
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

function classMaker(span, gridSpan) {

    if (!span || !gridSpan) {
        return _constants.COL_CLASSNAME;
    }

    return '' + _constants.COL_CLASSNAME + span + '-' + gridSpan;
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

function updateColSpanCls(col, newCls) {

    Array.from(col.classList).forEach(function (colClass) {

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

function resetMousePosition(block) {
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

function setupDraggable(block) {
    if (!block.move) {
        console.warn('Block has no `move` component');
        return false;
    }

    makeDraggable(block, block.move, [{ type: _constants.DRAG_EVENTS.dragEnd, func: block.onDragEnd.bind(block) }, { type: _constants.DRAG_EVENTS.dragStart, func: block.onDragStart.bind(block) }, { type: _constants.DRAG_EVENTS.drag, func: block.onDrag.bind(block) }]);
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

function showRowHintBarMessage(block, element, x, y, width, height, type) {
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

function setMousePosition(x, y, width, height, element, type) {
    var _mouseposition = {
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

function showWidgetHintBarMessage(block, x, y, width, height, element, msg) {
    Chorizo.editor.showWidgetHintBar(closest(element, _constants.BLOCK_CLASSNAME), block.element, x, y, height, msg);
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

function findPosition(x, y, w, h) {
    // element is divided into four triangles
    // using mouseX, mouseY, and width and height, we find which quad
    var quadrants = [[_constants.POSITION_DICTIONARY.LEFT, _constants.POSITION_DICTIONARY.BOTTOM], [_constants.POSITION_DICTIONARY.TOP, _constants.POSITION_DICTIONARY.RIGHT]];

    if (y > h / w * x) {
        quadrants = quadrants[0];
    } else {
        quadrants = quadrants[1];
    }

    return y < -h / w * x + h ? quadrants[0] : quadrants[1];
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

function doColumnInsert(block, positionObject, cb) {
    var _this2 = this;

    var cols = block.layout.element.querySelectorAll('.mz-layout-col');
    var newlyAddedCol = undefined;

    Array.from(cols).forEach(function (col) {

        if (positionObject.position === _constants.POSITION_DICTIONARY.RIGHT) {

            // if the drop element has children, we need to append it to the containing row, and not the column
            if (containsInteriorRow(positionObject.element)) {
                positionObject.element.parentNode.parentNode.insertBefore(col, positionObject.element.parentNode.nextSibling);
                newlyAddedCol = new _uiComponentsColumn2['default'](col);
                rebaseRow(positionObject.element.parentNode.parentNode);
            } else {
                positionObject.element.parentNode.insertBefore(col, positionObject.element.nextSibling);
                newlyAddedCol = new _uiComponentsColumn2['default'](col);
            }
        } else {
            // adding new columns to left

            // if the drop element has children, we need to append it to the containing row, and not the column
            if (containsInteriorRow(positionObject.element)) {
                positionObject.element.parentNode.parentNode.insertBefore(col, positionObject.element.parentNode);
                newlyAddedCol = new _uiComponentsColumn2['default'](col);
                rebaseRow(positionObject.element.parentNode.parentNode);
            } else {
                positionObject.element.parentNode.insertBefore(col, positionObject.element);
                newlyAddedCol = new _uiComponentsColumn2['default'](col);
            }
        }

        if (cb) {
            cb.call(_this2, newlyAddedCol);
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

function containsInteriorRow(element) {
    return element.classList && element.classList.contains(_constants.ROW_CLASSNAME);
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

function insertLayoutElement(block, cfg, cb) {
    var isColInsert = false;
    var newCol = undefined;
    var row = undefined;

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
            } else if (window._mouseposition.position === _constants.POSITION_DICTIONARY.TOP) {
                block.element.insertBefore(block.layout.element, window._mouseposition.element);
            } else if (window._mouseposition.position === _constants.POSITION_DICTIONARY.BOTTOM) {
                window._mouseposition.element.parentNode.insertBefore(block.layout.element, window._mouseposition.element.nextSibling);
            } else if (window._mouseposition.position === _constants.POSITION_DICTIONARY.RIGHT || window._mouseposition.position === _constants.POSITION_DICTIONARY.LEFT) {
                if (block.element.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
                    return false;
                }
                isColInsert = true;
                doColumnInsert(block, window._mouseposition, cb);
            }
        }

    row = new _uiComponentsRow2['default'](block.layout.element);

    updateRowTitle(row, cfg.config);

    Array.from(block.layout.element.querySelectorAll(_constants.ALL_COL_SELECTOR)).forEach(function (col) {
        newCol = new _uiComponentsColumn2['default'](col);
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

function getLayout(el) {
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

function afterDrop(block, cb, html, cfg) {

    if (cfg.type === 'layout') {
        block.layout = new getLayout();
        createFromDrop(block.layout, html);
        insertLayoutElement(block, cfg, cb);
    } else {
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

function removeDropHint(element) {

    var dropHint = element.querySelector(_constants.DROP_HINT_SELECTOR);

    if (dropHint && dropHint.parentNode.isSameNode(element)) {
        remove(element.querySelector(_constants.DROP_HINT_SELECTOR));
    }
}

/*
* update column class names within a row
* @returns {null}
* @param {object} row
* @example
* updateColClasses(row);
**/

function updateColClasses(row) {
    var children = getChildrenColumns(row);
    var grid = closest(row.element, _constants.GRID_CLASSNAME);
    var gridSpan = getGridSpan(grid);

    var ans = Math.floor(gridSpan / children.length);
    var rem = gridSpan % children.length;

    children.forEach(function (col) {
        var cls = getSpanClass(gridSpan, ans, rem);
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

function getChildrenColumns(row) {
    return Array.from(row.element.querySelectorAll(_constants.ALL_COL_SELECTOR)).filter(function (col) {
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

function setMouseIndicator(e) {
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

function createFromDrop(layout, html) {
    var shell = createDomNode('div');
    layout.element.appendChild(shell);
    shell.outerHTML = html;
    // first child gets around the shell div created from safe insert of outerHTML
    layout.element = layout.element.firstChild;
    layout.element.classList.add(_constants.CONTENT_VIEW_CLASSNAME);
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

function getConvertedWidth(column) {
    var width = undefined;
    var str = undefined;
    var nums = undefined;

    if (column.style.width) {
        width = column.style.width;
    } else {
        column.classList.forEach(function (cls) {
            if (cls.indexOf(_constants.COL_CLASSNAME) !== -1) {
                str = cls.substring(_constants.COL_CLASSNAME.length);
                if (str) {
                    nums = str.split('-');
                    width = parseInt(nums[0], 10) / parseInt(nums[1], 10) * 100;
                }
            }
        });
    }

    return width;
}

function updateRowTitle(row, cfg) {

    var title = cfg.title || _constants.ROW_TITLE;
    var titleRow = undefined;

    if (row.element.querySelector('.mozu-row-title')) {
        row.element.querySelector('.mozu-row-title').innerHTML = title;
    } else {
        titleRow = createDomNode('span', 'mozu-row-title');
        titleRow.innerHTML = title;
        row.header.appendChild(titleRow);
    }

    row.element.setAttribute(_constants.DATA_WIDGET_ATTRIBUTE, JSON.stringify({ title: title }));
}

/*
* remove a column if its been dragged
* and rebase the parent row of the column
* @returns {null}
* @example
* const column = new Column();
* removeElementWhereDragStarted(column.element);
**/

function removeElementWhereDragStarted() {
    var copy = document.querySelector(_constants.COL_COPY_SELECTOR);
    if (copy) {
        var parentRow = copy.parentNode;
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

function getRowTitle(row) {
    var jsonData = JSON.parse(row.element.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));

    if (jsonData) {
        return jsonData.title;
    } else {
        return _constants.ROW_TITLE;
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

function dropWidgetWithLayout(block) {
    var isOnlyCol = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var row = new _uiComponentsRow2['default']();
    var column = new _uiComponentsColumn2['default']();
    removeDropHint(column.element);
    column.element.appendChild(block.element);

    if (isOnlyCol) {
        return column;
    } else {
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

function insertColWithWidget(eventedBlock, block, position) {
    var layout = dropWidgetWithLayout(block, true);

    if (position === _constants.POSITION_DICTIONARY.RIGHT) {
        eventedBlock.element.parentNode.insertBefore(layout.element, eventedBlock.element.nextElementSibling);
    } else if (position === _constants.POSITION_DICTIONARY.LEFT) {
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

function insertWidgetElement(eventedBlock, cb, html, cfg) {

    removeDropHint(eventedBlock.element);
    var row = new _uiComponentsRow2['default']();
    var block = new _uiComponentsBlock2['default']();
    var layout = undefined;

    block.create(cfg, html);

    // if we drop a widget into a dropzone, lets create a layout element around it
    if (eventedBlock.element.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
        layout = dropWidgetWithLayout(block, false);
        eventedBlock.element.appendChild(layout.element);
        Chorizo.editor.showLayoutHeaders(false);
        updateColClasses(layout);
    } else if (eventedBlock._colmouseposition.position === _constants.POSITION_DICTIONARY.BOTTOM) {
        if (!eventedBlock.element.querySelector(_constants.BLOCK_SELECTOR)) {
            eventedBlock.element.appendChild(block.element);
        } else {
            eventedBlock._colmouseposition.element.parentNode.insertBefore(block.element, eventedBlock._colmouseposition.element.nextSibling);
        }
    } else if (eventedBlock._colmouseposition.position === _constants.POSITION_DICTIONARY.TOP) {
        eventedBlock.element.insertBefore(block.element, eventedBlock._colmouseposition.element);
    } else if (eventedBlock._colmouseposition.position === _constants.POSITION_DICTIONARY.LEFT || eventedBlock._colmouseposition.position === _constants.POSITION_DICTIONARY.RIGHT) {
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

function editLayout(row) {

    var config = {};
    var layoutJSON = JSON.parse(row.element.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));
    var counter = 1;

    Array.from(row.element.querySelectorAll(_constants.ALL_COL_SELECTOR)).forEach(function (col) {

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
        layoutCallback: function layoutCallback(cfg) {
            var widths = Object.keys(cfg.config);
            var colIndex = 0;
            updateRowTitle(row, cfg.config);

            widths.splice(widths.indexOf('title'), 1);

            Array.from(row.element.querySelectorAll(_constants.ALL_COL_SELECTOR)).forEach(function (col) {
                var width = cfg.config[widths[colIndex]];
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

function updateColClassAfterResize(containingRow, col, width) {
    var grid = closest(containingRow, _constants.GRID_CLASSNAME);
    var gridSpan = getGridSpan(grid);
    var newSpan = Math.round(width / 100 * gridSpan);
    var cls = classMaker(newSpan, gridSpan);

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

function dropLayoutWithContent(block, layout) {

    var previousHTML = document.querySelector(_constants.COL_COPY_SELECTOR) ? document.querySelector(_constants.COL_COPY_SELECTOR).cloneNode(true) : null;

    if (previousHTML) {
        removeDropHint(layout.element);

        Array.from(previousHTML.querySelectorAll('.mz-cms-tools, .mz-layout-widget-header')).forEach(function (toolset) {
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

function reinitializeContent(layout) {
    var rows = layout.element.querySelectorAll(_constants.ROW_SELECTOR);
    var cols = layout.element.querySelectorAll(_constants.ALL_COL_SELECTOR);
    var blocks = layout.element.querySelectorAll(_constants.BLOCK_SELECTOR);
    var nodeList = Array.prototype.slice.call(rows).concat(Array.prototype.slice.call(cols)).concat(Array.prototype.slice.call(blocks));

    /* eslint-disable no-unused-vars */
    // reinit the layouts edit events becuase theyve been destroyed
    var regeneratedLayout = new _uiComponentsColumn2['default'](layout.element, false, true);

    nodeList.forEach(function (el) {

        var constructor = undefined;
        var temp = undefined;

        if (el.classList.contains(_constants.ROW_CLASSNAME)) {
            constructor = _uiComponentsRow2['default'];
        } else if (el.classList.contains(_constants.BLOCK_CLASSNAME)) {
            constructor = _uiComponentsBlock2['default'];
        } else {
            constructor = _uiComponentsColumn2['default'];
        }

        temp = new constructor(el);

        if (temp instanceof _uiComponentsColumn2['default']) {
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

function showResizer(block, e) {
    e.stopPropagation();

    Array.from(document.querySelectorAll(_constants.ALL_COL_SELECTOR + ', ' + _constants.BLOCK_SELECTOR)).forEach(function (col) {
        col.classList.remove('mz-cms-state-selected');
    });

    if (this._type === _constants.BLOCK_TYPES.BLOCK && Chorizo.editor.hideLayouts && this.widgetData && this.widgetData.config.heightResizable) {
        this.resizer = Chorizo.editor.getResizer();
        this.element.classList.add('mz-cms-state-selected');
        this.element.appendChild(this.resizer);
    }

    // showing content editor on single click
    if (this.widgetData && this.widgetData.definitionId && this.widgetData.definitionId === 'content' && !e.target.classList.contains('trash')) {

        _widgetsContent.contentWidget.revealEditor(this);
    }
}

},{"./../constants":1,"./../ui-components/Block":4,"./../ui-components/Column":5,"./../ui-components/Row":8,"./../widgets/Content":11}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./../constants');

var ContentWidget = (function () {
    function ContentWidget() {
        _classCallCheck(this, ContentWidget);

        this.stylesDropdown = [{
            label: 'Heading 1',
            tagName: 'h1'
        }, {
            label: 'Heading 2',
            tagName: 'h2'
        }, {
            label: 'Normal',
            tagName: 'p'
        }, {
            label: 'Special',
            tagName: 'div',
            className: 'special'
        }];

        document.addEventListener('click', (function (event) {

            if (this.shouldDismissEditor(event.target, event)) {
                return false;
            }

            if (this.formatter) {
                this.hideEditor();
                Chorizo.editor.updateAllContentWidgets();
            }
        }).bind(this));
    }

    _createClass(ContentWidget, [{
        key: 'updateWidget',
        value: function updateWidget() {
            var newWidgetData = this.currentBlock.element.querySelector(_constants.CONTENT_SELECTOR).innerHTML;
            var existingData = JSON.parse(this.currentBlock.element.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));

            existingData.config.body = newWidgetData;

            this.currentBlock.element.setAttribute(_constants.DATA_WIDGET_ATTRIBUTE, JSON.stringify(existingData));
        }
    }, {
        key: 'hideEditor',
        value: function hideEditor() {
            this.toggleDropdown(true);
            this.hideUrlTooltip();
            if (this.formatter) {
                this.formatter.style.top = '-84px';
            }
            this.toggleEditable();
        }
    }, {
        key: 'shouldDismissEditor',
        value: function shouldDismissEditor(target, event) {

            if (this.contains(target, _constants.CONTENT_WIDGET_FORMAT_BAR)) {
                return true;
            } else if (this.contains(target, _constants.URL_TOOLTIP_CLASS)) {
                return true;
            }
        }
    }, {
        key: 'contains',
        value: function contains(el, cls) {
            while (el !== document.body && el && el.classList) {
                if (el.classList.contains(cls)) {
                    return el;
                } else {
                    el = el.parentNode;
                }
            }
        }
    }, {
        key: 'getUrlTooltip',
        value: function getUrlTooltip() {
            var urlTooltip = document.createElement('div');

            urlTooltip.classList.add(_constants.URL_TOOLTIP_CLASS);

            urlTooltip.innerHTML = '<input type="text" placeholder="http://">';

            urlTooltip.addEventListener('change', this.onUrlUpdate.bind(this));

            urlTooltip.addEventListener('keydown', (function (e) {
                if (e.which === 13 && e.target.value !== '') {
                    this.onUrlUpdate(e);
                    this.hideUrlTooltip();
                }
            }).bind(this));

            document.body.appendChild(urlTooltip);

            return urlTooltip;
        }
    }, {
        key: 'onUrlUpdate',
        value: function onUrlUpdate(e) {

            var url = this.urlTooltip.querySelector('input').value;
            var linkElement = this.currentLink.startContainer.querySelector('a');

            linkElement.setAttribute('href', url);

            this.updateWidget();

            e.target.value = '';
        }
    }, {
        key: 'revealEditor',
        value: function revealEditor(block) {
            var _this = this;

            this.toggleAllContentWidgets();

            this.formatter = this.formatter || this.getFormatter();

            this.urlTooltip = this.urlTooltip || this.getUrlTooltip();

            this.formatter.classList.add(_constants.CONTENT_WIDGET_FORMAT_BAR);

            this.currentBlock = block;

            this.toggleEditable(true);

            setTimeout(function () {
                _this.formatter.style.top = '0px';
            }, 30);
        }
    }, {
        key: 'toggleAllContentWidgets',
        value: function toggleAllContentWidgets() {
            Array.from(document.querySelectorAll(_constants.CONTENT_SELECTOR)).forEach(function (widget) {

                widget.contentEditable = false;
                widget.parentNode.classList.remove(_constants.EDITING_STATE_CLASS);
            });
        }
    }, {
        key: 'toggleEditable',
        value: function toggleEditable(on) {

            if (!this.currentBlock) {
                return false;
            }

            var content = this.currentBlock.element.querySelector(_constants.CONTENT_SELECTOR);
            var block = this.currentBlock.element;

            if (!block || !content) {
                console.warn('An error occurred');
                return false;
            }

            if (on) {
                content.contentEditable = true;
                block.classList.add(_constants.EDITING_STATE_CLASS);
            } else {
                content.contentEditable = false;
                block.classList.remove(_constants.EDITING_STATE_CLASS);
            }
        }
    }, {
        key: 'toggleDropdown',
        value: function toggleDropdown(dismiss) {
            if (this.dropDownMenuMount) {
                this.dropDownMenuMount.style.display = this.dropDownMenuMount.style.display === 'block' || dismiss === true ? 'none' : 'block';
            }
        }
    }, {
        key: 'addStyleDropdown',
        value: function addStyleDropdown(formatterComponent) {
            var _this2 = this;

            this.dropDownMenuMount = formatterComponent.querySelector(_constants.CONTENT_WIDGET_STYLE_DROPDOWN_SELECTOR);

            var dropDownMenu = this.dropDownMenuMount.parentNode;

            dropDownMenu.addEventListener('click', this.toggleDropdown.bind(this));

            this.stylesDropdown.forEach(function (style) {

                var li = document.createElement('li');

                li.innerHTML = style.label;

                li.setAttribute(_constants.CONTENT_WIDGET_STYLE_ATTRIBUTE, JSON.stringify(style));

                li.setAttribute(_constants.CONTENT_WIDGET_ROLE_ATTRIBUTE, 'style');

                _this2.dropDownMenuMount.appendChild(li);
            }, this);
        }
    }, {
        key: 'doCustomStyle',
        value: function doCustomStyle(item) {
            var style = JSON.parse(item.getAttribute(_constants.CONTENT_WIDGET_STYLE_ATTRIBUTE));

            document.execCommand('formatBlock', false, style.tagName);
        }
    }, {
        key: 'handleStyleEvent',
        value: function handleStyleEvent(e) {

            e.preventDefault();
            e.stopImmediatePropagation();

            var item = e.target;
            var role = item.getAttribute(_constants.CONTENT_WIDGET_ROLE_ATTRIBUTE) ? item.getAttribute(_constants.CONTENT_WIDGET_ROLE_ATTRIBUTE) : item.parentElement.getAttribute(_constants.CONTENT_WIDGET_ROLE_ATTRIBUTE);

            switch (role) {

                case 'style':
                    this.doCustomStyle(item);
                    break;
                case 'createLink':
                    this.createLink();
                default:
                    document.execCommand(role, false, null);
                    break;
            }
        }
    }, {
        key: 'createLink',
        value: function createLink() {
            document.execCommand('createLink', false, _constants.TEMP_LINK_ID);

            this.showUrlTooltip();
        }
    }, {
        key: 'showUrlTooltip',
        value: function showUrlTooltip() {
            var element = document.querySelector('[href="' + _constants.TEMP_LINK_ID + '"]');
            var position = element.getBoundingClientRect();

            this.urlTooltip.style.left = '40%';
            this.urlTooltip.style.top = position.top + 30 + 'px';

            this.urlTooltip.style.display = 'block';

            this.currentLink = this.saveSelection()[0];
        }
    }, {
        key: 'saveSelection',
        value: function saveSelection() {
            if (window.getSelection) {
                var sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    var ranges = [];
                    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                        ranges.push(sel.getRangeAt(i));
                    }
                    return ranges;
                }
            } else if (document.selection && document.selection.createRange) {
                return document.selection.createRange();
            }
            return null;
        }
    }, {
        key: 'hideUrlTooltip',
        value: function hideUrlTooltip() {
            if (this.urlTooltip) {
                this.urlTooltip.style.display = 'none';
            }
        }
    }, {
        key: 'getFormatter',
        value: function getFormatter() {

            var iconClass = {
                bold: 'fa fa-bold',
                italic: 'fa fa-italic',
                underline: 'fa fa-underline',
                link: 'fa fa-link',
                unlink: 'fa fa-unlink',
                alignLeft: 'fa fa-align-left',
                alignRight: 'fa fa-align-right',
                alignCenter: 'fa fa-align-center',
                unorderedList: 'fa fa-list-ul',
                orderedList: 'fa fa-list-ol',
                indent: 'fa fa-indent',
                outdent: 'fa fa-outdent'
            };

            var formatterInnerHTML = ['<ul>', '<li ', _constants.CONTENT_WIDGET_STYLE_DROPDOWN_ATTRIBUTE, ' class="mz-cms-styles"', '<span>Styles</span>', '<i class="fa fa-caret-down"></i>', '<ul></ul>', '</li>', '<li data-role="bold"><i class="', iconClass.bold, '"></i></li>', '<li data-role="italic"><i class="', iconClass.italic, '"></i></li>', '<li data-role="underline"><i class="', iconClass.underline, '"></i></li>', '<li data-role="createLink"><i class="', iconClass.link, '"></i></li>', '<li data-role="unlink"><i class="', iconClass.unlink, '"></i></li>', '<li data-role="justifyLeft"><i class="', iconClass.alignLeft, '"></i></li>', '<li data-role="justifyCenter"><i class="', iconClass.alignCenter, '"></i></li>', '<li data-role="justifyRight"><i class="', iconClass.alignRight, '"></i></li>', '<li data-role="insertUnorderedList"><i class="', iconClass.unorderedList, '"></i></li>', '<li data-role="insertOrderedList"><i class="', iconClass.orderedList, '"></i></li>', '<li data-role="indent"><i class="', iconClass.indent, '"></i></li>', '<li data-role="outdent"><i class="', iconClass.outdent, '"></i></li>', '</ul>'].join('');

            var formatterComponent = document.createElement('div');

            formatterComponent.innerHTML = formatterInnerHTML;

            formatterComponent.addEventListener('mousedown', this.handleStyleEvent.bind(this));

            document.body.appendChild(formatterComponent);

            this.addStyleDropdown(formatterComponent);

            return formatterComponent;
        }
    }]);

    return ContentWidget;
})();

exports['default'] = ContentWidget;
var contentWidget = new ContentWidget();
exports.contentWidget = contentWidget;

},{"./../constants":1}]},{},[3]);
