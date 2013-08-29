/**
 * @class Taco.view.site.page.Creator
 */
    Ext.define('Taco.view.site.page.Creator', {
        extend: 'Taco.core.ux.form.Editor',
        alias: 'widget.pagecreator',
        title: 'Create a New Page',
        model: 'Taco.model.CmsDocument',
        type: 'cmsdocument',
        requires: ['Taco.model.PageTypeDefinition'],
        initComponent: function () {
            var me = this;

            me.addEvents('documentcreated');

            me.actions = [{
                xtype: 'secondarybutton',
                text: 'Cancel',
                eventName: 'close'
            }, {
                xtype: 'dirtybutton',
                text: 'Save',
                eventName: 'superSaver'
            }];

            me.tabs = [
                {
                defaults: {
                    xtype: 'textfield',
                    labelAlign: 'top',
                    labelSeperator: '',
                    width: 425,
                    regex: /^[^&^/\^//^#^+%]+$/
                },

                items: [{
                    name: 'title',
                    fieldLabel: 'Page Name',
                    emptyText: "Name your page... Treat it like it's your first born, not your third"
                }, {
                    name: 'docInfo',
                    xtype: 'selectfield',
                    fieldLabel: 'Choose type',
                    mode: 'local',
                    valueField: 'id',
                    displayField: 'displayName',
                    width: 200,
                    emptyText: 'Select',
                    store: Ext.create('Ext.data.Store', {
                        model: 'Taco.model.PageTypeDefinition',
                        autoLoad:true,
                        filters: [
                            function (item) {
                                
                                return item.get('userCreatable')===true;
                            }
                        ]
                        
                    })
                }
                //, {
                //    name: 'displayInNavigation',
                //    xtype: 'checkbox',
                //    afterSubTpl: '<label style="font-size:0.8em;margin-left:16px;">Display in navigation</label>'
                //}
                ]
            }];

            me.callParent(arguments);
          
        },

        superSaver: function () {
            var me = this;
            var record = this.tabForm.getForm().getValues();

            var model = Ext.create(this.model, {
                documentType: record.docInfo.documentType,
                collectionName: record.docInfo.collectionName,
                name: record.title,
                items: [{
                    key: "title",
                    value: record.title
                },
                {
                    key: "meta_title",
                    value: record.title
                },
                {
                    key: "page_type_definition",
                    value: record.docInfo
                }
                ]
            });

            model.save({
                success: function () {
                    me.fireEvent('documentcreated', model);
                },
                failure: function () {
                    // TODO: Some stuff
                }
            });
        }
    });
