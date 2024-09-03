using Mozu.Core;
using Mozu.Core.Api.Session;
using Mozu.ProductRuntime.Contracts.Clients;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Mozu.Core.Api;

namespace Mozu.SiteBuilder.Mvc.Handler
{
    public interface IPriceListResolutionHandler
    {
        Task<string> ResolvePriceList(int? customerAccoutnid = null);
    }

    public class PriceListResolutionHandler: IPriceListResolutionHandler
    {

        Lazy<IMozuSession> _session;
        private readonly Lazy<IPriceListResolutionHandler> _oldPriceListRuntimeWebApiClient;
        readonly Lazy<Mozu.Customer.Contracts.Clients.ICustomerAccountWebApiClient> _priceListRuntimeWebApiClient;
        ISiteBuilderApiContext _apiContext;
        ILogger _logger;
        public PriceListResolutionHandler(ISiteBuilderApiContext apiContext,
            Lazy<IMozuSession> session,
            Lazy<IPriceListResolutionHandler> oldPriceListRuntimeWebApiClient,
            Lazy<Mozu.Customer.Contracts.Clients.ICustomerAccountWebApiClient> priceListRuntimeWebApiClient,
            ILogger<PriceListResolutionHandler> logger
            )
        {
            _apiContext = apiContext;
            _session = session;
            _oldPriceListRuntimeWebApiClient = oldPriceListRuntimeWebApiClient;
            _priceListRuntimeWebApiClient = priceListRuntimeWebApiClient;
            _logger = logger;
        }

        private const string HasErrorKey = "x-vol-has-error";

        async Task<string> IPriceListResolutionHandler.ResolvePriceList(int? customerAccountId )
        {
            var priceListResponse = await
                _priceListRuntimeWebApiClient.Value.GetResolvedPriceList(customerAccountId: customerAccountId);
            
            if ( priceListResponse.ResponseMessage.IsSuccessStatusCode)
            {
                return priceListResponse.ReadAsSync();
            }
            else if( priceListResponse.ResponseMessage.Headers.Contains(HasErrorKey))
            {
                return null;
            }
            else
            {
                return (await _priceListRuntimeWebApiClient.Value.GetResolvedPriceList(
                    customerAccountId: customerAccountId)).ReadAsSync();

            }
           
        }
    }
}
