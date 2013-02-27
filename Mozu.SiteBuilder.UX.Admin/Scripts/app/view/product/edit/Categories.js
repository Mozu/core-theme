///**
// * @class Taco.view.product.edit.Categories
// */
//    Ext.define('Taco.view.product.edit.Categories', {
//        extend: 'Taco.core.ux.TreeList',
//        alias: 'widget.categoryselector',
//        requires: ['Taco.store.CategoriesTree'],
//        flex: 1,

//        initComponent: function () {
//            var me = this;
//            var sm = Ext.create('Ext.selection.CheckboxModel', { mode: 'SIMPLE' });
//            me.store = Taco.core.data.StoreManager.getOrCreate({ type: 'Taco.store.CategoriesTree', autoLoad: true, id: 'categoryselector' });
//            me.columns = [{
//                xtype: 'treecolumn',
//                text: 'Name',
//                flex: 1,
//                dataIndex: 'name'
//            }];
//            me.selModel = sm;
            
//            me.callParent(arguments);
//            me.on({
//                load: me.initChecked,
//                scope: this,
//                single: true
//            });

           
//        },
//        initChecked: function () {
//            var me = this, records=[], record;
//            if ( me.store.isLoading( )) {
//                me.store.on('load', this.initChecked, this, { single: true });
//                return;
//            }
//            if (!me.isTreeExpanded) {
//                me.isTreeExpanded = true;
//                me.store.getRootNode().expandChildren(true, this.initChecked, this);
//                return;
//            }
//            Ext.each(me.selected, function(id) {
//                record = me.store.getNodeById(id);
//                if (record) {
//                    records.push(record);
//                }
//            });
//            me.getSelectionModel().select(records);
           
//        }
//    });
