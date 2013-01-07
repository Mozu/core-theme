using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using System.Net.Http;
using Volusion.SiteBuilder.ClientRepositories.Admin;
using Volusion.ProductService.DataContracts.Administration;

namespace Volusion.SiteBuilder.ClientRepositories
{  

    class ProductRepository : RestBaseRepository<Product>
    {
        const string BASE = "/admin/products";
        const string CONTENTLISTBASE = "/content";
        const string PRICELISTBASE = "/price";

        //http://deviis03.adsdev.volusion.com:8080/Volusion.ProductServices.API/admin/products/?productSet={productSetId}&storeFrontid={storeFrontId}

        public ProductRepository(IRestRepositoryConfiguration config)
            : base(config)
        {
            RelativeUrl = "API/ProductServices/admin/products";
        }

        public ProductCollection GetProducts(string productSetId, string storeFrontId)
        {
            string requestUri = RelativeUrl + string.Format("?productSet={0}&storeFrontId={1}", productSetId, storeFrontId);
            using (var client = GetServiceClient())
            {
                using (var resp = client.Get(requestUri))
                {
                    Validate(resp);
                    return ToObjectContent<ProductCollection>(resp.Content).ReadAs();
                }
            }
        }

        ProductLocalizedContent GetContent(int productId, string localeCode)
        {
            string requestUri = RelativeUrl + string.Format("/{0}/content/{1}", productId, localeCode);
            using (var client = GetServiceClient())
            {
                using (var resp = client.Get(requestUri))
                {
                    Validate(resp);
                    return ToObjectContent<ProductLocalizedContent>(resp.Content).ReadAs();
                }
            }
        }

        ProductLocalizedContentCollection GetContentList(int productId)
        {
            string requestUri = RelativeUrl + string.Format("/{0}/content", productId);
            using (var client = GetServiceClient())
            {
                using (var resp = client.Get(requestUri))
                {
                    Validate(resp);
                    return ToObjectContent<ProductLocalizedContentCollection>(resp.Content).ReadAs();
                }
            }
        }

        ProductLocalizedContent EditContent(int productId, string localeCode, ProductLocalizedContent content)
        {
            string requestUri = RelativeUrl + string.Format("/{0}/content/{1}", productId, localeCode);
            using (var client = GetServiceClient())
            {
                var oc = new ObjectContent<ProductLocalizedContent>(content, "text/json");
                using (var resp = client.Put(requestUri, oc))
                {
                    Validate(resp);
                    return ToObjectContent<ProductLocalizedContent>(resp.Content).ReadAs();
                }
            }
        }

        ProductLocalizedContent AddContent(int productId, string localeCode, ProductLocalizedContent content)
        {
            string requestUri = RelativeUrl + string.Format("/{0}/content", productId, localeCode);
            using (var client = GetServiceClient())
            {
                var oc = new ObjectContent<ProductLocalizedContent>(content, "text/json");
                using (var resp = client.Post(requestUri, oc))
                {
                    Validate(resp);
                    return ToObjectContent<ProductLocalizedContent>(resp.Content).ReadAs();
                }
            }
        }
    }   
}
