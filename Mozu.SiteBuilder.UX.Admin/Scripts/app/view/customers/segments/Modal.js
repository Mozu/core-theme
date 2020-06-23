



Ext.define('Taco.view.customers.segments.Modal', {
  extend: 'Taco.core.ux.window.Modal',
  requires: [
    'Ext.grid.Panel',
    'Ext.selection.CheckboxModel'
  ],

  autoShow: true,
  closeAction: 'destroy',
  primaryText: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.apply,
  scale: 'medium',
  title: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.select_segments,

  layout: {
    type: 'fit'
  },

  initComponent: function() {
      this.selModel = Ext.create('Ext.selection.CheckboxModel', {
        selType: 'checkboxmodel',
        checkOnly: true,
        showHeaderCheckbox: true
      });


      this.gridPager = Ext.create('Taco.core.ux.grid.LinkPaging', {
          store: this.store,
          displayInfo: true,
          dock: 'bottom',
          componentCls: 'x-link-paging-toolbar'
      });

      this.grid = Ext.create('Ext.grid.Panel', {
        rootVisible: false,
        store: this.store,
        selModel: this.selModel,
        viewConfig: {
          stripeRows: false
        },
        dockedItems: [
            this.gridPager
        ],
        columns: [{
            dataIndex: 'code',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.code,
            width: 80
        }, {
            dataIndex: 'name',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.name,
            minWidth: 120,
            resizable: false
        }, {
            dataIndex: 'description',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.description,
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