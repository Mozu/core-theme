using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;
using DC = Mozu.ProductAdmin.Contracts;
//using DC = Volusion.Attribute.Contracts.Administration;
using Mozu.ProductAdmin.Contracts.Clients;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Options;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using AutoMapper;
namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class ProductOptionsController : BaseController
    {
        private readonly IAttributeWebApiClient _attClient;


        private readonly IProductWebApiClient _productClient;

        private readonly IAttributeSetWebApiClient _attSetClient;

        public ProductOptionsController(IAttributeWebApiClient attClient,
           IAttributeSetWebApiClient attSetClient,
            IProductWebApiClient productClient)
        {
            _attClient = attClient;
            _attSetClient = attSetClient;
            _productClient = productClient;
        }

        [WebInvoke(UriTemplate = "/create")]
        public Response<List<ProductOption>> CreateProductOption(List<ProductOption> options)
        {
            throw new NotImplementedException();
           // return EditProductOption(options);
        }

        

        [WebInvoke(UriTemplate = "/delete")]
        private Response<List<ProductOption>> DeletePO  ( List<ProductOption> options)
        {
            bool success = true;
             foreach (var vm in options)
            {
                    if( vm.Intention  == "configuration")
                    {
                         var res =this._productClient.DeleteConfigurableOption( vm.productCode, vm.Id).Result.ResponseMessage;
                        if ( !res.IsSuccessStatusCode )
                        {
                            success = false;
                        }
                    }
                    else
                    {
                         var res = this._productClient.DeleteProductOption(vm.productCode, vm.Id).Result.ResponseMessage;
                         if (!res.IsSuccessStatusCode)
                         {
                             success = false;
                         }
                    }
                
             }
            return new Response<List<ProductOption>>()
                       {
                           Success = success
                       };

        }


        [WebInvoke(UriTemplate = "/edit")]
        public Task<Response<List<ProductOption>>> EditProductOption(List<ProductOption> options)
        {
            var prod = _productClient.GetProductByProductCode (options.First().productCode, null).Result.ReadAsSync();

            var attSet = _attSetClient.GetResequenceAttributesInSets(prod.AttributeSetId).Result.ReadAsSync();
            foreach (var vm in options)
            {
                var idx = attSet.FindIndex(x => x.Id == vm.Id);
                var dc = attSet[idx];
                attSet.RemoveAt(idx);
                attSet.Insert(vm.sequence.Value, dc);
            }
            _attSetClient.ResequenceAttributesInAttributeSets(attSet.ToArray(), prod.AttributeSetId, true).Result.ReadAsSync();

            return List(options);
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

        [WebInvoke(UriTemplate = "/createValue?id={id}")]
        public Task<Response<List<ProductOptionValue>>> CreateProductOptionValue(List<ProductOptionValue> optionValues, int? id = null)
        {
            var attSets = new Dictionary<int, DC.AttributeSet>();
            var vmsGroups = optionValues.GroupBy(x => x.option_id);
            foreach (var vms in vmsGroups.Select(x => x.ToList()))
            {
                var prodCode = vms[0].productCode;
                var option_id = vms[0].option_id;
                var intention = vms[0].intention.GetValueOrDefault(OptionIntentions.standAlone);
                DC.AttributeSet attSet;
                attSet = GetCreateAttributeSetByProductId(prodCode);
                var dms = Mapper.Map<List<DC.ProductOptionValue>>(vms);
                var att = attSet.AttributesInAttributeSets.FirstOrDefault(x => x.Id == option_id);

                if (att == null)
                {
                    _attSetClient.CreateAttributeInAttributeSet(new DC.AttributeInAttributeSet() { Id = option_id }, attSet.Id).Result.ReadAsSync();

                }
                if (intention == OptionIntentions.configuration)
                {
                    var dmOptions = new DC.ProductAttribute()
                    {
                        Id = option_id,
                        Values = new List<DC.ProductAttributeValue>(vms.Select(x => new DC.ProductAttributeValue() { Id = x.Id }))

                    };
                    _productClient.UpdateConfigurableOption(dmOptions, prodCode, option_id).Result.ReadAsSync();
                }
                else if (intention == OptionIntentions.standAlone)
                {
                    var dmOptions = new DC.ProductOption()
                            {
                                Id = option_id,
                                Values = dms
                            };

                    _productClient.UpdateProductOption(dmOptions, prodCode, option_id).Result.ReadAsSync();
                }
                else if (intention == OptionIntentions.spec)
                {
                    var dmOptions = new DC.ProductAttribute()
                    {
                        Id = option_id,
                        Values = new List<DC.ProductAttributeValue>(vms.Select(x => new DC.ProductAttributeValue() { Id = x.Id }))

                    };

                    _productClient.UpdateProductAttribute(dmOptions, prodCode, option_id).Result.ReadAsSync();
                }
            }
            return EmptyList<ProductOptionValue>();
        }

        [WebInvoke(UriTemplate = "/editValue?id={id}")]
        public Task<Response<List<ProductOptionValue>>> EditProductOptionValue(List<ProductOptionValue> optionValues)
        {
            var dms = Mapper.Map<List<DC.ProductOptionValue>>(optionValues);
            var prodCode = optionValues[0].productCode;
            var option_id = optionValues[0].option_id;
            var intention = optionValues[0].intention.GetValueOrDefault(OptionIntentions.standAlone);

            if (intention != OptionIntentions.standAlone)
            {
                throw new InvalidOperationException("fu effer");
            }
            var dmOptions = _productClient.GetProductOption(prodCode, option_id, "AttributeValueDetails").Result.ReadAsSync();




            foreach (var dm in dms)
            {
                var idx = dmOptions.Values.FindIndex(x => x.Id == dm.Id);
                dmOptions.Values.RemoveAt(idx);
                dmOptions.Values.Insert(idx, dm);
             }
            _productClient.UpdateProductOption(dmOptions, prodCode, option_id).Result.ReadAsSync();

            return List(optionValues);
        }

        ProductOption FixUp(ProductOption val, string productCode)
        {
            val.productCode = productCode;
            return val;
        }
        ProductOptionValue FixUp(ProductOptionValue val, string productCode, int opitonId)
        {
            val.productCode = productCode;
            val.option_id = opitonId;
            return val;
        }

        [WebGet(UriTemplate = "/listValue")]
        public Task<Response<List<ProductOptionValue>>> GetProductOptionValueList(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            var productCode = extFilter.GetValue<string>("productCode");
            var optionId = extFilter.GetValue<int>("option_id");

            if (string.IsNullOrEmpty(productCode) || optionId < 1)
            {
                return EmptyList<ProductOptionValue>();
            }
            var dmOption = _productClient.GetProductOption(productCode, optionId, "AttributeDetails,AttributeValueDetails").Result.ReadAsSync();
            
            var res = Mapper.Map<List<ProductOptionValue>>(dmOption.Values ?? new List<DC.ProductOptionValue>()).Select(x => FixUp(x, productCode, optionId)).ToList();

            return List(res);
        }




        [WebGet(UriTemplate = "/list")]
        public Task<Response<List<ProductOption>>> GetProductOptionList(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            // TODO: Need to switch this to ProductCode
            var productCode = extFilter.GetValue<string>("productCode");

            if (string.IsNullOrEmpty(productCode))
            {
                return EmptyList<ProductOption>();
            }

            var dmOption = _productClient.GetProductOptions(productCode, 0, 25, "AttributeDetails,AttributeValueDetails").Result.ReadAsSync();
            var ret=  Mapper.Map<List<ProductOption>>(dmOption.Items ?? new List<DC.ProductOption>()).Select(x => FixUp(x, productCode)).ToList();
            if ( dmOption.Items != null && dmOption .Items.Count > 0 )
            {
                var prod = _productClient.GetProductByProductCode (extFilter.GetValue<string>("productCode"),null).Result.ReadAsSync();
                var attSet = _attSetClient.GetResequenceAttributesInSets(prod.AttributeSetId ).Result.ReadAsSync();
                ret.ForEach ( po=> po.sequence = attSet.FindIndex (x => x.Id == po.Id));                
            }

            return List(ret, (int) dmOption.TotalCount);
        }

    }
}