define(["jquery", "shim!vendor/jquery-colorbox[jquery=jQuery]"], function ($) {

    $(document).ready(
        function() {
            $(".helloWorldCB").each(function () {
            
                $(this).colorbox({ scalePhotos:true, transition: this.dataset.transition, width: this.dataset.imageSize, height: this.dataset.imageSize });
            });

           
        });

   
});