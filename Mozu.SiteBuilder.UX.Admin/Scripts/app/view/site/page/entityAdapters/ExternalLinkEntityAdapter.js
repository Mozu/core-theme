/**
 * @class Taco.view.site.page.entityAdapters.ExternalLinkEntityAdapter
 */
Ext.define('Taco.view.site.page.entityAdapters.ExternalLinkEntityAdapter', {
    extend: 'Taco.view.site.page.entityAdapters.BaseEntityAdapter',
    modelName: 'Taco.model.Product',
    allowedActions: { add: true,  destroy: true },
    load: function () {
        var doc = this.editor.editSurface.iframe.getDoc(),
            div = doc.createElement('div');


        this.set(Ext.data.StoreManager.lookup('navigationTreeNodeStore').getRootNode().findChild('id', this.getId(), true), false);
        doc.removeChild(doc.documentElement);
        div.innerHTML = "<h1>external link</h1><a href='" + this.metaData.url + "'>" + this.metaData.name + "</a>";
        doc.appendChild(div);

       
    },
    set: function (model, add) {
        this.isLoading = false;
        this.model = model;

        var actions = Ext.applyIf(this.allowedActions, { add: true, settings: this.editors});
        this.editor.toolBar.enableButtons(actions);

        this.fireEvent('load', model);
    },
    deleteRecord: function () {
        var me = this,
		model = this.get();
        if (model) {
           
            model.remove(true);
            me.fireEvent('destroy', model);
        }
    },
    get: function () {
        return this.model;
    },


    getPageSettings: function() {
        return [];
    },


    getId: function () {
        return this.metaData.id;
    }
});