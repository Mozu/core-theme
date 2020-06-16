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
        readonly Lazy<IPriceListRuntimeWebApiClient> _priceListRuntimeWebApiClient;
        ISiteBuilderApiContext _apiContext;
        ILogger _logger;
        public PriceListResolutionHandler(ISiteBuilderApiContext apiContext,
            Lazy<IMozuSession> session,
            Lazy<IPriceListRuntimeWebApiClient> priceListRuntimeWebApiClient,
            ILogger<PriceListResolutionHandler> logger
            )
        {
            _apiContext = apiContext;
            _session = session;
            _priceListRuntimeWebApiClient = priceListRuntimeWebApiClient;
            _logger = logger;
        }

        Task<string> IPriceListResolutionHandler.ResolvePriceList(int? customerAccoutnid )
        {
            return _priceListRuntimeWebApiClient.Value.GetResolvedPriceList(customerAccountId: customerAccoutnid)
                .ContinueWith(x =>  x.Result?.ReadAsSync()?.PriceListCode);
        }
    }
}
