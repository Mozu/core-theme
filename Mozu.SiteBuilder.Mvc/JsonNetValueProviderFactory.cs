using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Mozu.SiteBuilder.Mvc
{
    public class JsonModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            if (!IsJSONRequest(controllerContext) || controllerContext.IsChildAction)
            {
                return base.BindModel(controllerContext, bindingContext);
            }

            // Get the JSON data that's been posted
            var request = controllerContext.HttpContext.Request;
            var jsonStringData = new StreamReader(request.InputStream);

            var JSONSerializer = new JsonSerializer();
            if ( request.InputStream.CanSeek)
            {
                request.InputStream.Position = 0;
            }
            var g =  JSONSerializer.Deserialize(jsonStringData, bindingContext.ModelMetadata.ModelType);
            return g;

            // Use the built-in serializer to do the work for us

        }

        private static bool IsJSONRequest(ControllerContext controllerContext)
        {
            var contentType = controllerContext.HttpContext.Request.ContentType;
            return contentType.Contains("application/json");
        }
    }


}
