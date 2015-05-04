/**
 * @class  Taco.view.ipblocking.Edit
 */

Ext.define('Taco.view.ipblocking.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.ipblocking.Form',
    ],
    formCls: 'Taco.view.ipblocking.Form',
    title: 'IP Blocking',
    store: {
        type: 'Taco.store.IpBlocking'
    },
    initComponent: function () {
        this.callParent(arguments);
    }
});