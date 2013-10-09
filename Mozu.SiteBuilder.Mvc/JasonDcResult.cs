// -----------------------------------------------------------------------
// <copyright file="JasonDcResult.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

//using Newtonsoft.Json.Bson;

//namespace Mozu.SiteBuilder.Mvc
//{
//    using System;
//    using System.Collections.Generic;
//    using System.Linq;
//    using System.Text;
//    using System.Web;
//    using System.Web.Mvc;
//    using Newtonsoft.Json;

//     <summary>
//     TODO: Update summary.
//     </summary>
//    public class JsonDCResult : ActionResult

//    {




//         Methods
//        public JsonDCResult()
//        {
//            this.JsonRequestBehavior = JsonRequestBehavior.DenyGet;
//        }

//        public override void ExecuteResult(ControllerContext context)
//        {
//            if (context == null)
//            {
//                throw new ArgumentNullException("context");
//            }
//            if ((this.JsonRequestBehavior == JsonRequestBehavior.DenyGet) && string.Equals(context.HttpContext.Request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
//            {
//                throw new InvalidOperationException("MvcResources.JsonRequest_GetNotAllowed");
//            }
//            HttpResponseBase response = context.HttpContext.Response;
//            if (!string.IsNullOrEmpty(this.ContentType))
//            {
//                response.ContentType = this.ContentType;
//            }
//            else
//            {
//                response.ContentType = "application/json";
//            }
//            if (this.ContentEncoding != null)
//            {
//                response.ContentEncoding = this.ContentEncoding;
//            }
//            if (this.Data != null)
//            {
//                Newtonsoft.Json.JsonSerializer ser = new JsonSerializer()
//                                                         {

//                                                         };
                
//                JsonWriter jwriter = new JsonTextWriter(response.Output );
//                ser.Serialize(jwriter, this.Data );
               
//                var jwriter = new JsonTextWriter(response.Output);
//                jwriter.writeo
//                System.Runtime.Serialization.Json.DataContractJsonSerializer ser = new System.Runtime.Serialization.Json.DataContractJsonSerializer(this.Data.GetType ());
//                ser.WriteObject(response.OutputStream, this.Data);
//             }
//        }

//         Properties
//        public Encoding ContentEncoding
//        {
//            get;
//            set;
//        }

//        public string ContentType
//        {
//            get;
//            set;
//        }

//        public object Data
//        {
//            get;
//            set;
//        }

//        public JsonRequestBehavior JsonRequestBehavior
//        {
//            get;
//            set;
//        }
//    }
//}