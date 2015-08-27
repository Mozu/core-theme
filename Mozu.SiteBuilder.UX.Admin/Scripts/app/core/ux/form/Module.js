/**
 * @author Travis Johnson
 * @class Taco.core.ux.form.Module
 */

Ext.define('Taco.core.ux.form.Module', {
    extend: 'Ext.container.Container',
    alias: 'widget.formmodule',

    componentCls: Taco.baseCSSPrefix + 'form-module',
    autoEl: 'section',
    width: 722,
    style: {
        position: 'relative'
    },

    closed: false,
    form: {},
    model: '',
    data: null,
    recordId: 0,
    header: [],
    footer: [],
    onRecordStoreLoad: Ext.emptyFn(),
    useModuleFrame: false,

    initComponent: function () {
        var me = this,
            initStore;

        if (!Ext.isEmpty(this.form)) {
            this.form = Ext.create('Ext.form.Panel', me.form);
        }

        if (!(this.useModuleFrame)) {
            this.addCls(Taco.baseCSSPrefix + 'form-module-locked');
        }

        this.moduleToggle = Ext.create('Ext.Component', {
            xtype: 'component',
            cls: Taco.baseCSSPrefix + 'module-toggle',
            html: this.closed ? 'Show' : 'Hide',
            listeners: {
                click: {
                    fn: this.expandCollapse,
                    scope: this,
                    element: 'el'
                }
            }
        });

        this.header = Ext.create('Ext.Container', {
            items: this.header.concat(this.moduleToggle),
            hidden: !(this.useModuleFrame),
            cls: Taco.baseCSSPrefix + 'form-module-header',
            layout: {
                type: 'auto',
                childEls: [],
                renderTpl: ['{%this.renderBody(out,values)%}']
            }
        });

        this.main = Ext.create('Ext.Container', {
            items: me.form,
            hideMode: 'offsets',
            hidden: this.useModuleFrame ? this.closed : false,
            cls: Taco.baseCSSPrefix + 'form-module-main'
        });

        this.summary = Ext.create('Ext.Container', {
            hideMode: 'offsets',
            hidden: this.useModuleFrame ? !(this.closed) : true,
            cls: Taco.baseCSSPrefix + 'form-module-summary'
        });

        this.footer = Ext.create('Ext.Container', {
            hidden: this.useModuleFrame ? this.closed : true,
            items: this.footer,
            hideMode: 'offsets',
            cls: Taco.baseCSSPrefix + 'form-module-footer',
            layout: {
                type: 'auto',
                childEls: [],
                renderTpl: ['{%this.renderBody(out,values)%}']
            }
        });

        this.items = [this.header, this.main, this.summary, this.footer];

        this.callParent(arguments);
    },

    expandCollapse: function () {
        if (this.closed) {
            this.main.show();
            this.footer.show();
            this.summary.hide();
            this.moduleToggle.getEl().setHTML('Hide');
            this.closed = false;
        } else {
            this.main.hide();
            this.footer.hide();
            this.summary.show();
            this.moduleToggle.getEl().setHTML('Show');
            this.closed = true;
        }
    }
});