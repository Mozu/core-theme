using Volusion.Core.Logging;
using Volusion.ProductService.DataContracts.Administration;
using Volusion.SiteBuilder.ClientRepositories.ServiceClient;
using Volusion.SiteBuilder.Mvc;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.ServiceClients
{
	public interface ICategoryServiceClient : IRepositoryServiceClient<Category>, IRepositoryServiceClientAsync<Category>
	{
		CategoryCollection List();
	}

	public class CategoryServiceClient : ServiceClientBase<Category>, ICategoryServiceClient
	{
		public CategoryServiceClient(ISiteBuilderContext siteBuilderContext, IResourceUriResolver resourceUriResolver, ILogger logger) :
			base(siteBuilderContext, resourceUriResolver)
		{
			GetEntityId = m => m.CategoryId;
			Logger = logger;
		}

		public CategoryCollection List()
		{
            var col = base.List<CategoryCollection>();
		    return col;
		}
	}
}