/**
 * @class Taco.core.util.GetsTextFormat
 * Mixin that adds HTML element processors that return text formatting style.
 */

Ext.define('Taco.core.util.GetsTextFormat', {

        fontProperties: [
            'border',
            'color',
            'font-family',
            'font-variant',
            'font-size',
            'font-size-adjust',
            'font-stretch',
            'font-style',
            'font-weight',
            'text-transform',
            'letter-spacing',
            'white-space',
            'line-height',
            'padding',
            'width',
            'height'
        ],

        hideStyle: {
            position: 'absolute',
            left: '-99999px'
        },

        createTempNode: function (elm, doc) {
            return Ext.get((elm.tag || elm.cls) ? Ext.DomHelper.createDom(elm) : (elm.cloneNode || elm.dom.cloneNode)(false)).applyStyles(this.hideStyle).appendTo((doc || document).body);
        },

        extractTextFormatting: function (elm, doc) {
            var isTemp = false;
            if (!elm.tagName && !elm.getStyle) {
                isTemp = true;
                elm = this.createTempNode(elm, doc);
            }
            if (!elm.getStyle) {
                elm = Ext.get(elm);
            }
            var styles = elm.getStyle(this.fontProperties);
            isTemp && elm.remove();
            return styles;
        },

        applyTextFormatting: function (fromElm, toElm, doc) {
            return Ext.fly(toElm).applyStyles(this.extractTextFormatting(fromElm, doc));
        },

        getFormattedTextWidth: function (elm, text, doc) {
            if (!text) {
                return Ext.fly(elm).getTextWidth();
            } else {
                var temp = this.createTempNode(elm.dom || elm, doc).setText(text),
                    width = temp.getTextWidth();
                temp.remove();
                return width;
            }
        }

    });