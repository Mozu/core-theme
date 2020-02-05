Ext.define('Taco.view.order.widget.TransferShipmentGrid', {
    extend: 'Ext.tree.Panel',

    requires: [
        'Ext.data.*',
        'Ext.grid.*',
        'Ext.tree.*',
        'Taco.model.TransferShipmentTree'
    ],
    xtype: 'tree-grid',

    cls: 'shipment-transfer-grid',
    useArrows: true,
    rootVisible: false,
    multiSelect: false,
    singleExpand: true,
    //lines:true,
    //autoScroll: true,
    scroll: 'vertical',
    overflowY: 'auto',

    initComponent: function () {

        Ext.apply(this, {
            store: new Ext.data.TreeStore({
                model: 'Taco.model.TransferShipmentTree',
                root: this.getTransferShipmentTreeItems()
            }),
            columns: [
            {
                text: 'No.',
                dataIndex: 'no',
                sortable: true,
                width:50
            },
            {
                xtype: 'treecolumn', //this is so we know which column will show the tree
                width:30
                },                
                {
                    text: 'Shipment Number',
                    width:140,
                    dataIndex: 'shipmentNumber',
                    renderer: function (value, row) {
                        if (value)
                            return '<a href="#' + row.record.get('shipmentCardId') + '" style="text-decoration: underline;color:blue;" >' + value + '</a>';
                        else
                            return '';
                    }
                },
                {
                    text: '',
                    width: 40,
                    dataIndex: 'rowIcon'
                },
                {
                    text: 'Image',
                    flex: 1,
                    dataIndex: 'image',
                    renderer: function (value) {
                        if (value)
                            return '<img src="' + value + '" style="width:40px;height:40px;"/>';
                        else
                            return '';
                    }
                },
                {
                    text: 'Name',
                    flex: 2,
                    dataIndex: 'name'
                },
                {
                    text: 'Qty',
                    flex: 1,
                    sortable: true,
                    dataIndex: 'quantity'
                },
                {
                    text: '',
                    flex: 6
                }
            ]
        });
        this.callParent();
    },

    getTransferShipments: function () {
        var transferShipments = [];
        var originalShipments = this.record.get('shipments');
        if (originalShipments.length > 0) {
            for (var count = 0; count < originalShipments.length; count++) {
                if (this.shipmentRecord.transferShipmentNumbers.includes(originalShipments[count].number)) {
                    transferShipments.push(originalShipments[count]);
                }
            }
        }
        return transferShipments;
    },

    getTransferShipmentTreeItems: function () {
        var shipments = this.getTransferShipments();
        var treeItems = [];
        for (var shipmentCount = 0; shipmentCount < shipments.length; shipmentCount++) {
            var treeItem = {};
            treeItem.no = treeItems.length + 1;
            treeItem.task = '';
            treeItem.shipmentNumber = shipments[shipmentCount].number;
            treeItem.rowIcon = '<i class="fal fa-box"></i>';
            treeItem.shipmentCardId = shipments[shipmentCount].shipmentCardId;
            treeItem.children = [];
            if (shipments[shipmentCount].items) {
                for (var shipmentItemCount = 0; shipmentItemCount < shipments[shipmentCount].items.length; shipmentItemCount++) {
                    treeItem.children.push({
                        image: shipments[shipmentCount].items[shipmentItemCount].imageUrl,
                        name: shipments[shipmentCount].items[shipmentItemCount].name,
                        quantity: shipments[shipmentCount].items[shipmentItemCount].quantity,
                        rowIcon: '<i class="fal fa-box-open"></i>',
                        leaf: true
                    });
                }
            }
            treeItems.push(treeItem);
        }
        return {
            "children": treeItems
        };
    }
});