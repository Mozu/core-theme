/**
 * @class Taco.controller.Returns
 * The Returns controller.
 */
Ext.define('Taco.controller.Returns', {
    extend: 'Taco.core.Controller',
    modelName: 'Return',
    requires: ['Taco.view.returns.Index', 'Taco.view.returns.Edit'],
    views: ['returns.Index'],
    indexView: 'Taco.view.returns.Index',
    editorView: 'Taco.view.returns.Edit'
});
