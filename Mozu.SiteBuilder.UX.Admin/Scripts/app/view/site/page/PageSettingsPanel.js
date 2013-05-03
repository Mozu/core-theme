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
    initComponent: function () {
        var me = this;
        if (!this.form || !this.record) return Ext.Error.raise('Instance of PageSettingsPanel requires a .form configuration. and a record.');
        if (this.form.loadRecord) {
            this.form.loadRecord(this.record);
        } else {
            this.form.record = this.record;
        }

        this.form.header = false;

        this.tbar = [{
            xtype: 'action',
            text: 'back',
            click: {
                fn: function () { me.hide(); }
            }
        }, '->', {
            xtype: 'tbtext',
            text: this.title
        }];

        this.form.fbar = [{
            xtype: 'secondarybutton',
            text: 'Cancel',
            listeners: {
                click: this.hide,
                scope: this
            }
        }, {
            xtype: 'dirtybutton',
            text: 'Apply',
            itemId: 'pageSettingsPanelDirtyButton',
            listeners: {
                click: function () {
                    this.form.updateForm();
                },
                scope: this
            }
        }];
        this.form = Ext.widget('formform', this.form);
        this.dirtyButton = this.form.down('#pageSettingsPanelDirtyButton');
        this.form.on({
            savablestatechange: function(form, isSavable) {
                this.dirtyButton.setDirty(isSavable);
            },
            savesuccess: function() {
                console.log('savesuccess');
                //this.dirtybutton.setLoading(false);
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