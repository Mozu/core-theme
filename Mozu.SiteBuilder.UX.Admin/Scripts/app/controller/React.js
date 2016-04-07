/**
 * @class Taco.controller.React
 * The Themes controller.
 * Show a blank page while a react page is rendered
 */

Ext.define('Taco.controller.React', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.react.Index'],
    indexView: 'Taco.view.react.Index'
});
