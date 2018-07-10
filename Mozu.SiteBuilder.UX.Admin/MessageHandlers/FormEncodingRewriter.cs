using System;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.MessageHandlers
{
    public class FormEncodingRewriter : DelegatingHandler
    {
        /// <summary>
        /// Converts a form POST request into a GET request with the form body as query string parameters
        /// </summary>
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            if (request.RequestUri.AbsolutePath.Contains("form-to-get"))
            {
                var formatter = new FormUrlEncodedMediaTypeFormatter();
                var stream = await request.Content.ReadAsStreamAsync();
                var formDataCollection = (FormDataCollection) await 
                    formatter.ReadFromStreamAsync(typeof(FormDataCollection), stream, request.Content, null);

                var sb = new StringBuilder();
                foreach (var kvp in formDataCollection)
                {
                    sb.Append("&").Append(kvp.Key).Append("=").Append(HttpUtility.UrlEncode(kvp.Value));
                }

                var uriBuilder = new UriBuilder(request.RequestUri)
                {
                    Query = sb.ToString()
                };
                uriBuilder.Path = uriBuilder.Path.Replace("form-to-get/", "");

                request.RequestUri = uriBuilder.Uri;
                request.Method = HttpMethod.Get;;

                var tempReq  = new HttpRequestMessage(HttpMethod.Get, uriBuilder.Uri);
                var reroute = request.GetConfiguration().Routes.GetRouteData(tempReq);
                request.SetRouteData(reroute);
            }

            return await base.SendAsync(request, cancellationToken);
        }
    }
}