using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
{
    
    public class JsonpMediaTypeFormatter : MediaTypeFormatter
    {
        private readonly HttpRequest _request;
        private readonly MediaTypeFormatter _jsonMediaTypeFormatter;
        private readonly string _callbackQueryParameter;
        private readonly string _callback;
        static readonly Regex _cleanCallback = new Regex("^[\\w\\.-]+$");
        public JsonpMediaTypeFormatter(MediaTypeFormatter jsonMediaTypeFormatter, string callbackQueryParameter = "callback")
        {
            //var bing = new System.Net.Http.Formatting.JsonMediaTypeFormatter();

            _jsonMediaTypeFormatter = jsonMediaTypeFormatter ?? throw new ArgumentNullException(nameof(jsonMediaTypeFormatter));
            _callbackQueryParameter = callbackQueryParameter ?? throw new ArgumentNullException(nameof(callbackQueryParameter));
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/javascript"));
            foreach (Encoding encoding in this._jsonMediaTypeFormatter.SupportedEncodings)
                SupportedEncodings.Add(encoding);
            MediaTypeMappings.Add(new UriPathExtensionMapping("jsonp", "application/json"));
        }

        private JsonpMediaTypeFormatter(HttpRequest request, string callback, MediaTypeFormatter jsonMediaTypeFormatter, string callbackQueryParameter)
            : this(jsonMediaTypeFormatter, callbackQueryParameter)
        {
            _request = request ?? throw new ArgumentNullException(nameof(request));
            _callback = callback ?? throw new ArgumentNullException(nameof(callback));
        }

        public MediaTypeFormatter GetPerRequestFormatterInstance(Type type, HttpRequest request, MediaTypeHeaderValue mediaType)
        {
            if (type == null)
                throw new ArgumentNullException(nameof(type));
            if (request == null)
                throw new ArgumentNullException(nameof(request));
            if (IsJsonpRequest(request, _callbackQueryParameter, out var callback))
                return new JsonpMediaTypeFormatter(request, callback, _jsonMediaTypeFormatter, _callbackQueryParameter);
            
            return _jsonMediaTypeFormatter;
        }

        public override bool CanReadType(Type type)
        {
            return false;
        }

        public override bool CanWriteType(Type type)
        {
            if (type == (Type)null)
                throw new ArgumentNullException(nameof(type));
            else
                return this._jsonMediaTypeFormatter.CanWriteType(type);
        }

        public override async Task WriteToStreamAsync(Type type, object value, Stream stream, HttpContent content, TransportContext transportContext)
        {
            if (type == (Type)null)
                throw new ArgumentNullException(nameof(type));
            if (stream == null)
                throw new ArgumentNullException(nameof(stream));
            var encoding = this.SelectCharacterEncoding(content?.Headers);
            await using var streamWriter = new StreamWriter(stream, encoding, 4096, true);
            streamWriter.Write(this._callback + "(");
            streamWriter.Flush();
            await this._jsonMediaTypeFormatter.WriteToStreamAsync(type, value, stream, content, transportContext).ConfigureAwait(false);
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
