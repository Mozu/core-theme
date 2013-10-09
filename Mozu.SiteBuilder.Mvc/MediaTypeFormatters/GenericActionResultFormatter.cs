//using System;
//using System.IO;
//using System.Net.Http;
//using System.Net.Http.Formatting;
//using System.Net.Http.Headers;
//using System.Threading.Tasks;
//using System.Web.Routing;
//using Mozu.SiteBuilder.Mvc.ActionResults;
//using Mozu.SiteBuilder.Mvc.ViewEngine;

//namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
//{
//    public  class GenericActionResultFormatter : MediaTypeFormatter
//    { private static RouteData routeData = new RouteData();


//        public GenericActionResultFormatter()
//        {
//            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/html"));
          
            
//            //SupportedMediaTypes.Add(new MediaTypeHeaderValue("*/*"));

//        }
//      //  private ILifetimeScope LifetimeScope { get; set; }
//        public HttpRequestMessage RequestMessage { get; set; }

//        public override MediaTypeFormatter GetPerRequestFormatterInstance(Type type, System.Net.Http.HttpRequestMessage request, MediaTypeHeaderValue mediaType)
//        {
//            if (this.CanWriteType(type))
//            {
//                var formatter = (GenericActionResultFormatter)this.MemberwiseClone();
//              //  formatter.LifetimeScope = (ILifetimeScope)request.GetDependencyScope().GetService(typeof(ILifetimeScope));
//                formatter.RequestMessage = request;
//                return formatter;
//            }
//            return this;

//        }



//        public override Task WriteToStreamAsync(Type type, object value, Stream writeStream, HttpContent content, System.Net.TransportContext transportContext)
//        {
          

//            var res = (ActionResult)value;
            
//            res.ExecuteResult(this.RequestMessage);

//            var tsc = new TaskCompletionSource<bool>();
//            tsc.SetResult(true);
//            return tsc.Task;

//        }
       


//        public override bool CanReadType(Type type)
//        {
//            return false;
//        }

//        public override bool CanWriteType(Type type)
//        {
//            return typeof(ActionResult).IsAssignableFrom(type);
//            // return type == typeof (ViewResult) || type == typeof (PartialViewResult);
//        }
//    }

//}
