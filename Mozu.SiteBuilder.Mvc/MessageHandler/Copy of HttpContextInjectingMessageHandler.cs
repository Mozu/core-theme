//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Net.Http;
//using System.Text;
//using System.Threading.Tasks;
//using System.Web;
//using Autofac;
//using Autofac.Integration.WebApi;
//using System.Net.Http ;

//using System.Threading;
//using System.Threading.Tasks;



//namespace Mozu.SiteBuilder.Mvc.MessageHandler
//{


//    /// <summary>
//    ///     A delegating handler that updates the current dependency scope
//    ///     with the current <see cref="HttpRequestMessage"/>.
//    /// </summary>
//    public class HttpResponseMessageContainerMessageHandler : DelegatingHandler
//    {
//        /// <summary>
//        /// Sends an HTTP request to the inner handler to send to the server as an asynchronous operation.
//        /// </summary>
//        /// <param name="request">The HTTP request message to send to the server.</param>
//        /// <param name="cancellationToken">A cancellation token to cancel operation.</param>
//        /// <returns>
//        /// Returns <see cref="T:System.Threading.Tasks.Task`1" />. The task object representing the asynchronous operation.
//        /// </returns>
//        protected async override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
//        {
            
            
//            var response = await  base.SendAsync(request, cancellationToken);

//            return response;
//        }

        
//    }
//}


