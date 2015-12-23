(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* 
* @Author: ben_cripps
* @Date:   2015-12-05 15:02:05
* @Last Modified by:   ben_cripps
* @Last Modified time: 2015-12-05 20:30:06
*/

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
    WIDGET: 'WIDGET'
};

exports.BLOCK_TYPES = BLOCK_TYPES;
var CMS_EDITING_CLASSNAME = 'mz-cms-editing';

exports.CMS_EDITING_CLASSNAME = CMS_EDITING_CLASSNAME;
var GRID_CLASSNAME = 'mz-drop-zone';

exports.GRID_CLASSNAME = GRID_CLASSNAME;
var GRID_SELECTOR = '.' + GRID_CLASSNAME;

exports.GRID_SELECTOR = GRID_SELECTOR;
var COL_CLASSNAME = 'mz-cms-col-';

exports.COL_CLASSNAME = COL_CLASSNAME;
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

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./constants');

(function (win, doc) {
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
                this.resetDirtyState();
                this.fireEvent('pageload', this);
                this._dirty = false;
            }
        }, {
            key: 'setDirtyState',
            value: function setDirtyState(val) {
                this._dirty = val ? val : false;
            }
        }, {
            key: 'createResizer',
            value: function createResizer() {
                this.resizer = doc.createElement('div');
                this.handle = doc.createElement('div');

                this.resizer.classList.add(_constants.RESIZER_CLASSNAME);
                this.handle.classList.add(_constants.RESIZER_HANDLE_CLASSNAME);

                this.resizer.appendChild(this.handle);

                this.initResizerEvents();

                doc.body.appendChild(this.resizer);
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

                doc.addEventListener('mouseup', (function () {
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

                doc.addEventListener('mousemove', (function (e) {

                    if (this.resizing) {
                        block = this.resizer.parentNode;
                        widgetData = JSON.parse(block.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));
                        newHeight = doc.body.scrollTop + e.clientY - block.offsetTop - 320;

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
                this.hintbar = doc.createElement('div');
                this.hintBarMessage = doc.createElement('div');
                this.hintbar.className = _constants.HINT_BAR_CLASSNAME;
                this.hintBarMessage.className = _constants.HINT_BAR_MESSAGE_CLASSNAME;
                this.hintbar.appendChild(this.hintBarMessage);

                this.hintbarHeight = '3px';
                this.hintbarPadding = 45;

                doc.body.appendChild(this.hintbar);
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
                    this._controller = win.parent.Taco.app.controllers.get('Website');
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
                Array.from(doc.querySelectorAll(_constants.LAYOUT_WIDGET_HEADER_SELECTOR)).forEach(function (el) {
                    el.style.display = bool ? 'block' : 'none';
                });

                Array.from(doc.querySelectorAll('.mz-layout-widget, .mz-cms-col-')).forEach(function (el) {
                    if (bool && Chorizo.helper.isInEditableDropzone(el)) {
                        if (!el.parentNode.classList.contains('mz-cms-grid')) {
                            el.classList.add(_constants.CONTENT_VIEW_CLASSNAME);
                        }
                    } else {
                        el.classList.remove(_constants.CONTENT_VIEW_CLASSNAME);
                    }
                });

                Array.from(doc.querySelectorAll(_constants.BLOCK_SELECTOR)).forEach(function (block) {
                    if (bool && Chorizo.helper.isInEditableDropzone(block)) {
                        block.classList.add(_constants.CONTENT_SCREEN_CLASSNAME);
                    } else {
                        block.classList.remove(_constants.CONTENT_SCREEN_CLASSNAME);
                    }
                });
            }
        }, {
            key: 'showDropZones',
            value: function showDropZones() {
                Array.from(doc.querySelectorAll('.mz-cms-grid, .mz-cms-col-')).forEach(function (grid) {
                    grid.classList.add('mz-cms-show-zone');
                });
            }
        }, {
            key: 'hideDropZones',
            value: function hideDropZones() {
                Array.from(doc.querySelectorAll('.mz-cms-grid, .mz-cms-col-')).forEach(function (grid) {
                    grid.classList.remove('mz-cms-show-zone');
                });
            }
        }, {
            key: 'createDragIcon',
            value: function createDragIcon() {
                this.dragIcon = doc.createElement('div');
                this.dragIcon.className = 'mz-drag-icon';
                doc.body.appendChild(this.dragIcon);
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

                var data = [];

                Array.from(doc.querySelectorAll('.mz-cms-grid')).forEach(function (grid) {

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

    doc.addEventListener('DOMContentLoaded', function () {

        if (!win.Chorizo) {
            win.Chorizo = {};
        }

        Chorizo.editor = new Editor();
        Chorizo.editor.init();
    });
})(window, document);

},{"./constants":1}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (win, doc) {
	var ChorizoContentEditor = (function () {
		function ChorizoContentEditor() {
			_classCallCheck(this, ChorizoContentEditor);
		}

		_createClass(ChorizoContentEditor, [{
			key: 'revealEditor',
			value: function revealEditor(me) {
				var bar,
				    styles = [{
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
				}],
				    counter,
				    contentFormatter = ['<ul>', '<li data-role="styles" class="mz-cms-styles"', '<span>Styles</span>', '<i class="fa fa-caret-down"></i>', '<ul></ul>', '</li>', '<li data-role="bold"><i class="fa fa-bold"></i></li>', '<li data-role="italic"><i class="fa fa-italic"></i></li>', '<li data-role="underline"><i class="fa fa-underline"></i></li>', '<li data-role="createLink"><i class="fa fa-link"></i></li>', '<li data-role="unlink"><i class="fa fa-unlink"></i></li>', '<li data-role="justifyLeft"><i class="fa fa-align-left"></i></li>', '<li data-role="justifyCenter"><i class="fa fa-align-center"></i></li>', '<li data-role="justifyRight"><i class="fa fa-align-right"></i></li>', '<li data-role="insertUnorderedList"><i class="fa fa-list-ul"></i></li>', '<li data-role="insertOrderedList"><i class="fa fa-list-ol"></i></li>', '<li data-role="indent"><i class="fa fa-indent"></i></li>', '<li data-role="outdent"><i class="fa fa-outdent"></i></li>', '</ul>'].join(''),
				    contentEditor = doc.createElement('div'),
				    urlTooltip = doc.createElement('div');

				var addClass = function addClass(element, className) {
					if (element.getAttribute('class')) {
						element.setAttribute('class', element.getAttribute('class') + ' ' + className);
					} else {
						element.setAttribute('class', className);
					}
					return element;
				};

				urlTooltip = addClass(urlTooltip, 'mz-cms-tooltip');
				urlTooltip.innerHTML = '<input type="text" placeholder="http://">';

				var removeClass = function removeClass(element, className) {
					if (element.getAttribute('class')) {
						var newClass = element.getAttribute('class').split(className);
						if (newClass.length > 2) {
							newClass = newClass[0] + newClass[1];
						} else if (newClass.length == 1) {
							newClass = newClass[0];
						}

						element.setAttribute('class', newClass);
					}

					return element;
				};

				var _editingState = function _editingState() {
					me.element.querySelector('.mz-cms-content').contentEditable = true;
					me.element.setAttribute('class', me.element.getAttribute('class') + ' mz-cms-state-editing');
				};

				_editingState();

				contentEditor.setAttribute('class', 'mz-cms-format-bar');
				contentEditor.innerHTML = contentFormatter;

				if (!doc.querySelector('.mz-cms-tooltip')) {
					doc.body.appendChild(urlTooltip);
				}

				if (!doc.querySelector('.mz-cms-format-bar')) {
					doc.body.appendChild(contentEditor);
				} else {
					contentEditor.parentNode.removeChild(contentEditor);
					doc.body.appendChild(contentEditor);
				}

				counter = -1 * (contentEditor.offsetHeight / 2);

				var revealFormatter = setInterval(function () {
					counter += 1;
					contentEditor.style.top = counter.toString() + 'px';
					if (counter == 0) {
						clearInterval(revealFormatter);
					}
				}, 2);

				var customStyle = function customStyle(item) {
					var style = JSON.parse(item.getAttribute('data-style')),
					    element;

					toggleDisplay('[data-role="styles"] ul');
					doc.execCommand('formatBlock', false, style.tagName);
				};

				var _buildStyles = function _buildStyles(styles) {
					styles.forEach(function (style, index) {
						var li = doc.createElement('li');
						li.innerHTML = style.label;
						li.setAttribute('data-style', JSON.stringify(style));
						li.setAttribute('data-role', 'style');
						doc.querySelector('[data-role="styles"] ul').appendChild(li);
					});
				};

				var createLink = function createLink() {
					doc.execCommand('createLink', false, '#mz-cms-temp-link');
					if (doc.getElementsByClassName('mz-cms-tooltip')[0].offsetParent === null) {
						showTooltip();
					}
				};

				var showTooltip = function showTooltip() {
					var posEl = doc.querySelector('[href="#mz-cms-temp-link"]'),
					    left = 0,
					    top = posEl.offsetHeight,
					    coordinates = getOffset(posEl);

					posEl.setAttribute('style', 'display: inline-block;');
					posEl.appendChild(urlTooltip);
					urlTooltip.setAttribute('style', 'display: block; left: ' + posEl.offsetLeft + 'px; top: ' + (posEl.offsetHeight + posEl.offsetTop) + 'px;');

					urlTooltip.onchange = function () {
						this.parentNode.setAttribute('href', this.querySelector('input').value);
						this.querySelector('input').value = '';
						this.parentNode.removeChild(this);
						updateWidget();
					};

					function getOffset(elem) {

						if (elem.parentElement.id !== 'page-wrapper') {
							top += elem.offsetTop;

							if (elem.className != 'mz-layout-col mz-cms-col- mz-editing mz-cms-show-zone' && elem.tagName != 'B' && elem.tagName != 'I' && elem.tagName != 'U') {
								left += elem.offsetLeft;
							}
							getOffset(elem.parentElement);
						}

						return { x: left, y: top };
					}

					function closest(elem, selector) {
						var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;

						while (elem) {
							if (matchesSelector.call(elem, selector)) {
								return elem;
							} else {
								elem = elem.parentElement;
							}
						}
						return false;
					}
				};

				var _toggleStyles = function _toggleStyles() {
					toggleDisplay('[data-role="styles"] ul');
				};

				var toggleDisplay = function toggleDisplay(element) {
					var elementStyle = doc.querySelector(element).style.display;

					if (elementStyle === 'none' || elementStyle === '') {
						doc.querySelector(element).style.display = 'block';
					} else {
						doc.querySelector(element).style.display = 'none';
					}
				};

				var range = function range(cfg) {
					var range, selection;

					if (!cfg) {
						selection = win.getSelection();

						range = selection.getRangeAt(0);

						return {
							container: range.commonAncestorContainer,
							endContainer: range.endContainer,
							endOffset: range.endOffset,
							startContainer: range.startContainer,
							startOffset: range.startOffset
						};
					}

					range = doc.createRange();

					range.selectNodeContents(cfg.container);
					range.setEnd(cfg.endContainer, cfg.endOffset);
					range.setStart(cfg.startContainer, cfg.startOffset);

					selection = win.getSelection();
					selection.removeAllRangers();
					selection.addRange(range);
				};

				_buildStyles(styles);

				var updateWidget = function updateWidget() {
					var urlBox = me.element.querySelector('.mz-cms-tooltip');
					if (urlBox !== null) {
						urlBox.parentNode.removeChild(urlBox);
					}

					var newData = me.element.querySelector('.mz-cms-content').innerHTML;
					var oldData = JSON.parse(me.element.getAttribute('data-widget'));
					oldData.config.body = newData;
					me.element.setAttribute('data-widget', JSON.stringify(oldData));
				};

				contentEditor.onmousedown = function (e) {
					e.preventDefault();
					e.stopImmediatePropagation();
					var item = e.target,
					    role;

					if (!item.hasAttribute('data-role')) {
						role = item.parentElement.getAttribute('data-role');
					} else {
						role = item.getAttribute('data-role');
					}

					switch (role) {
						case 'createLink':
							createLink();
							break;
						case 'style':
							customStyle(item);
							break;
						case 'styles':
							_toggleStyles();
							break;
						default:
							doc.execCommand(role, false, null);
							break;
					}
				};

				doc.querySelector('.mz-cms-content').onclick = function (event) {
					if (event.target.tagName == 'A') {
						urlTooltip.setAttribute('style', 'display: block; left: ' + event.target.offsetLeft + 'px; top: ' + (event.target.offsetHeight + event.target.offsetTop) + 'px;');
						if (event.target.getAttribute('href') != '#mz-cms-temp-link') {
							urlTooltip.querySelector('input').value = event.target.getAttribute('href');
						} else {
							urlTooltip.querySelector('input').value = '';
						}
						event.target.appendChild(urlTooltip);
					} else if (event.target.parentNode.className != 'mz-cms-tooltip') {
						urlTooltip.style.display = 'none';
						urlTooltip.querySelector('input').value = '';
						urlTooltip.parentNode.removeChild(urlTooltip);
					}
				};

				doc.onclick = function (event) {
					if (event.target.parentElement.tagName != 'LI' && event.target.parentElement.tagName != 'UL' && event.target.parentElement.tagName != 'A' && event.target.parentElement.tagName != 'I') {
						updateWidget();
						this.querySelector('.mz-cms-content').contentEditable = false;
						me.element = removeClass(me.element, 'mz-cms-state-editing');
						contentEditor.style.top = (-1 * contentEditor.offsetHeight).toString() + 'px';

						if (doc.querySelector('.mz-cms-format-bar')) {
							if (contentEditor.parentNode) {
								contentEditor.parentNode.removeChild(contentEditor);
							}
						}
					}
				};
			}
		}]);

		return ChorizoContentEditor;
	})();

	doc.addEventListener('DOMContentLoaded', function () {
		if (!win.Chorizo) {
			win.Chorizo = {};
		}

		Chorizo.contentEditor = new ChorizoContentEditor();
	});
})(window, document);

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (win, doc) {
    var ChorizoHelper = (function () {
        function ChorizoHelper() {
            _classCallCheck(this, ChorizoHelper);
        }

        _createClass(ChorizoHelper, [{
            key: 'init',
            value: function init(chorizoClass) {
                doc.addEventListener('DOMContentLoaded', function () {
                    var className = String(chorizoClass).toLowerCase();
                    if (!win.Chorizo) {
                        win.Chorizo = {};
                    }

                    Chorizo[className] = new chorizoClass();
                    Chorizo[className].init();
                });
            }
        }, {
            key: 'factory',
            value: function factory(selector, className) {
                Array.prototype.forEach.call(document.querySelectorAll(selector), function (element) {
                    if (!this.isInEditableDropzone(element)) {
                        return false;
                    }

                    // don't init columns if their direcent children of dropzones
                    if (element.parentNode && element.parentNode.parentNode && !element.parentNode.parentNode.classList.contains('mz-cms-grid')) {
                        var el = new className(element);
                    }
                }, this);
            }
        }, {
            key: 'isInEditableDropzone',
            value: function isInEditableDropzone(element) {

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
        }]);

        return ChorizoHelper;
    })();

    doc.addEventListener('DOMContentLoaded', function () {
        if (!win.Chorizo) {
            win.Chorizo = {};
        }

        Chorizo.helper = new ChorizoHelper();
    });
})(window, document);

},{}],5:[function(require,module,exports){
'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./constants');

// ugh to fix ie11 issue; delete when browsers support Array.from
Array.from = function () {
    return Array.prototype.slice.call(arguments[0]);
};

(function (win, doc) {

    var _mouseposition = null;
    var DRAG_EVENTS = undefined;

    var Target = (function () {
        function Target(el) {
            _classCallCheck(this, Target);

            this.element = el;
        }

        _createClass(Target, [{
            key: 'attachEvents',
            value: function attachEvents(events) {
                var _this = this;

                Object.keys(events).forEach(function (k) {
                    return _this.element.addEventListener(k, events[k]);
                }, this);
            }
        }, {
            key: 'get',
            value: function get(cls, all) {
                return all ? this.element.querySelectorAll(cls) : this.element.querySelector(cls);
            }
        }, {
            key: 'createLayout',
            value: function createLayout(isEmptyGrid) {
                this.layout = new Layout();
                this.layout.create(isEmptyGrid);
                this.element.appendChild(this.layout.element);
            }
        }, {
            key: 'dragleave',
            value: function dragleave(e) {
                e.preventDefault();
            }
        }, {
            key: 'dragover',
            value: function dragover(e) {
                e.preventDefault();
            }
        }, {
            key: 'closest',
            value: function closest(el, cls) {
                while (el !== doc.body) {
                    if (el.classList.contains(cls)) {
                        return el;
                    } else {
                        el = el.parentNode;
                    }
                }
            }
        }, {
            key: 'findPosition',
            value: function findPosition(x, y, w, h) {
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
        }, {
            key: 'setMousePosition',
            value: function setMousePosition(x, y, w, h, el) {
                _mouseposition = {
                    position: this.findPosition(x, y, w, h),
                    element: el,
                    type: _constants.BLOCK_TYPES.ROW
                };
            }
        }, {
            key: 'wrapLayout',
            value: function wrapLayout(isEmptyGrid) {
                // if there is existing dropzone content, we need to wrap it with a layout element, and then init the column
                this.element.innerHTML = ['<div class="mz-layout-widget mz-layout-row mz-cms-row mz-editing">', '<div class="mz-layout-col mz-cms-col- mz-editing" style="width:100%">', this.element.innerHTML, '</div>', '</div>'].join('');
                var wrapper = new Col(this.element.querySelector(_constants.COL_SELECTOR), isEmptyGrid);

                // adding the class to correct padding -- not to the newly generated wrapper layout
                Array.from(this.element.querySelectorAll(_constants.ROW_SELECTOR)).forEach(function (row) {
                    if (!row.parentNode.classList.contains('mz-cms-grid')) {
                        row.classList.add(_constants.CONTENT_VIEW_CLASSNAME);
                    }
                });
            }
        }, {
            key: 'createFromDrop',
            value: function createFromDrop(html) {
                var shell = doc.createElement('div');
                this.element.appendChild(shell);
                shell.outerHTML = html;
                // first child gets around the shell div created from safe insert of outerHTML
                this.element = this.element.firstChild;
                this.element.classList.add(_constants.CONTENT_VIEW_CLASSNAME);
            }
        }, {
            key: 'makeDraggable',
            value: function makeDraggable(el, events) {

                el.setAttribute('draggable', 'true');

                events.forEach(function (ev) {
                    el.addEventListener(ev.type, ev.func.bind(this));
                });
            }
        }, {
            key: 'setMouseIndicator',
            value: function setMouseIndicator(e) {
                e.dataTransfer.dropEffect = 'none';
                return false;
            }
        }, {
            key: 'showResizer',
            value: function showResizer(e) {
                e.stopPropagation();

                Array.from(doc.querySelectorAll(_constants.ALL_COL_SELECTOR + ', ' + _constants.BLOCK_SELECTOR)).forEach(function (col) {
                    col.classList.remove('mz-cms-state-selected');
                });

                if (this._type === 'block' && Chorizo.editor.hideLayouts && this.widgetData && this.widgetData.config.heightResizable) {
                    this.resizer = Chorizo.editor.getResizer();
                    this.element.classList.add('mz-cms-state-selected');
                    this.element.appendChild(this.resizer);
                }
            }
        }, {
            key: 'remove',
            value: function remove(elementReference) {

                // ie safe node removal

                if (elementReference.remove) {
                    elementReference.remove();
                } else {
                    elementReference.parentNode.removeChild(elementReference);
                }
            }
        }]);

        return Target;
    })();

    var Grid = (function (_Target) {
        _inherits(Grid, _Target);

        function Grid(el) {
            _classCallCheck(this, Grid);

            _get(Object.getPrototypeOf(Grid.prototype), 'constructor', this).call(this, el);
            this._type = 'grid';

            this.dropZoneData = JSON.parse(this.element.getAttribute(_constants.DATA_GRID_ATTRIBUTE));
            this.span = this.dropZoneData ? this.dropZoneData.span : null;

            this.attachEvents({
                dragover: this.dragover.bind(this),
                dragleave: this.dragleave.bind(this)
            });

            this.rebase();
        }

        _createClass(Grid, [{
            key: 'rebase',
            value: function rebase() {

                if (!this.get(_constants.ROW_SELECTOR)) {
                    this.createLayout(true);
                } else {
                    this.wrapLayout(true);
                }
            }
        }, {
            key: 'type',
            value: function type(val) {
                if (val) {
                    this._type = val;
                    return this.element;
                }
                return this._type;
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
    })(Target);

    var Block = (function (_Target2) {
        _inherits(Block, _Target2);

        function Block(el) {
            _classCallCheck(this, Block);

            _get(Object.getPrototypeOf(Block.prototype), 'constructor', this).call(this, el || doc.createElement('div'));
            this._type = 'block';
            this.widgetData = JSON.parse(this.element.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));
            this.content = this.element.querySelector('.mz-cms-content') || doc.createElement('div');
            this.attachEvents({
                mouseover: this.onHover.bind(this),
                mouseleave: this.ondragLeave.bind(this),
                dblclick: this.onDoubleClick.bind(this),
                click: this.showResizer.bind(this)
            });

            this.addTools();

            if (this.move) {
                this.makeDraggable(this.move, [{ type: DRAG_EVENTS.dragEnd, func: this.onDragEnd.bind(this) }, { type: DRAG_EVENTS.dragStart, func: this.onDragStart.bind(this) }, { type: DRAG_EVENTS.drag, func: this.onDrag.bind(this) }]);
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
                    body: body, type: 'content',
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
                this.element.querySelector('.mz-cms-tools').style.display = 'none';
            }
        }, {
            key: 'onHover',
            value: function onHover() {
                if (Chorizo.editor.hideLayouts) {
                    this.element.querySelector('.mz-cms-tools').style.display = 'block';
                }
            }
        }, {
            key: 'doEdit',
            value: function doEdit() {
                var block = this;
                var isContentWidget = block.widgetData.definitionId === 'content';

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
                    Chorizo.contentEditor.revealEditor(block);
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
                    this.makeDraggable(this.move, [{ type: DRAG_EVENTS.dragEnd, func: this.onDragEnd.bind(this) }, { type: DRAG_EVENTS.dragStart, func: this.onDragStart.bind(this) }]);
                }
            }
        }, {
            key: 'addTools',
            value: function addTools() {
                this.toolbar = doc.createElement('ul');
                this.del = doc.createElement('li');
                this.edit = doc.createElement('li');
                this.move = doc.createElement('li');

                [this.del, this.edit, this.move].forEach(function (el) {
                    el.classList.add('chorizo-icon');
                });

                this.toolbar.className = 'mz-cms-tools';
                this.del.classList.add('trash');
                this.edit.classList.add('pencil');
                this.move.classList.add('drag-handle');

                this.toolbar.appendChild(this.edit);
                this.toolbar.appendChild(this.move);
                this.toolbar.appendChild(this.del);

                this.element.appendChild(this.toolbar);

                this.addEditEvents();
            }
        }, {
            key: 'addEditEvents',
            value: function addEditEvents() {
                var _this2 = this;

                [{ el: this.del, ev: this.destroy }, { el: this.edit, ev: this.doEdit }].forEach(function (ob) {
                    return ob.el.addEventListener(ob.type || 'click', ob.ev.bind(_this2));
                }, this);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                var tempCol = new Col();
                Chorizo.editor.setDirtyState(true);

                tempCol.element = this.element.parentNode;
                this.remove(this.element);
                tempCol.addDropHint();
            }
        }, {
            key: 'insertWidget',
            value: function insertWidget(html) {
                var shell = doc.createElement('div');
                this.content.appendChild(shell);
                shell.outerHTML = html;
                // first child gets around the shell div created from safe insert of outerHTML
                this.content = this.content.firstChild;
            }
        }]);

        return Block;
    })(Target);

    var Layout = (function (_Target3) {
        _inherits(Layout, _Target3);

        function Layout(el) {
            _classCallCheck(this, Layout);

            _get(Object.getPrototypeOf(Layout.prototype), 'constructor', this).call(this, el || doc.createElement('div'));
            this._type = 'layout';
        }

        _createClass(Layout, [{
            key: 'create',
            value: function create(isEmptyGrid, numOfCols) {
                this.row = new Row(null, isEmptyGrid);
                this.col = new Col(null, isEmptyGrid);

                if (!numOfCols) {
                    this.element = this.row.element;
                    this.droppableArea = this.col.element;
                    this.droppableArea.style.width = '100%';
                    this.element.appendChild(this.droppableArea);
                } else {
                    this.element = this.row.element;
                    for (var i = 0; i < numOfCols; i++) {
                        this['col' + '_' + i] = new Col();
                        this['col' + '_' + i].element.style.width = '50%';
                        this.element.appendChild(this['col' + '_' + i].element);
                    }
                }
            }
        }]);

        return Layout;
    })(Target);

    var LayoutComponent = (function (_Target4) {
        _inherits(LayoutComponent, _Target4);

        function LayoutComponent(el) {
            _classCallCheck(this, LayoutComponent);

            _get(Object.getPrototypeOf(LayoutComponent.prototype), 'constructor', this).call(this, el);
        }

        _createClass(LayoutComponent, [{
            key: 'resetMousePosition',
            value: function resetMousePosition() {
                this._colmouseposition = null;
                _mouseposition = null;
            }
        }, {
            key: 'addLayoutHeader',
            value: function addLayoutHeader(isEmptyGrid) {
                var child = this.element.firstChild;
                var header = doc.createElement('div');

                header.classList.add(_constants.LAYOUT_WIDGET_HEADER_CLASSNAME);
                header.classList.add(_constants.BLOCK_TYPES.COL.toLowerCase());

                this.header = header;

                if (!isEmptyGrid) {
                    this.addHeaderEvents();
                    this.element.insertBefore(this.header, child);
                    this.addEditEvents();
                    // hiding edit of columns for now
                    this.edit.style.display = 'none';
                }
            }
        }, {
            key: 'addHeaderEvents',
            value: function addHeaderEvents() {
                this.toolbar = doc.createElement('ul');
                this.del = doc.createElement('li');
                this.edit = doc.createElement('li');
                this.move = doc.createElement('li');

                this.toolbar.className = 'mz-cms-tools';
                this.del.className = 'trash';
                this.edit.className = 'pencil';
                this.move.className = 'drag-handle';

                this.toolbar.appendChild(this.edit);
                this.toolbar.appendChild(this.move);
                this.toolbar.appendChild(this.del);

                this.header.appendChild(this.toolbar);
            }
        }, {
            key: 'addEditEvents',
            value: function addEditEvents() {
                var _this3 = this;

                [{ el: this.del, ev: this.destroy }].forEach(function (ob) {
                    return ob.el.addEventListener(ob.type || 'click', ob.ev.bind(_this3));
                }, this);
            }
        }, {
            key: 'editLayout',
            value: function editLayout(e) {
                Chorizo.editor.edit({
                    element: this.closest(e.target, _constants.COL_CLASSNAME),
                    type: 'content'
                });
            }
        }, {
            key: 'rebase',
            value: function rebase(containingRow) {
                var cols = Array.from(containingRow.querySelectorAll(_constants.ALL_COL_SELECTOR)).filter(function (col) {
                    return col.parentNode.isSameNode(containingRow);
                });

                cols.forEach(function (col) {
                    col.style.width = 1 / cols.length * 100 + '%';
                });
            }
        }, {
            key: 'getCol',
            value: function getCol(e) {
                return e.target.parentNode.parentNode.parentNode;
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                Chorizo.editor.setDirtyState(true);

                var containingRow = this.closest(this.element, 'mz-layout-row');
                var parentLayout = undefined;
                var col = undefined;
                var children = undefined;

                this.remove(this.element);

                // are there any existing columns in the element being deleted
                // not including the hint bar | and not including the row header?
                // if not, we need to readd the drophint son

                children = Array.from(containingRow.childNodes).some(function (child) {
                    return child.classList && !child.classList.contains(_constants.LAYOUT_WIDGET_HEADER_CLASSNAME) && !child.classList.contains('mz-cms-hint-bar');
                });

                parentLayout = containingRow.parentNode ? this.closest(containingRow.parentNode, _constants.COL_CLASSNAME) : null;

                // if the element has children DONT add the drop hint
                if (!children) {

                    this.remove(containingRow);

                    col = new Col();
                    col.element = parentLayout;

                    // if the element has no children, but the parent container DOES have children
                    // do not add a drop hint
                    if (!col.element.querySelector(_constants.ROW_SELECTOR)) {
                        col.addDropHint();
                    }
                } else {
                    this.rebase(containingRow);
                }
            }
        }, {
            key: 'drop',
            value: function drop(e) {
                this.dragleave(e);
            }
        }, {
            key: 'removeElementWhereDragStarted',
            value: function removeElementWhereDragStarted() {
                if (doc.querySelector(_constants.COL_COPY_SELECTOR)) {
                    var tempCol = new Col();
                    tempCol.element = doc.querySelector(_constants.COL_COPY_SELECTOR);
                    tempCol.destroy();
                }
            }
        }, {
            key: 'dropWithContent',
            value: function dropWithContent(layout) {
                var _this4 = this;

                var previousHTML = doc.querySelector(_constants.COL_COPY_SELECTOR) ? doc.querySelector(_constants.COL_COPY_SELECTOR).cloneNode(true) : null;

                if (previousHTML) {
                    layout.removeDropHint();

                    Array.from(previousHTML.querySelectorAll('.mz-cms-tools, .mz-layout-widget-header')).forEach(function (toolset) {
                        // if (toolset.parentNode.id !== 'mz-node-copy') toolset.remove();
                        _this4.remove(toolset);
                    }, this);

                    layout.element.innerHTML = previousHTML.innerHTML;

                    this.reinitializeContent(layout);
                }

                this.removeElementWhereDragStarted();
            }
        }, {
            key: 'reinitializeContent',
            value: function reinitializeContent(layout) {
                var rows = layout.element.querySelectorAll(_constants.ROW_SELECTOR);
                var cols = layout.element.querySelectorAll(_constants.ALL_COL_SELECTOR);
                var blocks = layout.element.querySelectorAll(_constants.BLOCK_SELECTOR);
                var nodeList = Array.prototype.slice.call(rows).concat(Array.prototype.slice.call(cols)).concat(Array.prototype.slice.call(blocks));

                // reinit the layouts edit events becuase theyve been destroyed
                //  by the html insert -- 'true' means dont add drop event
                layout.init(null, true);

                nodeList.forEach(function (el) {

                    var constructor = undefined;
                    var temp = undefined;

                    if (el.classList.contains(_constants.ROW_CLASSNAME)) {
                        constructor = Row;
                    } else if (el.classList.contains(_constants.BLOCK_CLASSNAME)) {
                        constructor = Block;
                    } else {
                        constructor = Col;
                    }

                    temp = new constructor(el);

                    if (temp instanceof Col) {
                        temp.removeDropHint();
                    }
                });
            }
        }, {
            key: 'setupDraggable',
            value: function setupDraggable() {
                this.makeDraggable(this.move, [{ type: DRAG_EVENTS.dragEnd, func: this.onDragEnd.bind(this) }, { type: DRAG_EVENTS.dragStart, func: this.onDragStart.bind(this) }, { type: DRAG_EVENTS.drag, func: this.onDrag.bind(this) }]);
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
                Chorizo.editor.updateDragIconPosition(e);
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
        }]);

        return LayoutComponent;
    })(Target);

    var Row = (function (_LayoutComponent) {
        _inherits(Row, _LayoutComponent);

        function Row(el, isEmptyGrid) {
            var _this5 = this;

            _classCallCheck(this, Row);

            _get(Object.getPrototypeOf(Row.prototype), 'constructor', this).call(this, el || doc.createElement('div'));
            this._type = _constants.BLOCK_TYPES.ROW;
            this.init(isEmptyGrid);
            ['mz-layout-widget', 'mz-layout-row', _constants.ROW_CLASSNAME, 'mz-editing'].forEach(function (cls) {
                return _this5.element.classList.add(cls);
            }, this);
        }

        _createClass(Row, [{
            key: 'ondragLeave',
            value: function ondragLeave(e) {
                e.preventDefault();
                _mouseposition = null;
                Chorizo.editor.hideHintBar();
            }
        }, {
            key: 'isValidHint',
            value: function isValidHint() {

                if (_mouseposition && _mouseposition.position === _constants.POSITION_DICTIONARY.RIGHT || _mouseposition && _mouseposition.position === _constants.POSITION_DICTIONARY.LEFT) {
                    if (this.element.parentNode.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
                        return false;
                    }
                }
                return true;
            }
        }, {
            key: 'ondragOver',
            value: function ondragOver(e) {
                this.resetMousePosition();
                e.preventDefault();
                e.stopPropagation();

                if (!this.isValidHint()) {
                    this.setMouseIndicator(e, false);
                }
                // if you're hovering over a row, and not a droppable column
                if (!Chorizo.editor.hideLayouts && e.target.classList.contains('mz-layout-row')) {
                    var x = e.offsetX;
                    var y = e.offsetY;
                    var width = parseInt(window.getComputedStyle(e.target, null).width, 10);
                    var height = parseInt(window.getComputedStyle(e.target, null).height, 10);

                    this.showHintBarMessage(e.target, x, y, width, height);
                }
            }
        }, {
            key: 'showHintBarMessage',
            value: function showHintBarMessage(element, x, y, width, height) {
                this.setMousePosition(x, y, width, height, element);
                Chorizo.editor.showRowHintBar(element, x, y, width, _mouseposition.position);
            }
        }, {
            key: 'dragleave',
            value: function dragleave() {}
        }, {
            key: 'init',
            value: function init(isEmptyGrid) {

                if (!isEmptyGrid) {
                    this.addRowHeader(isEmptyGrid);
                }

                this.attachEvents({
                    dragover: this.ondragOver.bind(this),
                    dragleave: this.ondragLeave.bind(this),
                    drop: this.drop.bind(this)
                });

                // currently rows aren't draggable
                // if (this.move) this.setupDraggable();
            }
        }, {
            key: 'addRowHeader',
            value: function addRowHeader() {
                var child = this.element.firstChild;
                var header = doc.createElement('div');
                var layoutJSON = JSON.parse(this.element.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));
                var title = layoutJSON ? layoutJSON.title : _constants.ROW_TITLE;

                header.classList.add(_constants.LAYOUT_WIDGET_HEADER_CLASSNAME);
                header.classList.add(_constants.BLOCK_TYPES.ROW.toLowerCase());

                this.header = header;

                this.updateRowTitle({ title: title });

                // if the row isnt the inherited row for the dropzone
                if (!this.element.parentNode || !this.element.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
                    this.addHeaderEvents();
                    this.element.insertBefore(this.header, child);
                    this.addRowHeaderEvents();
                }

                // hiding row drag
                if (this.move) {
                    this.move.style.display = 'none';
                }
            }
        }, {
            key: 'addRowHeaderEvents',
            value: function addRowHeaderEvents() {
                var _this6 = this;

                [{ el: this.del, ev: this.destroy }, { el: this.edit, ev: this.editLayout }].forEach(function (ob) {
                    return ob.el.addEventListener(ob.type || 'click', ob.ev.bind(_this6));
                }, this);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                Chorizo.editor.setDirtyState(true);
                var parentLayout = this.closest(this.element.parentNode, _constants.COL_CLASSNAME);
                var col = undefined;

                this.remove(this.element);

                if (Array.from(parentLayout.childNodes).filter(function (child) {
                    return child.classList && !child.classList.contains('mz-layout-widget-col-header');
                })) {
                    col = new Col();
                    col.element = parentLayout;
                    if (!col.element.querySelector(_constants.ROW_SELECTOR)) {
                        col.addDropHint();
                    }
                }
            }
        }, {
            key: 'updateRowTitle',
            value: function updateRowTitle(cfg) {

                var title = cfg.title || _constants.ROW_TITLE;
                var titleRow = undefined;

                if (this.element.querySelector('.mozu-row-title')) {
                    this.element.querySelector('.mozu-row-title').innerHTML = title;
                } else {
                    titleRow = doc.createElement('span');
                    titleRow.innerHTML = title;
                    titleRow.classList.add('mozu-row-title');
                    this.header.appendChild(titleRow);
                }

                this.element.setAttribute(_constants.DATA_WIDGET_ATTRIBUTE, JSON.stringify({ title: title }));
            }
        }, {
            key: 'getConvertedWidth',
            value: function getConvertedWidth(col) {
                var width = undefined;
                var str = undefined;
                var nums = undefined;

                if (col.style.width) {
                    width = col.style.width;
                } else {
                    col.classList.forEach(function (cls) {
                        if (cls.indexOf(_constants.COL_CLASSNAME) != -1) {
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
        }, {
            key: 'editLayout',
            value: function editLayout() {
                var _this7 = this;

                var me = this;
                var config = {};
                var layoutJSON = JSON.parse(this.element.getAttribute(_constants.DATA_WIDGET_ATTRIBUTE));
                var counter = 1;

                Array.from(this.element.querySelectorAll(_constants.ALL_COL_SELECTOR)).forEach(function (col) {

                    if (col.parentNode.isSameNode(_this7.element)) {

                        config['mz-col' + counter] = me.getConvertedWidth(col);
                        counter++;
                    }
                }, this);

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
                        me.updateRowTitle(cfg.config);

                        widths.splice(widths.indexOf('title'), 1);

                        Array.from(me.element.querySelectorAll(_constants.ALL_COL_SELECTOR)).forEach(function (col) {
                            if (col.parentNode.isSameNode(me.element)) {
                                col.style.width = cfg.config[widths[colIndex]] + '%';
                                colIndex++;
                            }
                        }, me);
                    }
                });
            }
        }]);

        return Row;
    })(LayoutComponent);

    var Col = (function (_LayoutComponent2) {
        _inherits(Col, _LayoutComponent2);

        function Col(el, isEmptyGrid) {
            var _this8 = this;

            _classCallCheck(this, Col);

            _get(Object.getPrototypeOf(Col.prototype), 'constructor', this).call(this, el || doc.createElement('div'));
            this._type = _constants.BLOCK_TYPES.COL;
            this.init(isEmptyGrid);
            this._colmouseposition = null;

            ['mz-layout-col', _constants.COL_CLASSNAME, 'mz-editing', _constants.CONTENT_VIEW_CLASSNAME, 'mz-cms-show-zone'].forEach(function (cls) {
                return _this8.element.classList.add(cls);
            }, this);

            if (Chorizo.editor.areDropzonesHidden) {
                this.element.classList.remove('mz-cms-show-zone');
            }

            this.addDropHint();
        }

        _createClass(Col, [{
            key: 'init',
            value: function init(isEmptyGrid, ignoreDropEvent) {
                this.addLayoutHeader(isEmptyGrid);

                this.attachEvents({
                    dragover: this.dragover.bind(this),
                    dragleave: this.dragleave.bind(this),
                    mouseover: this.showDragHandle.bind(this),
                    mouseout: this.showDragHandle.bind(this)
                });

                if (!ignoreDropEvent) {
                    this.attachEvents({
                        drop: this.drop.bind(this)
                    });
                }

                if (this.move) {
                    this.setupDraggable();
                }

                if (!isEmptyGrid) {
                    this.addDragHandle();
                }
            }
        }, {
            key: 'showDragHandle',
            value: function showDragHandle(e) {

                if (this.handle && this.element.nextElementSibling) {
                    this.handle.style.display = e.type === 'mouseover' ? 'block' : 'none';
                }

                this.onHover();
            }
        }, {
            key: 'addDragHandle',
            value: function addDragHandle() {
                var _this9 = this;

                this.handle = doc.createElement('div');
                ['ui-draggable', 'resizer-column'].forEach(function (cls) {
                    return _this9.handle.classList.add(cls);
                }, this);
                this.element.appendChild(this.handle);

                this.handle.addEventListener('mousedown', this.doDragWidth.bind(this));
                this.handle.addEventListener('mouseup', this.doDragWidth.bind(this));
            }
        }, {
            key: 'doDragWidth',
            value: function doDragWidth(e) {
                Chorizo.editor._draggingColumn = e.type === 'mousedown' ? this.element : null;
            }
        }, {
            key: 'isValidDrop',
            value: function isValidDrop(e) {

                // if werre trying to drag a layoutelement onto a a layout with a widget (YOU CANT DROP -- DONT SHOW HINT)
                if (this.element.querySelector(_constants.BLOCK_SELECTOR) && e.type === DRAG_EVENTS.dragOver) {
                    return false;
                }

                // if this is a drop zone, and you're trying to drop right or left
                if ((_mouseposition && _mouseposition.position === _constants.POSITION_DICTIONARY.RIGHT || _mouseposition && _mouseposition.position === _constants.POSITION_DICTIONARY.LEFT) && this.element.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
                    return false;
                }

                // if you're trying to drop a col into a place where theres already a widget
                if (!_mouseposition && this._colmouseposition && !this._colmouseposition.position && this.element.querySelector(_constants.BLOCK_SELECTOR)) {
                    return false;
                }

                return true;
            }
        }, {
            key: 'dragover',
            value: function dragover(e) {
                this.resetMousePosition();
                this.element.classList[!this.isValidDrop(e) ? 'remove' : 'add'](_constants.DROPOVER_CLASSNAME);

                e.preventDefault();

                var x = e.offsetX;
                var y = e.offsetY;
                var width = parseInt(window.getComputedStyle(e.target, null).width);
                var height = parseInt(window.getComputedStyle(e.target, null).height);
                var closetWidget = this.closest(e.target, _constants.BLOCK_CLASSNAME);
                var target = e.target;

                // if were dropping widgets, we need to get the width/height of the
                // current widget were hovering over
                if (Chorizo.editor.hideLayouts && closetWidget) {
                    width = parseInt(window.getComputedStyle(closetWidget, null).width);
                    height = parseInt(window.getComputedStyle(closetWidget, null).height);
                    target = closetWidget;
                }

                this._colmouseposition = this.getHintingData(Chorizo.editor.hideLayouts, x, y, width, height, this.element, target, e);

                if (!Chorizo.editor.hideLayouts) {
                    if (this._colmouseposition.position) {
                        this.showHintBarMessage(x, y, width, height, e.target, this._colmouseposition.position);
                    } else {
                        Chorizo.editor.hideHintBar();
                    }
                } else {
                    this.showWidgetHintBarMessage(x, y, width, height, e.target, this._colmouseposition.position);
                }
            }
        }, {
            key: 'getHintingData',
            value: function getHintingData(hideLayouts, x, y, width, height, element, hoveredTarget) {
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
                        targetedBlock = this.closest(hoveredTarget, _constants.BLOCK_CLASSNAME);

                        if (targetedBlock) {
                            // position = y / parseInt(window.getComputedStyle(targetedBlock, null).height, 10);
                            position = this.findPosition(x, y, width, height);
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
        }, {
            key: 'showHintBarMessage',
            value: function showHintBarMessage(x, y, width, height, element, msg) {
                Chorizo.editor.showColHintBar(this.element.querySelector('.mz-layout-widget-header'), x, y, width, msg);
            }
        }, {
            key: 'showWidgetHintBarMessage',
            value: function showWidgetHintBarMessage(x, y, width, height, element, msg) {
                Chorizo.editor.showWidgetHintBar(this.closest(element, _constants.BLOCK_CLASSNAME), this.element, x, y, height, msg);
            }
        }, {
            key: 'dragleave',
            value: function dragleave() {
                Array.from(doc.querySelectorAll(_constants.ALL_COL_SELECTOR)).forEach(function (col) {
                    return col.classList.remove(_constants.DROPOVER_CLASSNAME);
                });
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
                        this.dropWithContent(layout);
                    } else {
                        this.removeElementWhereDragStarted();
                    }
                };

                // if were dragging a widget, lets ignore the widget editor
                if (widgetData.dragMethod === 'widgetDrag') {

                    Chorizo.editor.fireEvent('widgetdrop', {
                        widgetTypeId: widgetData.id,
                        type: widgetData.type,
                        ignoreEditor: true,
                        element: this.element,
                        data: JSON.parse(doc.querySelector('#mz-widget-copy').getAttribute(_constants.DATA_WIDGET_ATTRIBUTE)),
                        callback: this.afterDrop.bind(this, function () {
                            // destory the dragged element relic
                            var tempBlock = new Block(doc.querySelector('#mz-widget-copy'));
                            tempBlock.destroy();
                        })
                    }, true); // true means theres incoming data || not a brand new widget drop
                }

                // if the layout drop occurs as an addition to a row, ignore the widget editor
                else if (this._colmouseposition && this._colmouseposition.position && !_mouseposition) {

                        Chorizo.editor.fireEvent('widgetdrop', {
                            widgetTypeId: widgetData.id,
                            type: widgetData.type,
                            callback: this.afterDrop.bind(this, afterDropCallback),
                            ignoreEditor: widgetData.type !== 'content'
                        });
                    } else {
                        Chorizo.editor.fireEvent('widgetdrop', {
                            widgetTypeId: widgetData.id,
                            type: widgetData.type,
                            callback: this.afterDrop.bind(this, afterDropCallback),
                            ignoreEditor: false
                        });
                    }

                Chorizo.editor.hideHintBar();
            }
        }, {
            key: 'afterDrop',
            value: function afterDrop(cb, html, cfg) {

                if (cfg.type === 'layout') {
                    this.layout = new Layout();
                    this.layout.createFromDrop(html, cfg);
                    this.insertLayoutElement(cfg, cb);
                } else {
                    this.insertWidgetElement(cb, html, cfg);
                }

                this.resetMousePosition();
            }
        }, {
            key: 'renderWidgetWithLayout',
            value: function renderWidgetWithLayout(block, onlyCol) {
                var layout = new Layout();
                layout.create(false);
                layout.col.removeDropHint();
                layout.col.element.appendChild(block.element);

                if (onlyCol) {
                    return layout.col;
                } else {
                    return layout;
                }
            }
        }, {
            key: 'insertColWithWidget',
            value: function insertColWithWidget(block, position) {
                var layout = this.renderWidgetWithLayout(block, 'onlyCol');

                if (position === _constants.POSITION_DICTIONARY.RIGHT) {
                    this.element.parentNode.insertBefore(layout.element, this.element.nextElementSibling);
                } else if (position === _constants.POSITION_DICTIONARY.LEFT) {
                    this.element.parentNode.insertBefore(layout.element, this.element);
                }

                Chorizo.editor.showLayoutHeaders(false);
                this.rebase(this.element.parentNode);
            }
        }, {
            key: 'insertWidgetElement',
            value: function insertWidgetElement(cb, html, cfg) {
                var block = undefined;
                var layout = undefined;

                this.removeDropHint();
                block = new Block();
                block.create(cfg, html);

                // if we drop a widget into a dropzone, lets create a layout element around it
                if (this.element.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
                    layout = this.renderWidgetWithLayout(block);
                    this.element.appendChild(layout.element);
                    Chorizo.editor.showLayoutHeaders(false);
                } else if (this._colmouseposition.position === _constants.POSITION_DICTIONARY.BOTTOM) {
                    if (!this.element.querySelector(_constants.BLOCK_SELECTOR)) {
                        this.element.appendChild(block.element);
                    } else {
                        this._colmouseposition.element.parentNode.insertBefore(block.element, this._colmouseposition.element.nextSibling);
                    }
                } else if (this._colmouseposition.position === _constants.POSITION_DICTIONARY.TOP) {
                    this.element.insertBefore(block.element, this._colmouseposition.element);
                } else if (this._colmouseposition.position === _constants.POSITION_DICTIONARY.LEFT || this._colmouseposition.position === _constants.POSITION_DICTIONARY.RIGHT) {
                    this.insertColWithWidget(block, this._colmouseposition.position);
                }

                if (cb) {
                    cb.call(this);
                }
            }
        }, {
            key: 'containsInteriorRow',
            value: function containsInteriorRow(element) {
                return element.classList && element.classList.contains(_constants.ROW_CLASSNAME);
            }
        }, {
            key: 'doColumnInsert',
            value: function doColumnInsert(positionObject, cb) {
                var _this10 = this;

                var cols = this.layout.element.querySelectorAll('.mz-layout-col');
                var newlyAddedCol = undefined;

                Array.from(cols).forEach(function (col) {

                    if (positionObject.position === _constants.POSITION_DICTIONARY.RIGHT) {

                        // if the drop element has children, we need to append it to the containing row, and not the column
                        if (_this10.containsInteriorRow(positionObject.element)) {
                            positionObject.element.parentNode.parentNode.insertBefore(col, positionObject.element.parentNode.nextSibling);
                            newlyAddedCol = new Col(col);
                            _this10.rebase(positionObject.element.parentNode.parentNode);
                        } else {
                            positionObject.element.parentNode.insertBefore(col, positionObject.element.nextSibling);
                            newlyAddedCol = new Col(col);
                        }
                    } else {
                        // adding new columns to left

                        // if the drop element has children, we need to append it to the containing row, and not the column
                        if (_this10.containsInteriorRow(positionObject.element)) {
                            positionObject.element.parentNode.parentNode.insertBefore(col, positionObject.element.parentNode);
                            newlyAddedCol = new Col(col);
                            _this10.rebase(positionObject.element.parentNode.parentNode);
                        } else {
                            positionObject.element.parentNode.insertBefore(col, positionObject.element);
                            newlyAddedCol = new Col(col);
                        }
                    }

                    if (cb) {
                        cb.call(_this10, newlyAddedCol);
                    }
                });

                this.rebase(positionObject.element.parentNode);
            }
        }, {
            key: 'insertLayoutElement',
            value: function insertLayoutElement(cfg, cb) {

                var newCol = undefined;
                var row = undefined;
                // defer to column actions first
                if (this._colmouseposition && this._colmouseposition.position) {
                    this.doColumnInsert(this._colmouseposition, cb);
                }
                // else, a action happend within a row
                else {

                        // since action happened in a row -- we may need to remove drop hint
                        this.removeDropHint();

                        if (!_mouseposition) {
                            this.element.appendChild(this.layout.element);
                        } else if (_mouseposition.position === _constants.POSITION_DICTIONARY.TOP) {
                            this.element.insertBefore(this.layout.element, _mouseposition.element);
                        } else if (_mouseposition.position === _constants.POSITION_DICTIONARY.BOTTOM) {
                            _mouseposition.element.parentNode.insertBefore(this.layout.element, _mouseposition.element.nextSibling);
                        } else if (_mouseposition.position === _constants.POSITION_DICTIONARY.RIGHT || _mouseposition.position === _constants.POSITION_DICTIONARY.LEFT) {
                            if (this.element.parentNode.parentNode.classList.contains(_constants.GRID_CLASSNAME)) {
                                return false;
                            }
                            this.doColumnInsert(_mouseposition, cb);
                        }
                    }

                row = new Row(this.layout.element);

                row.updateRowTitle(cfg.config);

                Array.from(this.layout.element.querySelectorAll(_constants.ALL_COL_SELECTOR)).forEach(function (col) {
                    newCol = new Col(col);
                }, this);

                // if the cb wasnt handled already, its a new row, so we need to see if content was dragged
                if (newCol && cb) {
                    cb.call(newCol, newCol);
                }
            }
        }, {
            key: 'removeDropHint',
            value: function removeDropHint() {

                if (this.element.querySelector(_constants.DROP_HINT_SELECTOR) && this.element.querySelector(_constants.DROP_HINT_SELECTOR).parentNode.isSameNode(this.element)) {
                    this.remove(this.element.querySelector(_constants.DROP_HINT_SELECTOR));
                }
            }
        }, {
            key: 'addDropHint',
            value: function addDropHint() {

                var content = doc.createElement('div');
                var text = doc.createElement('span');
                text.innerHTML = _constants.DROP_HINT_TEXT;
                content.appendChild(text);
                content.classList.add(_constants.DROP_HINT_CLASSNAME);

                if (!this.element.querySelector(_constants.BLOCK_SELECTOR + ', ' + _constants.ROW_SELECTOR + ', ' + _constants.ALL_COL_SELECTOR)) {
                    this.element.appendChild(content);
                }
            }
        }, {
            key: 'onHover',
            value: function onHover() {
                // possibly show hide, row/col tools?
            }
        }]);

        return Col;
    })(LayoutComponent);

    doc.addEventListener('DOMContentLoaded', function () {

        if (!win.Chorizo) {
            win.Chorizo = {};
        }

        // init grids that aren't inherited

        DRAG_EVENTS = Chorizo.editor.getBrowserDragEvents();

        Chorizo.helper.factory(_constants.GRID_SELECTOR + '.mz-cms-editing', Grid);
        Chorizo.helper.factory(_constants.ROW_SELECTOR, Row);
        Chorizo.helper.factory(_constants.ALL_COL_SELECTOR, Col);
        Chorizo.helper.factory(_constants.BLOCK_SELECTOR, Block);

        if (Chorizo.editor.hideLayouts) {
            Chorizo.editor.showLayoutHeaders(false);
        }

        var target = new Target();

        doc.addEventListener('click', target.showResizer);
    });
})(window, document);

},{"./constants":1}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (win, doc) {
    var Widgets = (function () {
        function Widgets() {
            _classCallCheck(this, Widgets);
        }

        _createClass(Widgets, [{
            key: 'init',
            value: function init() {
                console.log('init widgets');
            }
        }]);

        return Widgets;
    })();

    doc.addEventListener('DOMContentLoaded', function () {
        if (!win.Chorizo) {
            win.Chorizo = {};
        }

        Chorizo.widgets = new Widgets();
        Chorizo.widgets.init();
    });
})(window, document);

},{}]},{},[1,2,3,4,5,6]);
