
/**
 * @class Taco.view.site.navigation.ExternalLinkEditor
 */
Ext.define('Taco.view.website.misc.ExternalLinkEditor', {
    extend: 'Taco.core.ux.window.Modal',
    autoShow: true,   
    initComponent: function () {
       
        this.record = this.record || Ext.create('Taco.model.NavigationTreeNode', {
            nodeType: 'link',
            iconCls: 'link',
            parentId: this.parentRecord == null ? null : this.parentRecord.getId()
        });
        this.record.set('editAction', 'rename');


        this.form = Ext.widget({
            xtype: 'formform',
            record: this.record,
            items: [{
                    xtype: 'textfield',
                    fieldLabel: 'Navigation Link Name',
                    name: 'name',
                    emptyText: 'Label',
                    allowBlank: false,
                    width: '100%',
                    flex: 1
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'URL',
                    name: 'url',
                    emptyText: 'http://',
                    allowBlank: false,
                    width: '100%',
                    flex: 1
                }]
        });
        this.items = [this.form];

        this.form.on('savesuccess', function () {            
            if (this.parentRecord && !Ext.Array.contains(this.parentRecord.childNodes, this.record)) {
                this.parentRecord.appendChild(this.record);
            }
            this.saveSuccess()
        }, this);

        this.callParent(arguments);

    },
    doSave: function () {
        var me = this;
        me.form.save()
    }
});