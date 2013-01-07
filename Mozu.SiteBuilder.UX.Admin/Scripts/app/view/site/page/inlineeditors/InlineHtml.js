/**
 * @class Taco.view.site.page.inlineeditors.InlineHtml
 */
    Ext.define('Taco.view.site.page.inlineeditors.InlineHtml', {
        extend: 'Taco.core.ux.tinymce.TinyMCE',

        config: { editableElement: null, metaData: null, editSurfaceParent: null },

        cls: Taco.baseCSSPrefix + 'inlinefield-editor ' + Taco.baseCSSPrefix + 'inlinefield-tinymce',

        tinymceConfig: {
            theme_advanced_toolbar_location: 'external',
            content_css: "/resources/stylesheets/textonly.less"
        },

        initComponent: function () {
            var me = this, metaData = me.getMetaData(), editableElement = me.getEditableElement();


            if (me.sizingBox) {
                me.width = me.sizingBox.width;
                me.height = me.sizingBox.height;
                me.style = {
                    position: 'absolute',
                    left: me.sizingBox.x + 'px',
                    top: me.sizingBox.y + 'px'
                };

            }

            if (!editableElement) {
                return Ext.Error.raise('An inline editor field was created without an editable element in the document to bind to.');
            }

            editableElement.setVisibilityMode(Element.VISIBILITY);


            me.startValue = me.value = editableElement.getHTML().trim();
            if (me.startValue === metaData.editDefault) {
                me.value = '';
            }


            me.callParent(arguments);

            // debugging
            window.eds = window.eds || [];
            window.eds.push(me);

            me.addEvents('complete', 'cancel');

            me.throttledResize = Ext.Function.createThrottled(me.onOverflowContent, 333, me);

            me.on({
                keyup: { fn: me.onKeyUp, scope: me },
                specialkey: { fn: me.onSpecialKey, scope: me },
                render: { fn: me.startEdit, scope: me },
                insert: { fn: me.onKeyUp, scope: me}
            });

        },

        cancelEdit: function () {
            this.getEditableElement().setHTML(this.startValue);
            this.fireEvent('cancel', this);
            this.hide();
        },
        //        beforeCompleteEdit: function () {
        //            if (!this.fireEvent('beforecompleteedit', this)) {
        //                return false;
        //            }
        //            return true;

        //        },
        attemptCompleteEdit: function () {
            var value = this.getValue().trim(), metaData = this.getMetaData(), persistValue = value;
            if (value === this.startValue) {
                return this.cancelEdit();
            }
            if (this.fireEvent('beforecomplete', persistValue, metaData, this) !== false) {
                if (value.length === 0 && metaData.editDefault) {
                    value = metaData.editDefault;
                }
                this.getEditableElement().setHTML(value);
                this.fireEvent('complete', this.getValue().trim(), metaData, this); // using the getter in case a handler for beforecomplete changed anything!
            }
        },

        destroy: function () {
            // we may be destroying because the document has unloaded and the editableElement is no longer with us
            try {
                this.getEditableElement().show();
            } catch (e) { }
            this.callParent(arguments);
        },

        hide: function () {
            this.getEditableElement().show();
            this.callParent(arguments);
        },

        onKeyUp: function () {
            this.getEditableElement().setHTML(this.getValue());
            this.throttledResize();
        },

        onOverflowContent: function () {
            var box = this.getEditableElement().getBox();
            this.editor.theme.resizeTo(box.width, box.height);
        },

        onSpecialKey: function (e) {
            switch (e.getKey()) {
                case e.ENTER:
                    this.attemptCompleteEdit();
                    break;
                case e.ESC:
                    this.cancelEdit();
                    break;
                default:
                    break;
            }
        },

        startEdit: function () {

            this.getEditableElement().hide();
            this.focus();
            this.editing = true;
            this.fireEvent('startedit', this);

        }

    });

