



Ext.define('Taco.view.customers.segments.Modal', {
  extend: 'Taco.core.ux.window.Modal',
  requires: [
    'Ext.grid.Panel',
    'Ext.selection.CheckboxModel'
  ],

  autoShow: true,
  closeAction: 'destroy',
  primaryText: 'Apply',
  scale: 'medium',
  title: 'Select Segments',

  layout: {
    type: 'fit'
  },

  initComponent: function() {
      this.selModel = Ext.create('Ext.selection.CheckboxModel', {
        selType: 'checkboxmodel',
        checkOnly: true,
        showHeaderCheckbox: true
      });


      this.gridPager = Ext.create('Ext.toolbar.Paging', {
          store: this.store,
          displayInfo: true,
          dock: 'bottom'
      });

      this.grid = Ext.create('Ext.grid.Panel', {
        rootVisible: false,
        store: this.store,
        selModel: this.selModel,
        dockedItems: [
            this.gridPager
        ],
        columns: [{
            dataIndex: 'code',
            text: 'Code',
            width: 80
        }, {
            dataIndex: 'name',
            text: 'Name',
            minWidth: 120,
            resizable: false
        }, {
            dataIndex: 'description',
            text: 'Description',
            width: 70,
            flex: 1
        }]
    });

    this.items = [this.grid];

    this.callParent(arguments);
  },

  doSave: function() {
    var selection = this.selModel.getSelection();
    this.saveSuccess(selection);
  }
})