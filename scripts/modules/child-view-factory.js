define(['modules/jquery-mozu','underscore','backbone','hyprlive'], function($, _, Backbone, Hypr) {
    var ViewFactory = function(){
        var childViews = {};

        var removeSpecialChar = function(str){
            return str.replace(/[^a-zA-Z0-9]/g, "");
        };

        var add = function(selector, view, caller){

            var selectorName = removeSpecialChar(selector);
            childViews[selectorName] = new View(selector, view, caller);
            //if(!childViews[selector]){

            //}
        };
        this.remove = function(){

        };
        var views = function(){
            return childViews;
        };

        return {
            add : function(selector, view, caller){ add(selector, view, caller); },
            //remove : function(){ this.remove(this, view); },
            views : views()
        };
    },

    View = function(selector, view, caller, initView){
        this.selector = selector;
        this.view = view;
        this.caller = caller;
        this.initView = initView;

        this.createView = function(){
           var self = this; 
           if(typeof this.view === 'function'){
             this.initView = new this.view({
                el: $(self.selector),
                model: self.caller.model
             });
           } 
        };

        this.getView = function(){
            return this.initView;
        };

        this.refresh = function(){
            this.createView();
        };

        if(!this.initView) {
            this.createView();
        }      
    };
    return ViewFactory;
});