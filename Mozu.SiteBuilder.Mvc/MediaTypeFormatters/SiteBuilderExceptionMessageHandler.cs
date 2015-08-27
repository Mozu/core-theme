using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Magnum.Extensions;
using Mozu.Core.Api;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Api.Handlers.Message;

namespace Mozu.SiteBuilder.Mvc.MediaTypeFormatters
{
   
    public class SiteBuilderHttpErrorResponseGenerator: IHttpErrorResponseGenerator
    {
        private readonly HttpErrorResponseGenerator _innerGenerator;

        public SiteBuilderHttpErrorResponseGenerator(HttpErrorResponseGenerator innerGenerator)
        {
            _innerGenerator = innerGenerator;
        }

        public HttpResponseMessage GenerateErrorResponse(HttpRequestMessage request, Exception ex)
        {
            var response = _innerGenerator.GenerateErrorResponse(request, ex);
            if (response.Content is ObjectContent<ErrorCollection>)
            {
                //
                var ec = ((ObjectContent) response.Content).Value as ErrorCollection;
                var sec = AutoMapper.Mapper.Map<SiteBuilderErrorCollection>(ec);
                sec.Exception = ex;
                ((ObjectContent) response.Content).Value = sec;
            }
            return response;

        }
    }

    public class SiteBuilderErrorCollection : ErrorCollection
    {
        public Exception Exception { get; set; }
    }
    
}  
