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
//    public class ContentLocaleServiceClient : ServiceClientBase<ContentLocale>, IContentLocaleServiceClient
//    {
//        public ContentLocaleServiceClient(ISiteBuilderContext siteBuilderContext, IResourceUriResolver resourceUriResolver, ILogger logger) 
//            : base(siteBuilderContext, resourceUriResolver)
//        {
//            Logger = logger;
//            GetEntityId = m => m.ContentLocaleCode;
//        }

//        public IEnumerable<ContentLocale> List()
//        {
//            return base.List<IEnumerable<ContentLocale>>();
//        }
//    }
//}