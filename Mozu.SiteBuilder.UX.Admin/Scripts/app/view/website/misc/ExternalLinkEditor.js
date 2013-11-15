
/**
 * @class Taco.view.site.navigation.ExternalLinkEditor
 */
Ext.define('Taco.view.website.misc.ExternalLinkEditor', {
    extend: 'Taco.core.ux.window.Modal',
    autoShow: true,
    primaryHandler: function () {
        if (this.fireEvent('beforesave', this) !== false) {
            this.fireEvent('save', this);
        }
    },

    initComponent: function () {
       
        this.on('savesuccess', function () {
            if (this.parentRecord && !Ext.Array.contains(this.parentRecord.childNodes, this.record)) {
                this.parentRecord.appendChild(this.record);
            }
          
            this.close();
        }, this);

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
                    name: 'name',
                    emptyText: 'Label',
                    allowBlank: false,
                    width: '100%',
                    flex: 1
                }, {
                    xtype: 'textfield',
                    name: 'url',
                    emptyText: 'URL',
                    inputType:'url',
                    allowBlank: false,
                    width: '100%',
                    flex: 1
                }]
        });
        this.items = [this.form];
        this.callParent(arguments);
        this.on('save', this.form.save, this.form);
    }
});