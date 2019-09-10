define([
  'modules/backbone-mozu',
  'underscore',
  'modules/jquery-mozu',
  'modules/backbone-overhang',
  'hyprlive'
], function(Backbone, _, $, OverhangModel, Hypr){
  /*
    Displays a notice at the bottom of the screen with two buttons
    informing the user that the website uses cookies.
    If the user accepts, a cookie is dropped in their browser labeled with the
    tenant and site ID, which will last a year, preventing the notice from
    appearing again.
  */
  var apiContext = require.mozuData('apicontext');
  var tenantId = apiContext.headers['x-vol-tenant'];
  var siteId = apiContext.headers['x-vol-site'];
  var acceptedCookiesNotice = $.cookie('kibo-'+tenantId+'-'+siteId+'-'+'accept-cookies');

  if (!acceptedCookiesNotice) {
      var cookieNoticeModel = new OverhangModel({
           title: Hypr.getLabel('cookieNoticeTitle'),
           text: Hypr.getLabel('cookieNotice'),
           type: 'confirm',
           yesMessage: Hypr.getLabel('acceptCookies'),
           noMessage: Hypr.getLabel('learnMore'),
           yesColor: '#222',
           noColor: '#222',
           callback: function(accepted){
             if (!accepted){
               window.open(Hypr.getLabel('learnMoreCookiesLink'));
             } else {
               $.cookie('kibo-'+tenantId+'-'+siteId+'-'+'accept-cookies', true, { expires: 365 });
             }
           }
       });
      $(document).ready(function(){
           cookieNoticeModel.open();
      });

    }
});
