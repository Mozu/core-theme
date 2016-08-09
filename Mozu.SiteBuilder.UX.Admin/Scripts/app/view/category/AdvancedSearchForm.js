/**
 * @class Taco.view.category.AdvancedSearchForm
 */
Ext.define('Taco.view.category.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.field.ComboBox',
        //'Taco.core.ux.form.field.AdminUser',
        'Ext.ux.form.field.BoxSelect',
        'Ext.form.FieldContainer'
        //'Taco.core.ux.form.DateTime'
    ],
    defaults: {
        width: 500,
        xtype: 'textfield'
    },

    initComponent: function () {
        var me = this;
        this.items = [
            {
                name: 'keyword',
                flex: 1,
                fieldLabel: 'Keyword'
            }, {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                items: [
                    me.createStaticCombobox('status', 'Status', [
                        {
                            name: 'Active',
                            id: 'Active'
                        }, {
                            name: 'Disabled',
                            id: 'Disabled'
                        }, {
                            name: 'All',
                            id: 'All'
                        }
                        ], 0)
                ]
            }, {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                items: [
                    me.createStaticCombobox('hiddenOnStorefront', 'Hidden on Storefront', [
                        {
                            name: 'Yes',
                            id: 'Yes'
                        }, {
                            name: 'No',
                            id: 'No'
                        }
                        ], 0)
                ]
            }
        ];

        this.callParent(arguments);
    },

    createStaticCombobox: function (name, label, data, marginRight) {
          return {
              xtype: 'combobox',
              name: name,
              fieldLabel: label,
              margin: {right: marginRight},
              width: '100%',
              valueField: 'id',
              displayField: 'name',
              queryMode: 'local',
              valueNotFoundText: 'not found',
              editable: false,
              forceSelection: true,
              trigger2Cls: 'x-form-clear-trigger',
              onTrigger2Click: function () {
                  this.clearValue();
              },
              store: Ext.create('Ext.data.Store', {
                  fields: ['id', 'name'],
                  data: data
              })
          };
      }
  }
);