using Volusion.ProductService.DataContracts.Administration;

namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
	public interface IProductRepository : IRepository<Product>
	{
		ProductCollection GetProducts(string productSetId, string storeFrontId);
		ProductLocalizedContent GetContent(int productId, string localeCode);
		ProductLocalizedContentCollection GetContentList(int productId);
		ProductLocalizedContent EditContent(int productId, string localeCode, ProductLocalizedContent content);
		ProductLocalizedContent AddContent(int productId, string localeCode, ProductLocalizedContent content);
	}
}