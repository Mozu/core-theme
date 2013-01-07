// -----------------------------------------------------------------------
// <copyright file="JsonNetMediaTypeFormatter.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using Volusion.Core.Logging;

namespace Volusion.SiteBuilder.ClientRepositories.MediaTypeFormatters
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Net.Http.Formatting;
    using System.IO;
    using System.Net.Http.Headers;
    using Newtonsoft.Json;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class JsonNetMediaTypeFormatter : MediaTypeFormatter
    {
        static MediaTypeHeaderValue[] g_supportMediaTypes;
        static JsonNetMediaTypeFormatter()
        {
            g_supportMediaTypes = new MediaTypeHeaderValue[]{
                new MediaTypeHeaderValue ("application/json" ),
                new MediaTypeHeaderValue ("text/json" )
            };
        }

        public JsonNetMediaTypeFormatter()
        {
            foreach (var mt in g_supportMediaTypes)
            {
                this.SupportedMediaTypes.Add(mt);
            }
        }
        protected override System.Threading.Tasks.Task<object> OnReadFromStreamAsync(Type type, Stream stream, HttpContentHeaders contentHeaders)
        {
            return base.OnReadFromStreamAsync(type, stream, contentHeaders);
        }

        protected override bool CanWriteType(Type type)
        {
            return true;
        }
        protected override bool CanReadType(Type type)
        {
            return true;
        }
        protected override object OnReadFromStream(Type type, System.IO.Stream stream, System.Net.Http.Headers.HttpContentHeaders contentHeaders)
        {
            var serializer = new JsonSerializer();
            serializer.Error += SerializerError;

            var sreader = new StreamReader(stream);
            var reader = new JsonTextReader(sreader);

        	object result = null;
				try
				{
					result  = serializer.Deserialize(reader, type);
					LoggingService.LoggerFor<JsonNetMediaTypeFormatter>().Debug(result);
				}
				catch (JsonSerializationException e)
				{
					LoggingService.LoggerFor<JsonNetMediaTypeFormatter>().Error("Exception Caught:", e);
					throw;
				}
        	return result;

        }

    	static void SerializerError(object sender, Newtonsoft.Json.Serialization.ErrorEventArgs e)
        {
           LoggingService.LoggerFor<JsonNetMediaTypeFormatter>().Error(String.Format("Serialization error with {0}",e.ErrorContext.Member.GetType().Name),e.ErrorContext.Error);
        }

        protected override void OnWriteToStream(Type type, object value, System.IO.Stream stream, System.Net.Http.Headers.HttpContentHeaders contentHeaders, System.Net.TransportContext context)
        {
            var serializer = new JsonSerializer();
            var streamWriter = new StreamWriter(stream);
            var jwriter = new JsonTextWriter(streamWriter);
            serializer.Serialize(jwriter, value);
            jwriter.Flush();
            streamWriter.Flush();
        }
    }
}
