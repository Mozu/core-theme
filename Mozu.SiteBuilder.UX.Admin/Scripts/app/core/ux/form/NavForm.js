/**
 * @class Taco.core.ux.form.Form
 */
Ext.define('Taco.core.ux.form.NavForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.navform',
    requires: [],

    initComponent: function () {

        this.items = [{
            xtype: 'panel',
            manageHeight: false,
            items: this.items || [],
            dockedItems: [{
                xtype: 'container',
                dock: 'left',
                width: 200,
                items: [{
                    store: this.navStore,
                    xtype: 'dataview',
                    width: 180,
                    shadow: false,
                    x: 30,
                    y: 20,
                    floating: true,
                    itemId: 'navFormNav',
                    constrain: true,
                    cls: 'taco-form-card-nav-body',
                    autoShow: true,
                    style: "margin-top: 0px;",
                    itemSelector: '.taco-form-card-nav-link',
                    listeners: {
                        itemclick: this.onNavClick,
                        scope: this,
                    },
                    tpl: ['<ul ><tpl for=".">',
                        '<li class="taco-form-card-nav-link"  >{title}</li>',
                                            '</tpl></ul>'],

                }

                ]
            }]
        }];


        this.callParent(arguments);
        this.nav = this.down('#navFormNav');
    },
    onNavClick: function (view, record) {
        var wrapper, targetY;



        wrapper = Taco.app.viewPort.down('contentbody').getEl();

        if (record.raw.getEl) {
            targetY = record.raw.getEl().dom.offsetTop;
            wrapper.scrollTo('top', targetY, true);
        }
    }
});