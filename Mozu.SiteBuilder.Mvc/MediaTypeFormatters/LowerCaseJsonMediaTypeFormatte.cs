//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Net.Http.Formatting;
//using System.Text;
//using System.Threading.Tasks;
//using Newtonsoft.Json.Serialization;

//namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
//{
//    public class LowerCaseJsonMediaTypeFormatter: JsonMediaTypeFormatter
//    {
//        public static LowerCaseJsonMediaTypeFormatter Default = new LowerCaseJsonMediaTypeFormatter();
//        public override bool CanWriteType(Type type)
//        {
//            return base.CanWriteType(type);
//        }
//        public LowerCaseJsonMediaTypeFormatter()
//        {
//            this.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
//            this.SerializerSettings.DefaultValueHandling = Newtonsoft.Json.DefaultValueHandling.Include;
//        }
//    }
//}
