Ext.define('Taco.view.site.navigation.PageCreator', {
    extend: 'Taco.view.site.ToolboxPanel',
    html: 'hey mom',
    title: 'foods',
    showInNav: false,
    layout: {
        type: 'vbox',
        align: 'top'
    },
    initComponent: function () {
        
        var me = this;
        this.form = Ext.widget(
            {
                xtype: 'form',
                layout: {
                    type: 'vbox',
                    align: 'top'
                },
                items: [
                    {
                        name: 'title',
                        xtype: 'textfield',
                        fieldLabel: 'Page Name',
                        regex: /^[^&^/\^//^#^+%]+$/,
                        labelAlign: 'top',
                        width: 300,
                        emptyText: "Name your page..."
                    }, {
                        name: 'docInfo',
                        xtype: 'selectfield',
                        labelAlign: 'top',
                        fieldLabel: 'Choose type',
                        mode: 'local',
                        valueField: 'id',
                        displayField: 'displayName',
                        width: 300,
                        emptyText: 'Select',
                        store: Ext.create('Ext.data.Store', {
                            model: 'Taco.model.PageTypeDefinition',
                            autoLoad: true,
                            filters: [function(item) {
                                return item.get('userCreatable') === true;
                            }
                            ]
                        })
                    }, {
                        xtype: 'primarybutton',
                        text: 'save',
                        listeners: {
                            click: function() {
                                me.superSaver();
                            }
                        }
                    }, {
                        xtype: 'secondarybutton',
                        text: 'cancel',
                        listeners: {
                            click: function() {
                                me.fireEvent('cancel');

                            }
                        }
                    }
                ]
            }
        );
        this.items = [
            this.form
        ];
        this.callParent(arguments);
    },
    reset:function(config) {
        Ext.apply(this, config);
        this.form.getForm().reset();
    },
    superSaver: function () {
        var me = this,
            values = this.form.getValues(),
             model = Ext.create('Taco.model.CmsDocument', {
                 documentType: values.docInfo.documentType,
                 collectionName: values.docInfo.collectionName,
                 name: values.title,
            items: [{
                key: "title",
                value: values.title
            }, {
                key: "meta_title",
                value: values.title
            }, {
                key: "page_type_definition",
                value: values.docInfo
            }
            ]
        });
        model.save({
            success: function () {
                me.fireEvent('save',me,model);
                 
            },
            failure: function () {
                alert('failed');
            }
        });
    }
});