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
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Net.Http.Headers;

namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
{
    
    public class JsonpOutputFormatter : TextOutputFormatter
    {
        private readonly HttpRequest _request;
        private readonly OutputFormatter _jsonOutputFormatter = new SystemTextJsonOutputFormatter(new JsonSerializerOptions());
        private readonly string _callbackQueryParameter;
        private readonly string _callback;
        static readonly Regex _cleanCallback = new Regex("^[\\w\\.-]+$");
        public JsonpOutputFormatter(string callbackQueryParameter = "callback")
        {
            //var bing = new System.Net.Http.Formatting.JsonMediaTypeFormatter();
            _callbackQueryParameter = callbackQueryParameter ?? throw new ArgumentNullException(nameof(callbackQueryParameter));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/javascript"));
        }

        private JsonpOutputFormatter(HttpRequest request, string callback, string callbackQueryParameter)
            : this(callbackQueryParameter)
        {
            _request = request ?? throw new ArgumentNullException(nameof(request));
            _callback = callback ?? throw new ArgumentNullException(nameof(callback));
        }

        public OutputFormatter GetPerRequestFormatterInstance(Type type, HttpRequest request)
        {
            if (type == null)
                throw new ArgumentNullException(nameof(type));
            if (request == null)
                throw new ArgumentNullException(nameof(request));
            return IsJsonpRequest(request, _callbackQueryParameter, out var callback) ? 
                new JsonpOutputFormatter(request, callback, _callbackQueryParameter) : 
                _jsonOutputFormatter;
        }

        protected override bool CanWriteType(Type type)
        {
            if (type == null)
                throw new ArgumentNullException(nameof(type));
            
            return base.CanWriteType(type);
        }

        public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context, Encoding selectedEncoding)
        {
            await using var streamWriter = new StreamWriter(context.HttpContext.Response.Body, selectedEncoding, 4096, true);
            streamWriter.Write(this._callback + "(");
            streamWriter.Flush();
            await _jsonOutputFormatter.WriteResponseBodyAsync(context).ConfigureAwait(false);
            streamWriter.Write(");");
            streamWriter.Flush();
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
