
Ext.define('Taco.core.ux.card.Tab', {
    extend: 'Ext.Component',
    alias: 'widget.taco-cardtab',

    tpl: [
        '<a class="tab {activeCls}" href="#">{title}</a>',
    ],

    initComponent: function () {

        this.data = {
            title: this.title,
            activeCls: this.active ? 'active' : ''
        };

        this.callParent(arguments);

    },

    activate: function () {
        this.getEl().down('.tab').addCls('active');
    },

    deactivate: function () {
        this.getEl().down('.tab').removeCls('active');
    }
});