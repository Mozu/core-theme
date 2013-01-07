//using System.Collections.Generic;
//using Volusion.Core.Logging;
//using Volusion.SiteBuilder.ClientRepositories.ServiceClient;
//using Volusion.SiteBuilder.Mvc;
//using Volusion.SiteService.DataContracts.Administration;

//namespace Volusion.SiteBuilder.ClientRepositories.Admin.ServiceClients
//{
//    /// <summary>
//    /// TODO: Update summary.
//    /// </summary>
//    public class CatalogServiceClient : ServiceClientBase<Catalog>, ICatalogServiceClient
//    {
//        public CatalogServiceClient(ISiteBuilderContext siteBuilderContext, IResourceUriResolver resourceUriResolver, ILogger logger) 
//            : base(siteBuilderContext, resourceUriResolver)
//        {
//            GetEntityId = m => m.CatalogId;
//            Logger = logger;
//        }

//        public IEnumerable<Catalog> List()
//        {
//            return base.List<IEnumerable<Catalog>>();
//        }
//    }
//}