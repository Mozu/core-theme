define([
  'modules/backbone-mozu',
  'underscore',
  'modules/jquery-mozu',
  'vendor/jqueryui/jqueryui-effects',
  'shim!vendor/overhang/lib/overhang[modules/jquery-mozu=$]>jQuery'
], function(Backbone, _, $){

  var OverhangModel = Backbone.MozuModel.extend({
    defaults: {
        closeConfirm: true,
        type: 'info',
        title: '',
        text: '',
        primary: '#444',
        accent: '#FFF',
        textColor: '#FFF',
        element: 'body'
    },
    initialize: function(){
        var overhangConfig = this.toJSON();
        var html = false;
        var message = '';
        if (this.get('message')){
          html = true;
          message = this.get('message');
        } else if (this.get('title') && this.get('text')){
          html = true;
          var title = this.get('title') ? '<p style="color:'+this.get('textColor')+' font-size:20px">'+this.get('title')+'</p>' : '';
          var text = this.get('text') ? '<p style="font-size:14px">'+this.get('text')+'</p>' : '';
          message = title + text;
        }
        else {
          message = this.get('text') ? this.get('text') : this.get('title');
        }
       delete overhangConfig.title;
       delete overhangConfig.text;
       overhangConfig.message = message;
       overhangConfig.html = html;
       overhangConfig.custom = true;
       this.set('overhangConfig', overhangConfig);
    },
    open: function(){
      $(this.get('element')).overhang(this.get('overhangConfig'));
    }
  });

  return OverhangModel;

});
