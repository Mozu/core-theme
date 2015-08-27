using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
{
    
    public class JsonpMediaTypeFormatter : MediaTypeFormatter
    {
        private readonly HttpRequestMessage _request;
        private readonly MediaTypeFormatter _jsonMediaTypeFormatter;
        private readonly string _callbackQueryParameter;
        private readonly string _callback;

        public JsonpMediaTypeFormatter(MediaTypeFormatter jsonMediaTypeFormatter, string callbackQueryParameter = "callback")
        {
            if (jsonMediaTypeFormatter == null)
                throw new ArgumentNullException("jsonMediaTypeFormatter");
            if (callbackQueryParameter == null)
                throw new ArgumentNullException("callbackQueryParameter");
            this._jsonMediaTypeFormatter = jsonMediaTypeFormatter;
            this._callbackQueryParameter = callbackQueryParameter;
            this.SupportedMediaTypes.Add(new MediaTypeHeaderValue("text/javascript"));
            foreach (Encoding encoding in this._jsonMediaTypeFormatter.SupportedEncodings)
                this.SupportedEncodings.Add(encoding);
            this.MediaTypeMappings.Add((MediaTypeMapping)new UriPathExtensionMapping("jsonp", "application/json"));
        }

        private JsonpMediaTypeFormatter(HttpRequestMessage request, string callback, MediaTypeFormatter jsonMediaTypeFormatter, string callbackQueryParameter)
            : this(jsonMediaTypeFormatter, callbackQueryParameter)
        {
            if (request == null)
                throw new ArgumentNullException("request");
            if (callback == null)
                throw new ArgumentNullException("callback");
            this._request = request;
            this._callback = callback;
        }

        public override MediaTypeFormatter GetPerRequestFormatterInstance(Type type, HttpRequestMessage request, MediaTypeHeaderValue mediaType)
        {
            if (type == (Type)null)
                throw new ArgumentNullException("type");
            if (request == null)
                throw new ArgumentNullException("request");
            string callback;
            if (JsonpMediaTypeFormatter.IsJsonpRequest(request, this._callbackQueryParameter, out callback))
                return (MediaTypeFormatter)new JsonpMediaTypeFormatter(request, callback, this._jsonMediaTypeFormatter, this._callbackQueryParameter);
            else
                return this._jsonMediaTypeFormatter.GetPerRequestFormatterInstance(type, request, mediaType);
        }

        public override bool CanReadType(Type type)
        {
            return false;
        }

        public override bool CanWriteType(Type type)
        {
            if (type == (Type)null)
                throw new ArgumentNullException("type");
            else
                return this._jsonMediaTypeFormatter.CanWriteType(type);
        }

        public override async Task WriteToStreamAsync(Type type, object value, Stream stream, HttpContent content, TransportContext transportContext)
        {
            if (type == (Type)null)
                throw new ArgumentNullException("type");
            if (stream == null)
                throw new ArgumentNullException("stream");
            Encoding encoding = this.SelectCharacterEncoding(content == null ? (HttpContentHeaders)null : content.Headers);
            using (StreamWriter streamWriter = new StreamWriter(stream, encoding, 4096, true))
            {
                streamWriter.Write(this._callback + "(");
                streamWriter.Flush();
                await this._jsonMediaTypeFormatter.WriteToStreamAsync(type, value, stream, content, transportContext).ConfigureAwait(false);
                streamWriter.Write(");");
                streamWriter.Flush();
            }
        }

        internal static bool IsJsonpRequest(HttpRequestMessage request, string callbackQueryParameter, out string callback)
        {
            callback = (string)null;
            if (request == null || request.Method != HttpMethod.Get)
                return false;
            callback = Enumerable.FirstOrDefault<string>(Enumerable.Select<KeyValuePair<string, string>, string>(Enumerable.Where<KeyValuePair<string, string>>(request.GetQueryNameValuePairs() , (Func<KeyValuePair<string, string>, bool>)(kvp => kvp.Key.Equals(callbackQueryParameter, StringComparison.OrdinalIgnoreCase))), (Func<KeyValuePair<string, string>, string>)(kvp => kvp.Value)));
            return !string.IsNullOrEmpty(callback);
        }
    }
}
