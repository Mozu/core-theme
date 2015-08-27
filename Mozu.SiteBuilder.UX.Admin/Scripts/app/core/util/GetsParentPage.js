/**
 * @class Taco.core.util.GetsParentPage
 * Mixin that adds a convenient, memoizing "getParentPage" method that helps you access a parent Taco.core.ux.content.Container from any handler in a child component.
 */

Ext.define('Taco.core.util.GetsParentPage', {
    getParentPage: function () {
        if (!this.__taco_parentpage_) this.__taco_parentpage_ = this.up('contentcontainer');
        return this.__taco_parentpage_;
    }
});