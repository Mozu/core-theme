require(['modules/jquery-mozu', 'hyprlive',"modules/backbone-mozu",  "modules/api"],
    function ($, Hypr, Backbone, Api) {
  
    $(document).ready(function () {
       var res=Api.get('entity',{listName: 'mozu-kount-settings@mzint', id: 'KountId' });
       res.then(function(r) { 
             var data = r.data;
             var merchantId=data.merchantId;
             var tenantUrl=data.tenantURL;
             
             var $validationFrame = $('#validationFrame');
             var $validationImg = $('#validationImg');
             
             var pageId = $validationFrame.data('model-id');
             var tenantId = Api.context.tenant;
             var siteId = Api.context.site;
             
             var url = tenantUrl + "/logo.htm?" + $.param({
            	 s: pageId,
            	 m: merchantId,
            	 t: tenantId,
            	 si: siteId
             });
             
             $validationImg.attr("src", url);
             $validationFrame.attr("src", url);
       });
    });
});
