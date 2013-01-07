/**
 * @class Taco.view.customers.AddressPanel
 */
	Ext.define('Taco.view.customers.AddressPanel', {
		extend: 'Taco.core.ux.form.Form',
		requires: ['Taco.core.ux.modal.Helper', 'Taco.view.address.AddressForm', 'Taco.store.CustomerAccountNotes'],
		margin: '25 0 0 0',

		initComponent: function () {
			var me = this;

			/**
			 * This is the action that is used to delete a Contact address. It doesn't currently work.
			 * @type {Taco.core.ux.action.Action}
			 */
			me.destroyer = Ext.create('Taco.core.ux.action.Action', {
                cls: 'taco-widget-delete',
                text: 'Delete',
				listeners: {
					click: function () {
						Ext.create('Taco.core.ux.modal.Confirmation', {
							text: 'No way Jose!',
                    		autoShow: true
						});
					}
				}
			});

			/**
			 * This action loads up the Taco.view.address.AddressForm view so that a Taco.model.Address
			 * can be edited.
			 * @type {Taco.core.ux.action.Action}
			 */
			me.edit = Ext.create('Taco.core.ux.action.Action', {
			    cls: 'taco-edit-widget',
                text: 'Edit',
			    listeners: {
			        click: function () {
			            Ext.create('Taco.core.ux.modal.Helper', {
			                form: {
			                    editors: ['Taco.view.address.AddressForm'],
			                    record: me.record
			                }
			            });
			        }
			    }
			});

			me.items = [{
				xtype: 'panel',
				layout: 'auto',
				defaults: {
                    xtype: 'component',
                    margin: '0 15 15 0',
                    border: true
				},
				items: [{
					xtype: 'container',
					items: [{
						xtype: 'toolbar',
						cls: 'taco-hint-actions',
						items: [me.edit, me.destroyer]
					}, {
						xtype: 'panel',
						defaults: {
							margin: '2 0 5 2'
						},
						items: [{
							html: (me.record.address1 || '') + (me.record.address2 || '') + (me.record.address3 || '')
						}, {
							html: me.record.cityOrTown + ', ' + me.record.stateOrProvince + ' ' + me.record.postalOrZipCode
						}, {
							html: me.record.countryCode
						}, {
							html: me.record.phoneNumber
						}]
					}]
				}]
			}];

			me.callParent(arguments);
		}
	});

