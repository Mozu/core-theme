using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using Mozu.Core.Actions.Contracts;
using Mozu.Core.Configuration;
using Mozu.SiteBuilder.Mvc.ActionResults;
using System.Linq;
using System.Collections.ObjectModel;

namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
{
    
    public class JsonpOutputFormatter : TextOutputFormatter
    {
        private readonly HttpRequest _request;
        
        private readonly string _callbackQueryParameter;
     

        static readonly Regex _cleanCallback = new Regex("^[\\w\\.-]+$");
        Collection<IOutputFormatter> _formatters;
        public JsonpOutputFormatter( MvcOptions options, string callbackQueryParameter = "callback" )
        {
            _callbackQueryParameter = callbackQueryParameter;
            //var bing = new System.Net.Http.Formatting.JsonMediaTypeFormatter();
            _callbackQueryParameter = callbackQueryParameter ?? throw new ArgumentNullException(nameof(callbackQueryParameter));
            _formatters = options.OutputFormatters;
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/javascript"));
            SupportedEncodings.Add(Encoding.UTF8);
           
        }

        NewtonsoftJsonOutputFormatter _formatter;
        NewtonsoftJsonOutputFormatter JsonFormatter
        {
            get
            {
                if (_formatter == null)
                {
                    _formatter = _formatters.OfType<NewtonsoftJsonOutputFormatter>().First();
                }
                return _formatter;
            }
        }


    

        protected override bool CanWriteType(Type type)
        {
            var res = !type.IsAssignableTo<IViewResult>();
            return res;
        }
        public override bool CanWriteResult(OutputFormatterCanWriteContext context)
        {
            string callback;
            var res = IsJsonpRequest(context.HttpContext.Request, this._callbackQueryParameter, out callback);
            return res;
        }

        public override Task WriteAsync(OutputFormatterWriteContext context)
        {
            context.ContentType = "text/javascript";
            return base.WriteAsync(context);
        }
        public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context, Encoding selectedEncoding)
        {
            string callback;
            var res = IsJsonpRequest(context.HttpContext.Request, this._callbackQueryParameter, out callback);
            await context.HttpContext.Response.WriteAsync(callback + "(");
         
            await JsonFormatter.WriteResponseBodyAsync(context, selectedEncoding);
            await context.HttpContext.Response.WriteAsync(");");            
        }

        internal static bool IsJsonpRequest(HttpRequest request, string callbackQueryParameter, out string callback)
        {
            callback = (string)null;
            if (request == null || request.Method != HttpMethod.Get.Method)
                return false;
            callback = request.Query.Where((kvp => kvp.Key.Equals(callbackQueryParameter, StringComparison.OrdinalIgnoreCase))).Select(kvp => kvp.Value).FirstOrDefault();
            if (string.IsNullOrEmpty(callback))
            {
                return false;
            }
          
            //check for potential xxs
            if (!_cleanCallback.IsMatch(callback))
            {
                throw new ArgumentException($"potentially unsafe callback {callback}");
            }

            return true;
        }   
    
    }
}
