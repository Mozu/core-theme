/**
 * @class Taco.view.site.navigation.ExternalLinkEditor
 */
Ext.define('Taco.view.site.navigation.ExternalLinkEditor', {
    extend: 'Taco.core.ux.form.Form',

   // title: 'External Link Configurator',
    isEditMode: true,

    navigationStoreId: 'navigationTreeNodeStore',
    navigationParentNodeId: '_unlinked',
    modelType: 'Taco.model.NavigationTreeNode',
    nodeType: 'link',
    iconCls: 'link',
    width: 300,
   // height: 300,
    layout:{type:'auto'},
    initComponent: function () {
        this.addEvents('save');

        this.items = [{
            xtype: 'textfield',
            name: 'name',
            emptyText: 'Label',
            fieldStyle: {
                width:'100%'
            },
            width:250,
            flex: 1
        }, {
            xtype: 'textfield',
            name: 'url',
            emptyText: 'URL',
            fieldStyle: {
                width: '100%'
            },
            width: 250,
            flex: 1
        }, {
            xtype: 'container',
            items: [{
                xtype: 'action',
                text: 'Cancel',
                click: {
                    fn: function () {
                        this.fireEvent('cancel');
                    },
                    scope: this
                }
            }, {
                xtype: 'primarybutton',
                text: 'Save',
                click: {
                    fn: function () {
                        this.updateForm();
                    },
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
            
        }
        this.fireEvent('save', this, this.record);
        
    }
})