/**
 * @class Taco.view.site.page.inlineeditors.InlineTags
 */
    Ext.define('Taco.view.site.page.inlineeditors.InlineTags', {
        extend: 'Taco.core.ux.form.BoxSelect',
        requires:['Ext.data.ArrayStore'],
        config: { editableElement: null, metaData: null, editSurfaceParent: null },

        cls: Taco.baseCSSPrefix + 'inlinefield-editor ' + Taco.baseCSSPrefix + 'inlinefield-tags ' + Taco.baseCSSPrefix + 'boxselect',

        emptyText: "Click here to add tags, homie!",

        forceSelection: false,
        createNewOnEnter: true,
        triggerOnClick: false,
        hideTrigger: true,
        displayField: 'tag',
        valueField: 'tag',
        shortField: 'tag',
        queryMode: 'local',
        store: new Ext.data.ArrayStore({
            fields: ['tag'],
            data: []
        }),

        initComponent: function () {
            var me = this,
            metaData = me.getMetaData(),
            editableElement = me.getEditableElement();

            if (me.sizingBox) {
                me.maxWidth = me.sizingBox.width;
                me.style = {
                    position: 'absolute',
                    left: (me.sizingBox.x   - 7) + 'px',
                    top: (me.sizingBox.y   - 3) + 'px'
                };
            }

            me.callParent(arguments);

            me.addEvents('beforecomplete', 'complete', 'cancel');

            me.on({
                valueschanged: function () {
                    console.log(me.rawValue.split(', '));
                },
                render: { fn: me.startEdit, scope: me },
                scope: me
            });
        },

        startEdit: function () {
            var me = this,
            taglinks = me.getEditableElement().query('a.tag'),
            tags = [];

            Ext.Array.each(taglinks, function (taglink) {
                tags.push(Ext.fly(taglink).getHTML());
            });

            me.setValue(tags.join(', '));
        },
        beforeCompleteEdit:function (){ return true;},
        attemptCompleteEdit: function () {
            var value = this.rawValue.length > 0 ? this.rawValue.split(', ') : [],
            metaData = this.getMetaData();

            if (this.fireEvent('beforecomplete', value, metaData, this) !== false) {
                if (value.length === 0) {
                    this.getEditableElement().setHTML(this.emptyText);
                } else {
                    this.getEditableElement().setHTML(Ext.Array.map(value, function (tag) {
                        return '<a class="tag" href="/blogs/tagged/' + tag + '">' + tag + '</a>';
                    }).join(', '));
                }
                this.fireEvent('complete', value, metaData, this); // using the getter in case a handler for beforecomplete changed anything!
            }
        }

    });
