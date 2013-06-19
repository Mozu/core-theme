/**
 * @class Taco.view.site.page.PageSettingsPanel
 */
Ext.define('Taco.view.site.page.PageSettingsPanel', {
    extend: 'Taco.core.ux.modal.SidebarModal',
    xtype: 'widget.pagesettingspanel',
    isPageSettingsPanel: true,
    header: false,

    requires: ['Taco.core.ux.form.Form'],
    cls: Taco.baseCSSPrefix + 'card-flex ' + Taco.baseCSSPrefix + 'navigation ' + Taco.baseCSSPrefix + 'pagesettings',

    applyChanges: function() {
        this.form.updateForm();
    },

    cancelChanges: function() {
        this.form.reset();
        this.hide();
    },

    initComponent: function () {
        var me = this;
        if (!this.form || !this.record) return Ext.Error.raise('Instance of PageSettingsPanel requires a .form configuration. and a record.');
        if (this.form.loadRecord) {
            this.form.loadRecord(this.record);
        } else {
            this.form.record = this.record;
        }

        this.form.header = false;

        this.form.cls = Taco.baseCSSPrefix + "pagesettings-form";

        this.tbar = [{
            xtype: 'action',
            cls: Taco.baseCSSPrefix + 'pagesettings-back-action',
            text: '',
            click: {
                fn: function () { me.hide(); }
            }
        }, {
            xtype: 'tbtext',
            text: this.title
        }];

        this.bbar = ['->',{
            xtype: 'secondarybutton',
            text: 'Cancel',
            listeners: {
                click: this.cancelChanges,
                scope: this
            }
        }, {
            xtype: 'dirtybutton',
            text: 'Apply',
            itemId: 'pageSettingsPanelDirtyButton',
            listeners: {
                click: this.applyChanges,
                scope: this
            }
        }];
        
        this.form = Ext.widget('formform', this.form);
        this.form.on({
            savablestatechange: function (form, isSavable) {
                this.dirtyButton = this.dirtyButton || this.dockedItems.items[1].items.items[2]; // TODO: wat
                this.dirtyButton.setDirty(isSavable);
            },
            savesuccess: function() {
                console.log('savesuccess');
                this.dirtyButton.setDirty(false);
            },
            scope: this
        });
        this.items = [this.form];
        this.callParent(arguments);
    },

    hide: function() {
        this.form.resetOriginalValues();
        this.callParent(arguments);
    }

});