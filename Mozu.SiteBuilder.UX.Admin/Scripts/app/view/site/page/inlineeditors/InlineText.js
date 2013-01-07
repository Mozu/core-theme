/**
 * @class Taco.view.site.page.inlineeditors.InlineText
 */
    Ext.define('Taco.view.site.page.inlineeditors.InlineText', {
        extend: 'Ext.form.field.TextArea',
        mixins: ['Taco.core.util.GetsTextFormat'],

        config: { editableElement: null, metaData: null, editSurfaceParent: null },

        staticStyleProperties: {
            "background-color": "rgba(255,255,255,.8)",
            "box-shadow": "none"
        },

        cls: Taco.baseCSSPrefix + 'inlinefield-editor ' + Taco.baseCSSPrefix + 'inlinefield-textarea',

        grow: true,
        growAppend: "\s-",
        enableKeyEvents: true,
        enterIsSpecial: true,

        emptyText: "Click here to add text",

        initComponent: function () {
            var me = this, metaData = me.getMetaData(), editableElement = me.getEditableElement();

            if (me.sizingBox) {
                me.width = me.sizingBox.width;
                me.height = me.sizingBox.height;
                me.style = {
                    position: 'absolute',
                    left: (me.sizingBox.x  - 7) + 'px',
                    top: (me.sizingBox.y - 3) + 'px'
                };
            }

            if (!editableElement) {
                return Ext.Error.raise('An inline editor field was created without an editable element in the document to bind to.');
            }

            editableElement.setVisibilityMode(Element.VISIBILITY);

            me.startValue = me.value = editableElement.getHTML().trim();
            me.emptyText = metaData.editDefault || me.emptyText;

            if (me.startValue === me.emptyText) {
                me.value = '';
            }

            me.fieldStyle = me.extractStyle();

            me.callParent(arguments);


            me.addEvents('beforecomplete', 'complete', 'cancel');

            me.on({
                keyup: { fn: me.onKeyUp, scope: me },
                specialkey: { fn: me.onSpecialKey, scope: me },
                render: { fn: me.startEdit, scope: me }
            });


        },
        cancelEdit: function () {

            this.getEditableElement().setHTML(this.startValue);
            this.fireEvent('cancel', this);
            this.hide();
        },

        beforeCompleteEdit:function (){ return true;},

        attemptCompleteEdit: function () {
            var value = this.getValue().trim(), metaData = this.getMetaData(), persistValue = value;
            if (value === this.startValue) {
                return this.cancelEdit();
            }
            if (this.fireEvent('beforecomplete', persistValue, metaData, this) !== false) {
                if (value.length === 0 && this.emptyText) {
                    value = this.emptyText;
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

        extractStyle: function () {
            var fieldStyle = Ext.apply(this.extractTextFormatting(this.getEditableElement()), this.staticStyleProperties);
            fieldStyle.padding = "4px 8px";
            return fieldStyle;
        },

        onKeyUp: function () {
            this.getEditableElement().setHTML(this.getValue());
        },

        onSpecialKey: function (field, e) {
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
            this.focus(false);
            this.editing = true;
            this.fireEvent('startedit', this);

        }

    });

