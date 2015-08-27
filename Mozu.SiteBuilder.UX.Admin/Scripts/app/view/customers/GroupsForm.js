///**
// * @class Taco.view.customers.GroupsForm
// * This allows a Taco.model.CustomerGroup to be assigned to a Customer. You can also add and delete Taco.model.CustomerGroup's
// * from this form.
// */
//Ext.define('Taco.view.customers.GroupsForm', {
//	extend: 'Taco.core.ux.form.Form',
//	requires: ['Taco.store.CustomerGroups', 'Taco.core.ux.BaseGrid', 'Taco.core.ux.QuickAdder', 'Taco.model.CustomerGroup'],

//	initComponent: function () {
//		var me = this;

//		me.store = Ext.create('Taco.store.CustomerGroups', {
//			autoLoad: true
//		});

//		me.basegrid = Ext.create('Taco.core.ux.BaseGrid', {

//			store: me.store,
//			columns: [{
//				xtype: 'checkcolumn',
//				width: 50,
//				margin: '0 0 0 0'
//			}, {
//				xtype: 'gridcolumn',
//                dataIndex: 'name',
//				text: 'Group Name',
//				flex: 1
//			}],

//			actions: [{
//                tooltip: 'Delete',
//                iconCls: 'taco-action-delete',
//                eventName: 'deletegroup'
//            }],

//			dockedItems: [{
//				xtype: 'quickadder',
//                dock: 'top',
//				helperText: 'Click to add a new group'				
//			}],

//			listeners: {
//				deletegroup: function (list, index, index2, actionEl, e, model) {
//	            	var me = this,
//	            		done = function () {
//                            me.setLoading(false);
//                        };

//	                me.setLoading(true);
//                    model.remove();
//                    me.store.sync({ success: done, failure: done, scope: this });
//                }
//			}
//		});

//		me.items = [{
//			items: [{
//				xtype: 'textfield',
//				emptyText: 'Search'
//			}],
//			layout: 'fit'
//		}, me.basegrid];

//		me.callParent(arguments);

//        me.down('quickadder').on({
//            commit: function (quickAdder, newGroupName) {
//            	var me = this,
//            		done = function () {
//	                	me.setLoading(false);
//	                	me.store.load();
//	                };

//                me.setLoading(true);

//                var model = Ext.create('Taco.model.CustomerGroup', { name: newGroupName });
//                model.save({ success: done, failure: done });
//            },
//            scope: me.basegrid
//        });
//	},

//	update: function () {
//		var me = this;

//		console.log('saved!', arguments);
//		console.log('form', me.panel.getValues());

//		me.callParent(arguments)
//	}
//});
