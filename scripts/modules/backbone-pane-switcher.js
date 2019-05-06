define(['modules/backbone-mozu', 'hyprlive', 'modules/jquery-mozu', 'underscore'], function (Backbone, Hypr, $, _) {

    var PaneSwitcherModel = Backbone.MozuModel.extend({
        //pane
        // {
        //     displayName: 'SomeName'
        //     view: {}
        // }
        defaults: {
            'panes' : [],
            'current': 0
        },
        switcherEl: function () {
            return this.$el.find('[data-mz-pane-switcher]');
        },
        setPane: function (idx, forceLoad) {
            // Allows us to set pane by name.
            if (isNaN(idx)){
              this.get('panes').some(function(pane, index){
                  if (pane.name === idx){
                      idx = index;
                      return true;
                  }
              });
            }
            if (idx !== this.get('current') || forceLoad) {
                this.set('current', idx);
                this.trigger('newPaneSet');
            }
        }
    });

    var PaneSwitcherView = Backbone.MozuView.extend({
        templateName: "modules/pane-switcher",
        initialize: function (data) {
            var self = this;
            self.listenTo(self.model, 'newPaneSet', function(){
                self.paneRender();
            });
        },
        handlePaneSelect: function(e){
            var index = $(e.currentTarget).data('mzIndex')-1;
            var forceLoad = $(e.currentTarget).data('mzForceLoad');
            this.model.setPane(index, forceLoad);
        },
        switcherEl: function () {
            return this.$el.find('[mz-pane-switcher]');
        },
        paneEl: function () {
            return this.switcherEl().find('[mz-pane-switcher-container]');
        },
        paneRender: function(){
            var pane = this.model.get('panes')[this.model.get('current')];
            if (pane && pane.view) {
                pane.view.el = this.paneEl();
                pane.view.$el = this.paneEl();
                window.views.currentPane = pane.view;
                pane.view.render();

            }
        },
        render: function () {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            this.paneRender();
        }
    });

    return {
        'PaneSwitcherView': PaneSwitcherView,
        'PaneSwitcherModel': PaneSwitcherModel
    };
});
