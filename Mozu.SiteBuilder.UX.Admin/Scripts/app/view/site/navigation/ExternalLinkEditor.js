/**
 * @class Taco.view.site.navigation.ExternalLinkEditor
 */
Ext.define('Taco.view.site.navigation.ExternalLinkEditor', {
    extend: 'Ext.form.Panel',

    title: 'External Link Configurator',
    isEditMode: false,

    navigationStoreId: 'navigationTreeNodeStore',
    navigationParentNodeId: 'group^^nav',
    modelType: 'Taco.model.NavigationTreeNode',
    nodeType: 'link',
    iconCls: 'link',

    initComponent: function () {
        this.addEvents('aftersave')

        this.items = [{
            xtype: 'textfield',
            name: 'name',
            emptyText: 'Link name...',
            flex: 1
        }, {
            xtype: 'textfield',
            name: 'url',
            emptyText: 'http://',
            flex: 1
        }, {
            xtype: 'container',
            items: [{
                xtype: 'action',
                text: 'Cancel',
                click: {
                    fn: function () {
                        this.up().getLayout().setActiveItem(0);
                    },
                    scope: this
                }
            }, {
                xtype: 'primarybutton',
                text: 'Save',
                click: {
                    fn: this.save,
                    scope: this
                }
            }]
        }]

        this.callParent(arguments)
    },

    save: function () {
        var store,
            values = this.getForm().getFieldValues()
        
        if (this.isEditMode) {
            this.getForm().updateRecord(this.record)
        } else {
            this.record = Ext.create(this.modelType, {
                name: values.name,
                url: values.url,
                nodeType: this.nodeType,
                iconCls: this.iconCls
            })
            Ext.data.StoreManager
                .get(this.navigationStoreId)
                .getById(this.navigationParentNodeId)
                .appendChild(this.record)
        }
        this.fireEvent('aftersave')
    }
})