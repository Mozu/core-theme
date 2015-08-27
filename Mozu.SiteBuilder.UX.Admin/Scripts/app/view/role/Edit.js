/**
 * @class  Taco.view.account.RoleEditor
 * Role editor UI
 */

Ext.define('Taco.view.role.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    alias: 'widget.rolefulledit',
    requires: ['Taco.view.role.Form'],
    formCls: 'Taco.view.role.Form'
});
