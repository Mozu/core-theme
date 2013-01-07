using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using System.ServiceModel.Web;
using System.Net.Http;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Options;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using AutoMapper;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class ProductPropertyController : BaseController
    {
        private readonly IAttributeWebApiClient _attClient;
      
        
        private readonly IProductWebApiClient _productClient;

        private readonly IAttributeSetWebApiClient   _attSetClient;

        public ProductPropertyController(IAttributeWebApiClient attClient,
           IAttributeSetWebApiClient   attSetClient,
            IProductWebApiClient productClient)
        {
            _attClient = attClient;
             _attSetClient=   attSetClient;
            _productClient = productClient;
        }

        [WebInvoke(UriTemplate = "/create")]
        public Response<List<ProductOption>> CreateProductOption(List<ProductOption> options)
        {
            return EditProductOption(options);
        }

        [WebInvoke(UriTemplate = "/edit")]
        public Response<List<ProductOption>> EditProductOption(List<ProductOption> options)
        {
            var attSets = new Dictionary<string, DC.AttributeSet>();
            foreach (var vm in options)
            {
                DC.AttributeSet attSet;
                if (!attSets.TryGetValue(vm.productCode, out attSet))
                {
                    attSets[vm.productCode] = attSet = GetCreateAttributeSetByProductId(vm.productCode);
                }
                var att = attSet.AttributesInAttributeSets.FirstOrDefault(x => x.Id == vm.Id);

                if (att == null)
                {
                    _attSetClient.CreateAttributeInAttributeSet(new DC.AttributeInAttributeSet() { Id = vm.Id }, attSet.Id).Result.ReadAsSync();
                    attSets.Clear();

                }

                var prodOps = _productClient.GetProductAttribute(vm.productCode, vm.Id, "AttributeValueDetails").Result.ReadAsSync();
                if (prodOps == null)
                {
                    var attValues = _attClient.GetAttributeValues(vm.Id, 0, 1, null).Result.ReadAsSync().Items;
                    var what = _productClient.UpdateProductAttribute(new DC.ProductAttribute() { Id = vm.Id, Values = new List<DC.ProductAttributeValue>() { new DC.ProductAttributeValue() { Id = attValues.First().Id } } }, vm.productCode, vm.Id).Result.ReadAsSync();
                }
            }

            return EmptyList<ProductOption>();
        }

        private DC.AttributeSet GetCreateAttributeSetByProductId(string productId)
        {
            var prod = _productClient.GetProductByProductCode(productId,null).Result.ReadAsSync();
            DC.AttributeSet attSet = null;
            if (prod.AttributeSetId == null || prod.AttributeSetId.Value < 1)
            {

                attSet = _attSetClient.CreateAttributeSet(new DC.AttributeSet() { InternalName = "prod-" + prod.Id }).Result.ReadAsSync();
                prod.AttributeSetId = attSet.Id;
                prod = _productClient.UpdateProduct(prod, prod.ProductCode).Result.ReadAsSync();
            }
            else
            {
                attSet = new DC.AttributeSet() { Id = prod.AttributeSetId, AttributesInAttributeSets = _attSetClient.GetAttributeList(prod.AttributeSetId).Result.ReadAsSync() };
            }
            return attSet;
        }

        static ProductProperty FixUp(ProductProperty val, string productCode)
        {
            val.productCode = productCode;
            return val;
        }
        
        [WebGet(UriTemplate = "/listValue")]
        public Response<List<ProductPropertyValue>> GetProductOptionValueList(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var productCode = extFilter.GetValue<string>("productCode");
            var optionId = extFilter.GetValue<int>("option_id");
            var dmOption = _productClient.GetProductAttribute (productCode, optionId, "AttributeDetails,AttributeValueDetails").Result.ReadAsSync();
            var res = Mapper.Map<List<ProductPropertyValue>>(dmOption.Values ?? new List<DC.ProductAttributeValue>());

            return List(res);
        }
        
        [WebGet(UriTemplate = "/list")]
        public Response<List< ProductProperty >> GetProductOptionList(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var productCode = extFilter.GetValue<string>("productCode");
            var dmOption = _productClient.GetProductAttributes(productCode, 0, 25, "AttributeDetails,AttributeValueDetails").Result.ReadAsSync();

            var productProperties = Mapper.Map<List<ProductProperty>>(dmOption.Items ?? new List<DC.ProductAttribute>()).Select(x => FixUp(x, productCode)).ToList();

            return List(productProperties, (int) dmOption.TotalCount);
        }
    }
}