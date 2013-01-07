using System.Net.Http;
using Volusion.ProductService.DataContracts.Administration;

namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
    public class ProductRepository : BaseRepository<Product>, IProductRepository
    {
        #region Overrides of RestBaseRepository<Domain>
        public ProductRepository(IRestRepositoryConfiguration restConfig)
            : base(restConfig)
        {
            RelativeUrl = "Volusion.ProductService.API/admin/products";
            GetId = (d) => d.ProductId ;
        }

        #endregion

        public ProductCollection GetProducts(string productSetId, string storeFrontId)
        {
            string requestUri = RelativeUrl + string.Format("?productSet={0}&storeFrontId={1}", productSetId, storeFrontId);
            using (var client = GetServiceClient())
            {
                using (var resp = client.GetAsync(requestUri).Result)
                {
                    Validate(resp);
                    return ToObjectContent<ProductCollection>(resp.Content).ReadAsAsync().Result;
                }
            }
        }



        public ProductLocalizedContent GetContent(int productId, string localeCode)
        {
            string requestUri = RelativeUrl + string.Format("/{0}/content/{1}", productId, localeCode);
            using (var client = GetServiceClient())
            {
                using (var resp = client.GetAsync(requestUri).Result)
                {
                    Validate(resp);
                    return ToObjectContent<ProductLocalizedContent>(resp.Content).ReadAsAsync().Result;
                }
            }
        }
        public ProductLocalizedContentCollection GetContentList(int productId)
        {
            string requestUri = RelativeUrl + string.Format("/{0}/content", productId );
            using (var client = GetServiceClient())
            {
                using (var resp = client.GetAsync(requestUri).Result)
                {
                    Validate(resp);
                    return ToObjectContent<ProductLocalizedContentCollection>(resp.Content).ReadAsAsync().Result;
                }
            }
        }
        public ProductLocalizedContent EditContent(int productId, string localeCode, ProductLocalizedContent content)
        {
            string requestUri = RelativeUrl + string.Format("/{0}/content/{1}", productId, localeCode);
            using (var client = GetServiceClient())
            {
                var oc = new ObjectContent<ProductLocalizedContent>(content, "text/json");
                using (var resp = client.PutAsync(requestUri,oc).Result)
                {
                    Validate(resp);
                    return ToObjectContent<ProductLocalizedContent>(resp.Content).ReadAsAsync().Result;
                }
            }
        }

        public ProductLocalizedContent AddContent(int productId, string localeCode, ProductLocalizedContent content)
        {
            string requestUri = RelativeUrl + string.Format("/{0}/content", productId, localeCode);
            using (var client = GetServiceClient())
            {
                var oc = new ObjectContent<ProductLocalizedContent>(content, "text/json");
                using (var resp = client.PostAsync(requestUri, oc).Result)
                {
                    Validate(resp);
                    return ToObjectContent<ProductLocalizedContent>(resp.Content).ReadAsAsync().Result;
                }
            }
        }
    }
}
