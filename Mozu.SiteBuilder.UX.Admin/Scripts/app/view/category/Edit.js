/**
 * @class Taco.view.category.Edit
 */
    Ext.define('Taco.view.category.Edit', {
        extend: 'Taco.core.ux.form.Editor',
        requires: ['Taco.core.ux.CategoryComboBox', 'Taco.core.ux.form.SlugField', 'Taco.core.ux.form.SelectField', 'Taco.core.ux.action.DirtyButton', 'Ext.grid.NumberColumn'],
        title: 'New Category',
        model: 'Taco.model.Category',
        type: 'category',

        tabs: [{
            title: 'Basic Info',
            layout:{
                type:'vbox',
                align:'stretch'
            },
            flex:1,
            minWidth:500,
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                labelSeparator: '',
                componentCls: 'taco-form-field-float' //,
                //,width: 500
            },
            items: [{
                name: 'name',
                fieldLabel: 'Category Name',
                allowBlank: false,
                maxLength: 80,
                enforceMaxLength: true
            }, {
                xtype: 'categorycombobox',
                name: 'parentId',
                fieldLabel: 'Assign to Other Category',
                //                tpl: [
                //                    '<tpl for="."><li role="option" class="x-boundlist-item">',
                //                        '<tpl switch="display">',
                //                            '<tpl case=" ">&nbsp;',
                //                            '<tpl default>{display}',
                //                        '</tpl>',
                //                    '</li></tpl>'
                //                    ],
                validator: function (value) {
                    if (value == this.up().child('component[name="name"]').value) {
                        return 'Category name is in use';
                    }
                    else {
                        return true;
                    }
                }
            }, {
                xtype: 'textarea',
                rows: '10',
                name: 'description',
                fieldLabel: 'Description'//,
              //  width: 532
            }, /*{
                name: 'slug',
                fieldLabel: 'SEO Friendly URL',
                xtype: 'slugfield',
                slugPrefix: 'www.mystore.com/category/'
            }, {
                name: 'code',
                fieldLabel: 'Page Code'
            }, {
                name: 'pageTitle',
                fieldLabel: 'Page Title'
            }, {
                name: 'metaTitle',
                fieldLabel: 'Meta Title'
            }, {
                name: 'metaDescription',
                fieldLabel: 'Meta Description'
            }, {
                name: 'metaKeywords',
                fieldLabel: 'Keywords'
            },*/ {
                name: 'isHidden',
                xtype: 'checkboxfield',
                boxLabel: 'Hide Category'
            }]
        }],
     
        

        initComponent: function () {
            var me = this;
            me.on({
                load: {
                    fn: me.onLoad,
                    scope: me
                }
            });
            me.actions = [{
                xtype: 'selectfield',
                mode: 'local',
               // width: 150,
                value: "",
                store: [
                    ["", "More"], ["copyRecord", "Copy"], ["createRecord", "Create"], ["deleteRecord", "Delete"]],
                listeners: {
                    change: function () {
                        var val = this.getValue();
                        if (me[val]) {
                            me[val].call(me);
                        }
                    }
                }
            }, {
                xtype: 'secondarybutton',
                text: 'Cancel',
                eventName: 'cancel'
            }, {
                xtype: 'dirtybutton',
                text: 'Save',
                eventName: 'save'
            }];
            me.callParent(arguments);
        },

        onNavigate: function (newState) {
            // navigation events that i can totes handle include: 
            var md = newState.getMetaData();
            if (md.controller && md.controller === "categories" && (md.action === "index" || !md.action)) {
                this.destroy();
                return false;
            }
        },

        onLoad: function (record) {
            var me = this;
            if (record.get('id')) {
                me.setTitle('Category / ' + record.get('name'));
            }

            me.down('checkboxfield[name=isHidden]').on({
                change: function (inputHide, value) {
                    if (!value) {
                        return;
                    }
                    Ext.create('Taco.core.ux.modal.Confirmation', {
                        text: 'Are you sure you want to Hide this Category?',
                        autoShow: true,
                        listeners: {
                            cancel: function () {
                                inputHide.setValue(false);
                            }
                        }
                    });
                }
            });
            // TODO: find better fix
            // Ext.defer(function () {
            //     me.doLayout();
            // }, 1);
        },

        onFormStateChange: function (form) {
            if (!this.dirtyButton) {
                return;
            }
            if (!form || !form.isValid || !form.isDirty) {
                form = this.tabForm.getForm();
            }
            this.dirtyButton.setDirty(form.isValid() && form.isDirty());
        }

    });
