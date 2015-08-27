/*
 * 
 *
*/

Ext.define('Taco.overrides.form.field.HtmlEditor', {
    override: 'Ext.form.field.HtmlEditor',
    initComponent: function () {
        this.mon(this, 'afterrender', this.onAfterRender, this);        
        this.callParent(arguments);
    },
    
    defaultFont: "SourceSansProRegular, helvetica, arial, verdana, sans-serif",
    defaultFontSize : "16px",

    // WTF: So I had to override this method from the extjs control to change the default font-size to match the default font-size for the text area.
    // If the html head includes a default font-size of 12px; and the text area has font-size of 16px. the init of this control copies the style information from the textarea and applies it to the body tag.
    // so initially the wysiwyg container will run at 16px. but if you delete all of the content the body magically looses its font-size and then the head's default of 12 px applies. In addition, having a mismatch between the body and head causes chrome to start wrapping all changes in span tags
    // that include font-family and font-size. This bug has been a major pain.  The net lesson here is, make sure that the html and the body tag have the same font-size defined or you will be subjected to super buggy chrome behavior. 
    getDocMarkup: function () {
        var me = this,
            h = me.iframeEl.getHeight() - me.iframePad * 2,
            oldIE = Ext.isIE8m;

        // - IE9+ require a strict doctype otherwise text outside visible area can't be selected.
        // - Opera inserts <P> tags on Return key, so P margins must be removed to avoid double line-height.
        // - On browsers other than IE, the font is not inherited by the IFRAME so it must be specified.
        return Ext.String.format(
            (oldIE ? '' : '<!DOCTYPE html>')
            + '<html><head><style type="text/css">'
            + (Ext.isOpera ? 'p{margin:0}' : '')
            + 'body{border:0;margin:0;padding:{0}px;direction:' + (me.rtl ? 'rtl;' : 'ltr;')
            + (oldIE ? Ext.emptyString : 'min-')
            + 'height:{1}px;box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;cursor:text;background-color:white;'
            + (Ext.isIE ? '' : 'font-size:{3};font-family:{2}')
            + '}</style></head><body></body></html>'
            , me.iframePad, h, me.defaultFont, me.defaultFontSize);
    },

    // this is a fix for weird chrome behavior where certain edits using the contentEditable feature results in chrome wrapping all changes in span tags. This stopped happening when I forced the body and html to have the same default font-size; Go figure. Leaving this code here commented out in case this bug comes back in a different use case.
    stripSpanTags: function (){
        //if (Ext.isChrome) {
        //    Ext.EventManager.on(doc, 'DOMNodeInserted', function (e, t) {
        //        if (t.tagName == "SPAN") {
        //            var target = Ext.fly(t),                    
        //            tagName = target.tagName,
        //            hasFontFamily = target.getStyle("fontFamily", true);

        //            var hasFontFamily = t.style["font-family"];
        //            // this is a fix for removing span tags added in only in chrome due to a bug in the browser
        //            if (hasFontFamily) {
        //                t.parentNode.insertAdjacentHTML("afterBegin", t.innerHTML);
        //                t.parentNode.removeChild(t)
        //            }
        //        }
        //    }, this);
        //}
    },

    initEditor: function () {

        if (this.isDestroyed) {
            return;
        }


        var doc = this.getDoc();
        
        // prevent the tab key from changing the field contend when the iframeEl is active; Tab Key will move to the next field in the form;
        Ext.EventManager.on(doc, 'keydown', function (e, t) {
            if (e.getKey() == Ext.EventObject.TAB) {
                e.preventDefault();
                var allFocusable = Ext.getBody().query(":focusable");
                var fieldIndex = allFocusable.indexOf(this.iframeEl.dom)
                if (!fieldIndex) {
                    return;
                }
                var newIndex = fieldIndex + 1,
                    nextEl;

                if (e.shiftKey) {
                    newIndex = fieldIndex - 1
                }

                nextEl = Ext.get(allFocusable[newIndex]);
                nextEl.focus();
                return false;
            }
        }, this);

        // this is a workaround to fix weird chrome specific behavior
        this.stripSpanTags();

        this.callParent(arguments);
    },
   
    onAfterRender: function () {
        // prevent the tab key from being used in the field so that the user can tab in and tab out of the field in the form panel.
        this.mon(this.textareaEl, 'keydown', function (e, t) {
            if (e.getKey() == Ext.EventObject.TAB) {                
                return;
            }
        }, this);
    },
    
    // overrides from the application.js file moved here. 
    getValue: function () {
        var me = this,
            value;
        if (!me.rendered) {
            return me.value;
        }
        if (!me.sourceEditMode) {
            if (document.getElementById(me.iframeEl.id)) {
                me.syncValue();
            } else {
                console.log('damn');
            }
        }
        value = me.textareaEl.dom.value;
        me.value = value;
        return value;
    },

    // overrides from the application.js file moved here. 
    relayCmd: function (cmd, value) {
        if (!this.rendered) {
            this.on('afterrender', function (html) {
                html.relayCmd(cmd, value);
            }, this, { single: true });
            return;
        }
        Ext.defer(function () {
            var me = this;
            if (!this.rendered) {
                me.relayCmd(cmd, value);
                return;
            }

            if (!this.isDestroyed) {
                me.win.focus();
                me.execCmd(cmd, value);
                me.updateToolbar();
            }

        }, 10, this);
    }
});
