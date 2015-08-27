Ext.define('Taco.view.website.PageCreateDialog', {
    extend: 'Taco.core.ux.window.Modal',
    scale: 'medium',
    title: 'Add an Item',
    autoShow: true,

    initComponent: function () {
        var me = this,
            pageTypeDefinitionStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.PageTypeDefinitions'),
            dialog;

        pageTypeDefinitionStore.filter([{ property: "userCreatable", value: true }]);
        me.items = [
            {
                xtype: 'form',
                items: [
                    {
                        xtype: 'textfield',
                        allowBlank: false,
                        allowOnlyWhitespace: false,
                        name: 'title',
                        width: '100%',
                        fieldLabel: 'Item Title',
                        listeners: {
                            change: function (cmp, newValue) {
                                cmp.slugField = cmp.slugField || cmp.up('form').down('taco-slugfield');
                                var previous = cmp.slugField.onNameChangeValue,
                                    current = cmp.slugField.getValue(),
                                    newValue;
                                if (current && previous != current) {
                                    return;
                                }
                                cmp.slugField.setValue(newValue);
                                cmp.slugField.onNameChangeValue = cmp.slugField.getValue();
                            }
                        }
                    },
                    {
                        xtype: 'taco-slugfield',
                        allowBlank: false,
                        allowOnlyWhitespace: false,
                        name: 'name',
                        width: '100%',
                        fieldLabel: 'Page Url'
                    }, {
                        name: 'docInfo',
                        xtype: 'selectfield',
                        fieldLabel: 'Choose type',
                        queryMode: 'local',
                        valueField: 'id',
                        displayField: 'title',
                        width: '100%',
                        emptyText: 'Select',
                        store: pageTypeDefinitionStore
                    }
                ]
            }
        ];
        me.on({
            beforesave: {
                scope: this,
                fn: function (dialog) {
                    var values = dialog.getForm().getValues(),
                        //docInfo =dialog.getForm().getForm().findField('docInfo'),
                        //name= values.name,
                        //title= values.title,
                        cmsDoc;

                    cmsDoc = Ext.create('Taco.model.CmsDocument', {
                        //  documentTypeFQN: values.docInfo.documentTypeFQN,
                        //    listFQN: values.docInfo.listFQN,
                        name: values.name,
                        properties: {
                            "title": values.title,
                            "meta_title": values.title,
                            "page_type_definition": values.docInfo,
                            "link_title": values.title
                        }
                    });

                    cmsDoc.save({
                        success: function (cmsRecord) {

                            var navRecord = Ext.create('Taco.model.NavigationTreeNode', {
                                id: 'page^^' + cmsRecord.get('listFQN') + '^^' + cmsRecord.get('id'),
                                editAction: 'move',
                                nodeType: 'page',
                                originalDocumentListName: cmsRecord.get('listFQN'),
                                url: '/' + cmsRecord.get('name'),
                                name: values.title
                            });
                            navRecord.setDirty();
                            parentRecord.appendChild(navRecord);
                            navRecord.save();

                            //parentRecord
                            me.fireEvent('pagecreate', navRecord);

                            dialog.saveSuccess();
                        },
                        failure: function () {
                            Taco.app.fireEvent('setmessage', "Error creating page", 'error');
                        }
                    });

                    return false;
                }
            }
        });
    },

});