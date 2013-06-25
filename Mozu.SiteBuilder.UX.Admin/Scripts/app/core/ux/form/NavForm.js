/**
 * @class Taco.core.ux.form.Form
 */
Ext.define('Taco.core.ux.form.NavForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.navform',
    requires: [],
    sectionOffset: 39,
    enableScrollSpy: true,

    initComponent: function() {

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

        this.on({
            afterrender: this.onAfterRender,
            scope: this
        });
    },

    getWrapper: function () {
        if (!this.wrapper) {
            this.wrapper = Taco.app.viewPort.down('contentbody');
        }
        return this.wrapper;
    },

    onAfterRender: function () {
        if (!this.enableScrollSpy) return;

        this.getWrapper().on({
            afterlayout: this.rebuildMap,
            scope: this
        });

        this.getWrapper().getEl().on({
            scroll: this.checkTop,
            scope: this
        });

        this.rebuildMap();
    },

    rebuildMap: function () {
        this.locationMap = [];
        this.recordMap = [];

        if (!this.nav || !this.nav.store) return;
        
        this.nav.store.each(function (record, index) {
            var el = record.raw.getEl();

            if (!el) return;

            this.recordMap.push(record);
            
            if (index === 0) {
                this.locationMap.push(0);
                return;
            }

            this.locationMap.push(el.dom.offsetTop + this.sectionOffset);
        }, this);

        this.checkTop();
    },

    checkTop: function () {
        
        var scrollTop = this.getWrapper().getEl().dom.scrollTop,
            max,
            li,
            active;
        
        if (this.isHidden()) return;

        Ext.each(this.locationMap, function (top, index) {
            if (scrollTop >= top) max = index;
            else return false;
        }, this);

        active = this.nav.getEl().down('.active');

        if (active) active.removeCls('active');

        li = this.nav.getEl().query('li')[max];

        if (!li) return;

        Ext.fly(li).addCls('active');

    },

    onNavClick: function(view, record) {
        var wrapper = this.getWrapper().getEl(),
            targetY;

        if (record.raw.getEl) {
            targetY = view.store.indexOf(record)
                        ? record.raw.getEl().dom.offsetTop + this.sectionOffset
                        : 0;
            wrapper.scrollTo('top', targetY, true);
        }
    }
});