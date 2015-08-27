/**
 * @class Taco.view.navigation.PrimarySubMenuItem
 */
    Ext.define('Taco.view.navigation.PrimarySubMenuItem', {
        extend: 'Ext.Component',

        autoEl: {
            tag: 'li',
            cls: 'taco-primary-submenu-item'
        },
        text: '',
        address: '#',

        tpl: '<a href="{address}">{text}</a>',

        initComponent: function () {
            var me = this;

            Ext.apply(this, {
                listeners: {
                    click: {
                        fn: me.onClick,
                        element: 'el'
                    }
                }
            });

            this.callParent(arguments);

            me.address = me.data.address;
        },

        onClick: function (e) {
            e.preventDefault();
            e.stopPropagation();
            Taco.core.StateManager.attemptNavigate(e.target.href);
            return false;
        }
    });
