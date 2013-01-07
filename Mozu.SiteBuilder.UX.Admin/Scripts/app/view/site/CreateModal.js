/**
 * @class Taco.view.site.CreateModal
 */
Ext.define('Taco.view.site.CreateModal', {
    extend: 'Taco.core.ux.modal.Mini',

    destroyOnHide: false,

    initComponent: function () {
        this.addCls(Taco.baseCSSPrefix + 'toolbar-modal');

        this.createContainer = Ext.create('Ext.panel.Panel', {
            // layout: { type: 'hbox', align: 'top' },
            defaults: {
                xtype: 'secondarybutton'
//                autoEl: {
//                    tag: 'a',
//                    href: '#'
//                }
            },
            items: [{
                text: 'Page',
                listeners: {
                    click: {
                        fn: function (e) {
                            e.stopEvent()
                            this.hide()
                            this.editor.createPage()
                        },
                        element: 'el'
                    },
                    scope: this
                }
            }, {
                text: 'External Link',
                listeners: {
                    click: {
                        fn: function (e) {
                            e.stopEvent()
                            this.cardPanel.getLayout().setActiveItem(1)
                        },
                        element: 'el'
                    },
                    scope: this
                }

            }]
        })

        this.shortcutForm = Ext.create('Taco.view.site.navigation.ExternalLinkEditor', {
            listeners: {
                aftersave: this.hide,
                scope: this
            }
        })

        this.cardPanel = Ext.create('Ext.panel.Panel', {
                layout: 'card',
                items: [this.createContainer, this.shortcutForm]
            }
        )

        this.callParent(arguments)

        this.content.add(this.cardPanel);

        this.on({
            beforeshow: function () {
                this.shortcutForm.getForm().reset()
                this.shortcutForm.isEditMode = false
            },
            afterhide: function () {
                this.cardPanel.getLayout().setActiveItem(0)
            },
            scope: this
        })
    },

    loadLink: function (record, target, position) {

        this.show(target, 'r-l', position)
        this.cardPanel.getLayout().setActiveItem(1)
        this.shortcutForm.getForm().setValues({
            name: record.get('name'),
            url: record.get('url')
        })
        this.shortcutForm.record = record
        this.shortcutForm.isEditMode = true
    }
})