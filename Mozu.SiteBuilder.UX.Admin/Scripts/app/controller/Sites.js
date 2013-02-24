/**
 * @class Taco.controller.Sites
 * The Sites controller. TODO: This is the most cut-and-pasted thing.
 */
Ext.define('Taco.controller.Sites', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.site.page.Edit'],
    views: ['option.Index'],             //<hack 
    modelName: 'Taco.model.Option',   //<hack 


    validateContext :function() {
        if (Taco.app.context.getCurrent().contextType == 's') {
            return true;
        }
        this.createContentView('Taco.core.ux.content.Container', {
            header: {
                title: 'choose a site'
            },

            body: {
                layout: 'auto',
                items: [{
                    html: 'placeholder for choose site  interstitial '
                }]
            }
        });
        return false;
    },

    pages: function (params) {
        
        if (!this.validateContext()) {
            return;
        }

        var url = '/';
        if (params.id) {
            url = '/pages/' + params.id;
        } else if (typeof params === "string") {
            url = '/pages/' + params;
        }
        this.createContentView('Taco.view.site.page.Edit', { pageSrc: url });
    },
    
   
    
     
    blogs: function (params) {
        
        if (!this.validateContext()) {
            return;
        }
        

        var url = '/blogs';
        if (params.id) {
            url = '/blogs/' + params.id;
        } else if (typeof params === "string") {
            url = '/blogs/' + params;
        }
        this.createContentView('Taco.view.site.page.Edit', { pageSrc: url });
    },
    category: function (params) {
        
        if (!this.validateContext()) {
            return;
        }
        

        var url = '/';
        if (params.id) {
            url = '/category/' + params.id;
        } else if (typeof params === "string") {
            url = '/category/' + params;
        }
        this.createContentView('Taco.view.site.page.Edit', { pageSrc: url });
    },
    product: function (params) {
        
        if (!this.validateContext()) {
            return;
        }
        

        var url = '/';
        if (params.id) {
            url = '/product/' + params.id;
        } else if (typeof params === "string") {
            url = '/product/' + params;
        }
        this.createContentView('Taco.view.site.page.Edit', { pageSrc: url });
    }
});
