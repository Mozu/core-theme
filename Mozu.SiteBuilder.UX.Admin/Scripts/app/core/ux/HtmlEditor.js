/**
* @class Taco.core.ux.HtmlEditor
* @author James Zetlen
* Supermodified Ext.HtmlEditor for use in EditSurface
* ??ORPHAN??
*/

Ext.define('Taco.core.ux.HtmlEditor', {
    extend: 'Ext.form.field.HtmlEditor',
    alias: 'widget.tacohtmleditor',

    mixins: ['Taco.core.util.GetsTextFormat'],

    cls: Taco.baseCSSPrefix + 'wysiwyg',

    // since the toolbar isn't part of the editor, we override the special layout and just leave it as a Field
    componentLayout: 'field',

    fontFamilies: [
        'Helvetica',
        'Arial',
        'Courier New',
        'Times New Roman',
        'Verdana'
    ],

    //enableSourceEdit: false,

    fieldSubTpl: [
        '{beforeTextAreaTpl}',
        '<textarea id="{cmpId}-textareaEl" name="{name}" tabIndex="-1" {inputAttrTpl}',
                 ' class="{textareaCls}" style="{size}" autocomplete="off">',
            '{[Ext.util.Format.htmlEncode(values.value)]}',
        '</textarea>',
        '{afterTextAreaTpl}',
        '{beforeIFrameTpl}',
        '<iframe id="{cmpId}-iframeEl" name="{iframeName}" frameBorder="0" {iframeAttrTpl}',
               ' style="overflow:auto;{size}" src="{iframeSrc}"></iframe>',
        '{afterIFrameTpl}',
        {
            disableFormats: true
        }
    ],

    // we need to override Ext.HtmlEditor's version of this function and go straight back to Component, hence this half-deprecated way of doing things.
    finishRenderChildren: function () {
        Ext.Component.prototype.finishRenderChildren.apply(this, arguments);
    },

    defaultFont: 'Helvetica',

    getSelectedText: function () {
        return this.win.getSelection ? this.win.getSelection().toString() : this.getDoc().selection.createRange().text;
    },

    initComponent: function () {
        if (this.addFonts) {
            this.fontFamilies = Ext.Array.union(this.fontFamilies, this.addFonts);
        }
        this.callParent(arguments);
    },

    onShow: function () {
        this.callParent(arguments);
        this.focus(false, 10);
        this.editSurfaceParent.insert(0, this.getToolbar());
        this.getToolbar().show();
    },

    /*
    * Called when the editor creates its toolbar. Override this method if you need to
    * add custom toolbar buttons.
    * @param {Ext.form.field.HtmlEditor} editor
    * @protected
    */
    createToolbar: function (editor) {
        var me = this,
            items = [], i,
            tipsEnabled = Ext.tip.QuickTipManager && Ext.tip.QuickTipManager.isEnabled(),
            baseCSSPrefix = Ext.baseCSSPrefix,
            fontSelectItem, styleSelectItem, toolbar, undef;

        function btn(id, toggle, handler) {
            return {
                itemId: id,
                cls: baseCSSPrefix + 'btn-icon',
                iconCls: baseCSSPrefix + 'edit-' + id,
                enableToggle: toggle !== false,
                scope: editor,
                handler: handler || editor.relayBtnCmd,
                clickEvent: 'mousedown',
                tooltip: tipsEnabled ? editor.buttonTips[id] || undef : undef,
                overflowText: editor.buttonTips[id].title || undef,
                tabIndex: -1
            };
        }


        if (me.enableStyle && !Ext.isSafari2) {
            styleSelectItem = Ext.widget('component', {
                renderTpl: [
                    '<select id="{id}-selectEl" class="{cls}">',
                        '<tpl for="styles">',
                            '<option value="{[values.toLowerCase()]}">{.}</option>',
                        '</tpl>',
                    '</select>'
                ],
                renderData: {
                    cls: Taco.baseCSSPrefix + 'style-select',
                    styles: Ext.Object.getKeys(me.themeStyles)
                },
                childEls: ['selectEl'],
                afterRender: function () {
                    me.styleSelect = this.selectEl;
                    Ext.Component.prototype.afterRender.apply(this, arguments);
                },
                onDisable: function () {
                    var selectEl = this.selectEl;
                    if (selectEl) {
                        selectEl.dom.disabled = true;
                    }
                    Ext.Component.prototype.onDisable.apply(this, arguments);
                },
                onEnable: function () {
                    var selectEl = this.selectEl;
                    if (selectEl) {
                        selectEl.dom.disabled = false;
                    }
                    Ext.Component.prototype.onEnable.apply(this, arguments);
                },
                listeners: {
                    change: function () {
                        if (me.styleSelect.dom.value === "none") {

                        } else {
                            me.insertAtCursor(Ext.DomHelper.markup(Ext.Object.merge(me.themeStyles[me.styleSelect.dom.value], { html: me.getSelectedText() })));
                        }
                        me.deferFocus();
                    },
                    element: 'selectEl'
                }
            });

            items.push(
                styleSelectItem,
                '-'
            );
        }

        if (me.enableFont && !Ext.isSafari2) {
            fontSelectItem = Ext.widget('component', {
                renderTpl: [
                    '<select id="{id}-selectEl" class="{cls}">',
                        '<tpl for="fonts">',
                            '<option value="{[values.toLowerCase()]}" style="font-family:{.}"<tpl if="values.toLowerCase()==parent.defaultFont"> selected</tpl>>{.}</option>',
                        '</tpl>',
                    '</select>'
                ],
                renderData: {
                    cls: baseCSSPrefix + 'font-select',
                    fonts: me.fontFamilies,
                    defaultFont: me.defaultFont
                },
                childEls: ['selectEl'],
                afterRender: function () {
                    me.fontSelect = this.selectEl;
                    Ext.Component.prototype.afterRender.apply(this, arguments);
                },
                onDisable: function () {
                    var selectEl = this.selectEl;
                    if (selectEl) {
                        selectEl.dom.disabled = true;
                    }
                    Ext.Component.prototype.onDisable.apply(this, arguments);
                },
                onEnable: function () {
                    var selectEl = this.selectEl;
                    if (selectEl) {
                        selectEl.dom.disabled = false;
                    }
                    Ext.Component.prototype.onEnable.apply(this, arguments);
                },
                listeners: {
                    change: function () {
                        me.relayCmd('fontname', me.fontSelect.dom.value);
                        me.deferFocus();
                    },
                    element: 'selectEl'
                }
            });

            items.push(
                fontSelectItem,
                '-'
            );
        }

        if (me.enableFormat) {
            items.push(
                btn('bold'),
                btn('italic'),
                btn('underline')
            );
        }

        if (me.enableFontSize) {
            items.push(
                '-',
                btn('increasefontsize', false, me.adjustFont),
                btn('decreasefontsize', false, me.adjustFont)
            );
        }

        if (me.enableColors) {
            items.push(
                '-', {
                    itemId: 'forecolor',
                    cls: baseCSSPrefix + 'btn-icon',
                    iconCls: baseCSSPrefix + 'edit-forecolor',
                    overflowText: editor.buttonTips.forecolor.title,
                    tooltip: tipsEnabled ? editor.buttonTips.forecolor || undef : undef,
                    tabIndex: -1,
                    menu: Ext.widget('menu', {
                        plain: true,
                        items: [{
                            xtype: 'colorpicker',
                            allowReselect: true,
                            focus: Ext.emptyFn,
                            value: '000000',
                            plain: true,
                            clickEvent: 'mousedown',
                            handler: function (cp, color) {
                                me.execCmd('forecolor', Ext.isWebKit || Ext.isIE ? '#' + color : color);
                                me.deferFocus();
                                this.up('menu').hide();
                            }
                        }]
                    })
                }, {
                    itemId: 'backcolor',
                    cls: baseCSSPrefix + 'btn-icon',
                    iconCls: baseCSSPrefix + 'edit-backcolor',
                    overflowText: editor.buttonTips.backcolor.title,
                    tooltip: tipsEnabled ? editor.buttonTips.backcolor || undef : undef,
                    tabIndex: -1,
                    menu: Ext.widget('menu', {
                        plain: true,
                        items: [{
                            xtype: 'colorpicker',
                            focus: Ext.emptyFn,
                            value: 'FFFFFF',
                            plain: true,
                            allowReselect: true,
                            clickEvent: 'mousedown',
                            handler: function (cp, color) {
                                if (Ext.isGecko) {
                                    me.execCmd('useCSS', false);
                                    me.execCmd('hilitecolor', color);
                                    me.execCmd('useCSS', true);
                                    me.deferFocus();
                                } else {
                                    me.execCmd(Ext.isOpera ? 'hilitecolor' : 'backcolor', Ext.isWebKit || Ext.isIE ? '#' + color : color);
                                    me.deferFocus();
                                }
                                this.up('menu').hide();
                            }
                        }]
                    })
                }
            );
        }

        if (me.enableAlignments) {
            items.push(
                '-',
                btn('justifyleft'),
                btn('justifycenter'),
                btn('justifyright')
            );
        }

        if (!Ext.isSafari2) {
            if (me.enableLinks) {
                items.push(
                    '-',
                    btn('createlink', false, me.createLink)
                );
            }

            if (me.enableLists) {
                items.push(
                    '-',
                    btn('insertorderedlist'),
                    btn('insertunorderedlist')
                );
            }
            if (me.enableSourceEdit) {
                items.push(
                    '-',
                    btn('sourceedit', true, function (btn) {
                        me.toggleSourceEdit(!me.sourceEditMode);
                    })
                );
            }
        }

        // Everything starts disabled.
        for (i = 0; i < items.length; i++) {
            if (items[i].itemId !== 'sourceedit') {
                items[i].disabled = true;
            }
        }

        // build the toolbar
        // Automatically rendered in AbstractComponent.afterRender's renderChildren call
        toolbar = Ext.widget('toolbar', {
            id: me.id + '-toolbar',
            floating: true,
            cls: Ext.baseCSSPrefix + 'html-editor-tb ' + Taco.baseCSSPrefix + 'wysiwyg-toolbar',
            enableOverflow: true,
            items: items,

            // stop form submits
            listeners: {
                click: {
                    fn: function (e) {
                        e.preventDefault();
                    },
                    element: 'el'
                },
                render: {
                    fn: function () {
                        var alignToEl = me.editSurfaceParent.getEl().up('.taco-content-body'),
                        leftOffset = me.editSurfaceParent.el.getPageBox().left - alignToEl.getPageBox().left;
                        this.alignTo(me.editSurfaceParent.getEl().up('.taco-content-body'), 'tl-tl', [leftOffset, 0]);
                        this.setWidth(me.editSurfaceParent.iframe.getWidth());
                    }
                }
            }
        });

        me.toolbar = toolbar;
        window.tb = toolbar;
    },

    /**
    * Disallowed tags are replaced with span tags, or removed if that would result in bad DOM.
    */
    disallowedTags: ['div'],

    //since we're allowing source editing, let's strip disallowed tags at the gates
    getValue: function () {
        if (this.sourceEditMode) {
            return this.cleanHtml(this.callParent(arguments));
        }
        return this.callParent(arguments);
    },

    /**
    * If you need/want custom HTML cleanup, this is the method you should override.
    * @param {String} html The HTML to be cleaned
    * @return {String} The cleaned HTML
    * @protected
    */
    cleanHtml: function (html) {
        html = String(html);
        if (Ext.isWebKit) { // strip safari nonsense
            html = html.replace(/\sclass="(?:Apple-style-span|khtml-block-placeholder)"/gi, '');
        }

        /*
        * Neat little hack. Strips out all the non-digit characters from the default
        * value and compares it to the character code of the first character in the string
        * because it can cause encoding issues when posted to the server. We need the
        * parseInt here because charCodeAt will return a number.
        */
        if (html.charCodeAt(0) === parseInt(this.defaultValue.replace(/\D/g, ''), 10)) {
            html = html.substring(1);
        }

        return this.stripDisallowedTags(html);

    },

    stripDisallowedTags: function (value) {
        /*
        * Begin DOM parsing. Compile HTML into a element, so we can use DOM methods to strip block-level elements.
        *
        */
        if (this.disallowedTags.length > 0) {
            var numTagsPresent = 0,
                    stagingDiv = Ext.DomHelper.createDom({
                        tag: 'div',
                        html: value
                    });

            Ext.Array.each(this.disallowedTags, function (tagname) {
                Ext.Array.each(Ext.DomQuery.select(tagname, stagingDiv), function (elm) {
                    numTagsPresent++;
                    try {
                        var df = document.createDocumentFragment(),
                            len = elm.childNodes.length;
                        for (var i = 0; i < len; i++) {
                            df.appendChild(elm.childNodes[i].cloneNode(true));
                        }

                        elm.parentNode.insertBefore(df, elm);
                    } catch (badDom) { }
                    elm.parentNode.removeChild(elm);
                });
            });

            // we check to see if we made any changes because whether we did or not, innerHTML won't be precisely the same string as the original value
            // and if we made no changes, we want the original value to work in an equality test.
            if (numTagsPresent > 0) {
                value = stagingDiv.innerHTML;
            }
        }

        return value;
    },

    // private
    initEditor: function () {
        //Destroying the component during/before initEditor can cause issues.
        try {
            var me = this,
                dbody = me.getEditorBody(),
                ss = me.fieldStyle,
                doc,
                fn;

            ss['background-attachment'] = 'fixed'; // w3c
            dbody.bgProperties = 'fixed'; // ie

            Ext.DomHelper.applyStyles(dbody, ss);

            doc = me.getDoc();

            if (doc) {
                try {
                    Ext.EventManager.removeAll(doc);
                } catch (e) { }
            }

            /*
            * We need to use createDelegate here, because when using buffer, the delayed task is added
            * as a property to the function. When the listener is removed, the task is deleted from the function.
            * Since onEditorEvent is shared on the prototype, if we have multiple html editors, the first time one of the editors
            * is destroyed, it causes the fn to be deleted from the prototype, which causes errors. Essentially, we're just anonymizing the function.
            */
            fn = Ext.Function.bind(me.onEditorEvent, me);
            Ext.EventManager.on(doc, {
                mousedown: fn,
                dblclick: fn,
                click: fn,
                keyup: fn,
                buffer: 100
            });

            // These events need to be relayed from the inner document (where they stop
            // bubbling) up to the outer document. This has to be done at the DOM level so
            // the event reaches listeners on elements like the document body. The effected
            // mechanisms that depend on this bubbling behavior are listed to the right
            // of the event.
            fn = me.onRelayedEvent;
            Ext.EventManager.on(doc, {
                mousedown: fn, // menu dismisal (MenuManager) and Window onMouseDown (toFront)
                mousemove: fn, // window resize drag detection
                mouseup: fn,   // window resize termination
                click: fn,     // not sure, but just to be safe
                dblclick: fn,  // not sure again
                scope: me
            });

            if (Ext.isGecko) {
                Ext.EventManager.on(doc, 'keypress', me.applyCommand, me);
            }
            if (me.fixKeys) {
                Ext.EventManager.on(doc, 'keydown', me.fixKeys, me);
            }

            // We need to be sure we remove all our events from the iframe on unload or we're going to LEAK!
            Ext.EventManager.on(window, 'unload', me.beforeDestroy, me);
            doc.editorInitialized = true;

            me.initialized = true;
            me.pushValue();
            me.setReadOnly(me.readOnly);
            me.fireEvent('initialize', me);
        } catch (ex) {
            // ignore (why?)
        }
    },

    onBeforeDestroy: function () {
        this.callParent(arguments);
        this.editSurfaceParent.remove(this.toolbar);
    },

    /**
    * Returns the editor's toolbar. **This is only available after the editor has been rendered.**
    * @return {Ext.toolbar.Toolbar}
    */
    getToolbar: function () {
        return this.toolbar;
    },

    /**
    * @property {Object} buttonTips
    * Object collection of toolbar tooltips for the buttons in the editor. The key is the command id associated with
    * that button and the value is a valid QuickTips object. For example:
    *
    *     {
    *         bold : {
    *             title: 'Bold (Ctrl+B)',
    *             text: 'Make the selected text bold.',
    *             cls: 'x-html-editor-tip'
    *         },
    *         italic : {
    *             title: 'Italic (Ctrl+I)',
    *             text: 'Make the selected text italic.',
    *             cls: 'x-html-editor-tip'
    *         },
    *         ...
    */
    //<locale>
    buttonTips: {
        bold: {
            title: 'Bold (Ctrl+B)',
            text: 'Make the selected text bold.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        italic: {
            title: 'Italic (Ctrl+I)',
            text: 'Make the selected text italic.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        underline: {
            title: 'Underline (Ctrl+U)',
            text: 'Underline the selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        increasefontsize: {
            title: 'Grow Text',
            text: 'Increase the font size.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        decreasefontsize: {
            title: 'Shrink Text',
            text: 'Decrease the font size.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        backcolor: {
            title: 'Text Highlight Color',
            text: 'Change the background color of the selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        forecolor: {
            title: 'Font Color',
            text: 'Change the color of the selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        justifyleft: {
            title: 'Align Text Left',
            text: 'Align text to the left.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        justifycenter: {
            title: 'Center Text',
            text: 'Center text in the editor.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        justifyright: {
            title: 'Align Text Right',
            text: 'Align text to the right.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        insertunorderedlist: {
            title: 'Bullet List',
            text: 'Start a bulleted list.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        insertorderedlist: {
            title: 'Numbered List',
            text: 'Start a numbered list.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        createlink: {
            title: 'Hyperlink',
            text: 'Make the selected text a hyperlink.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        },
        sourceedit: {
            title: 'Source Edit',
            text: 'Switch to source editing mode.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
        }
    }

});