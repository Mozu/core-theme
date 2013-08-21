Ext.define('Taco.view.site.navigation.PageCreator', {
    requires:['Taco.core.ux.window.MessageBox'],
    extend: 'Taco.core.ux.modal.SidebarModal',
    title: 'Add Page',
    layout: {
        type: 'vbox',
        align: 'top'
    },
    initComponent: function () {
        var me = this;
        this.form = Ext.widget({
            xtype: 'form',
            layout: {
                type: 'vbox',
                align: 'top'
            },
            items: [{
                xtype: 'box',
                html: '<div><div data-page-type="page">Page</div> <div data-page-type="blog">Blog Post</div><div data-page-type="link">Link</div></div>',
                listeners: {
                    click: {
                        element: 'el', 
                        fn: function (e) {
                            me.pageType = e.target.dataset.pageType;
                            me.down('#buttonContainer').show();
                            if (me.pageType == 'page') {
                                me.down('#pageContainer').show();
                                me.down('#linkContainer').hide();
                            } else {
                                me.down('#pageContainer').hide();
                                me.down('#linkContainer').show();
                            }
                        }
                    }
                }
            }, {
                xtype: 'container',
                itemId: 'pageContainer',
                hidden: true,
                items: [{
                    name: 'title',
                    xtype: 'textfield',
                    allowBlank:false,
                    fieldLabel: 'Page Name',
                    regex: /^[^&^/\^//^#^+%]+$/,
                    labelAlign: 'top',
                    width: '100%',
                    emptyText: "Name your page..."
                }, {
                    name: 'docInfo',
                    xtype: 'selectfield',
                    labelAlign: 'top',
                    allowBlank: false,
                    fieldLabel: 'Choose type',
                    mode: 'local',
                    valueField: 'id',
                    displayField: 'displayName',
                    width: 300,
                    emptyText: 'Select',
                    store: Ext.create('Ext.data.Store', {
                        model: 'Taco.model.PageTypeDefinition',
                        autoLoad: true,
                        filters: [function (item) {
                            return item.get('userCreatable') === true;
                        }
                        ]
                    })
                }
                ]
            }, {
                xtype: 'container',
                itemId: 'linkContainer',
                hidden: true,
                items: [{
                    name: 'linkLabel',
                    xtype: 'textfield',
                    fieldLabel: 'External Link',
                    labelAlign: 'top',
                    width: '100%',
                    emptyText: "Label"
                }, {
                    name: 'linkUrl',
                    hideLabel: true,
                    xtype: 'textfield',
                    width: '100%',
                    emptyText: "URL"
                }, {
                    xtype: 'checkbox',
                    name: 'openInNewWindow',
                    fieldLabel: 'Open in a new window',
                    labelAlign: 'top'
                }
                ]
            },
            {
                xtype: 'container',
                itemId: 'buttonContainer',
                hidden: true,
                layout:'hbox',
                items: [{
                    xtype: 'primarybutton',
                    text: 'save',
                    
                    listeners: {
                        click: function () {
                            me.superSaver();
                        }
                    }
                }, {
                    xtype: 'secondarybutton',
                    text: 'cancel',
                    listeners: {
                        click: function () {
                            me.fireEvent('cancel');
                        }
                    }
                }
                ]
            }
            ]
            
        });
        this.items = [this.form];
        this.callParent(arguments);
    },
    reset: function (config) {
        Ext.apply(this, config);
        this.form.getForm().reset();
    },
    superSaver: function () {
        var me = this,
            values = this.form.getValues(),
            titleField = this.form.getForm().findField('title'),
            docInfoField = this.form.getForm().findField('docInfo'),
            record;
        if (me.pageType == 'page') {
            if (!titleField.isValid() || !docInfoField.isValid()) {
                Ext.Taco.MessageBox.alert('error', 'missing required fields');
                return;
            }
            record = Ext.create('Taco.model.CmsDocument', {
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
            record.save({
                success: function () {
                    
                    var newNavRecord = Ext.create('Taco.model.NavigationTreeNode', {
                        'id': 'page^^' + record.get('collectionName') + '^^' + record.get('documentId'),
                        'originalId': record.get('documentId'),
                        'originalCollection': record.get('collectionName'),
                        'parentId': me.parentId,
                        'name': record.get('name'),
                        'nodeType': 'page',
                        'url': '/pages/' + record.get('name'),
                        'leaf': true,
                        'expanded': false,
                        'expandable': true,
                        'iconCls': 'taco-nav-node-page',
                        'allowDrag': true,
                        'isHidden': false,
                        'editAction': 'move'
                    });
                    me.fireEvent('save', me, newNavRecord);
                },
                failure: function () {
                    alert('failed');
                }
            });
        } else {
            record = Ext.create('Taco.model.NavigationTreeNode', {
                name: values.linkLabel,
                url: values.linkUrl,
                nodeType: 'link',
                iconCls: 'link',
                parentId: me.parentId,
                expanded: false,
                expandable: false
            });
            me.fireEvent('save', me, record);
        }
        
    }
});