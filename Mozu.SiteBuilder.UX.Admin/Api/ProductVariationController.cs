using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;
using DC = Mozu.ProductAdmin.Contracts;
//using DC = Volusion.Attribute.Contracts.Administration;
using Mozu.ProductAdmin.Contracts.Clients;
using System.ServiceModel.Web;
using System.Net.Http;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Options;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using AutoMapper;
using System.Runtime.Serialization;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class ProductVariationController : BaseController
    {
        //private readonly IAttributeWebApiClient _attClient;


        //private readonly IProductWebApiClient _productClient;

        //private readonly IAttributeSetWebApiClient _attSetClient;

        //public ProductVariationController(IAttributeWebApiClient attClient,
        //   IAttributeSetWebApiClient attSetClient,
        //    IProductWebApiClient productClient)
        //{
        //    _attClient = attClient;
        //    _attSetClient = attSetClient;
        //    _productClient = productClient;
        //}
        
        //[WebInvoke(UriTemplate = "edit")]
        //public Task<Response<List<ProductVariation>>> EditProductVariants(List<ProductVariation> variants)
        //{
        //    if (variants.Count > 0)
        //    {
        //        var dcs = Mapper.Map<List<DC.ProductVariation>>(variants);



        //        var ret = _productClient.UpdateProductVariations(new DC.ProductVariationCollection() { Items = dcs }, variants[0].ProductCode).Result.ReadAsSync();
        //        var productVariations = Mapper.Map<List<ProductVariation>>(ret.Items);

        //        return List(productVariations);
        //    }

        //    return EmptyList<ProductVariation>();
        //}
        
        //[WebGet(UriTemplate = "list")]
        //public Task<Response<List<ProductVariation>, VariantMetaData>> GetProductVariants(PagingParamaters pagingParams, FilterCollection extFilter)
        //{
        //    var productCode = extFilter.GetValue<string>("productCode");
            
        //    if (string.IsNullOrEmpty(productCode))
        //    {
        //        return ListWithMetaData(default(List<ProductVariation>), default(VariantMetaData));
        //    }
            
        //    var dcs = _productClient.GetProductVariations(productCode, pagingParams.startIndex, pagingParams.pageSize, null, null ).Result.ReadAsSync();

        //    var metaData = new VariantMetaData()
        //    {
        //        fields = new List<VariantMetaDataFieldItem>()
        //    };

        //    if ( dcs.Items != null && dcs.Items.Count> 0 )
        //    {
        //        for ( var i =0 ; i< dcs.Items[0].Options.Count ; i++ )
        //        {
        //            metaData.fields.Add(new VariantMetaDataFieldItem()
        //                {
        //                    caption = dcs.Items[0].Options [i].AttributeInternalName ,
        //                    fieldName = "optionValue" + (i+1),
        //                    key = dcs.Items[0].Options [i].AttributeId.ToString (CultureInfo.InvariantCulture)
        //                });
        //        };
        //    }

        //    var productVariations = Mapper.Map<List<ProductVariation>>(dcs.Items ?? new List<DC.ProductVariation>()).Select(x => FixUp(x, productCode)).ToList();

        //    return ListWithMetaData(productVariations, metaData, (int) dcs.TotalCount);
        //}

        //static ProductVariation FixUp(ProductVariation val, string productCode)
        //{
        //    val.ProductCode = productCode;
        //    return val;
        //}
    }

     [DataContract()]
    public class VariantMetaData
    {
         [DataMember (Name="options")]
        public List<VariantMetaDataFieldItem> fields
        {
            get;
            set;
        }
    }

    [DataContract ()]
    public class VariantMetaDataFieldItem
    {
        [DataMember(Name = "fieldName", EmitDefaultValue = false)]
        public string fieldName
        {
            get;
            set;
        }
        [DataMember(Name = "caption", EmitDefaultValue = false)]
        public string caption
        {
            get;
            set;
        }
        [DataMember(Name = "key", EmitDefaultValue = false )]
        public string key
        {
            get;
            set;
        }
    }
}