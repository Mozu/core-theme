
/**
 * @class Taco.controller.WidgetDefinitions
 * @author Jason Cochran
 * The WidgetDefinitions controller
 */


    Ext.define('Taco.controller.WidgetDefinitions', {
        extend: 'Taco.core.Controller',
        editorView: 'Taco.view.category.SimpleEditor',
        listView: null,
        models: ['Taco.model.WidgetDefinition'],
        stores: ['Taco.store.WidgetDefinitions'],
        modelName: 'Taco.model.WidgetDefinition',


        index: function () {
            this.createContentView('Taco.view.product.Index');
        }

    });
