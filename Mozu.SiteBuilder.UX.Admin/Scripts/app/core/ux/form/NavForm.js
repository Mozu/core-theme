/**
 * @class Taco.core.ux.form.Form
 */
Ext.define('Taco.core.ux.form.NavForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.navform',
    requires: [],

    initComponent: function() {

        //this.nav = Ext.widget();

        this.formContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-form-nav-container'
        });

        this.items = [{
            xtype: 'dataview',
            store: this.navStore,
            itemId: 'navFormNav',
            cls:'taco-form-nav',
            autoShow: true,
            itemSelector: '.taco-form-nav-link',
            listeners: {
                itemclick: this.onNavClick,
                scope:this
            },
            tpl: [
                '<ul>',
                    '<tpl for=".">',
                        '<li class="taco-form-nav-link">{title}</li>',
                    '</tpl>',
                '</ul>'
            ]
        },
            this.formContainer
        ];

        this.callParent(arguments);

        this.nav = this.down('#navFormNav');
    },

    onNavClick: function(view, record) {
        var wrapper = Taco.app.viewPort.down('contentbody').getEl(),
            offset = 39,
            targetY;

        if (record.raw.getEl) {
            targetY = view.store.indexOf(record)
                        ? record.raw.getEl().dom.offsetTop + offset
                        : 0;
            wrapper.scrollTo('top', targetY, true);
        }
    }
});