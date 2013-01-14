using System.Collections.Generic;
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
using System.Text;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class OptionsController : BaseController
    {
    
        private readonly IAttributeWebApiClient  _attClient;

        public OptionsController(IAttributeWebApiClient attClient)
        {
            _attClient = attClient;
        }

        [WebInvoke(UriTemplate = "create?id={id}")]
        public Task<Response<List<Option>>> CreateOption(Option option, int? id = null)
        {
            var dm = Mapper.Map<DC.Attribute>(option);
            
            var ret = _attClient.AddAttribute(dm).Result.ReadAsSync();
            var vmRet = Mapper.Map<Option>(ret);
            vmRet.clientId = option.clientId;

            return List(vmRet);
        }

         [WebInvoke(UriTemplate = "createValue?id={id}")]
        public Task<Response<List<OptionValue>>> CreateOptionValue(List<OptionValue> optionValue, int? id = null)
        {
            var rets = new List<OptionValue>();
            foreach (var vm in optionValue)
            {
                var dm = Mapper.Map<DC.AttributeValue>(vm);
                var ret = _attClient.AddAttributeValue(dm, vm.option_id).Result.ReadAsSync();
                var vmRet = Mapper.Map<OptionValue>(ret);
                vmRet.clientId = vm.clientId;
                rets.Add(vmRet);
            }
            
            return List(rets, 1);
        }
         [WebInvoke(UriTemplate = "editValue?id={id}")]
         public Task<Response<List<OptionValue>>> EditOptionValue(List<OptionValue> optionValue, int? id = null)
         {
             var rets = new List<OptionValue>();

             foreach (var vm in optionValue)
             {
                 var dm = Mapper.Map<DC.AttributeValue>(vm);
                 var ret = _attClient.UpdateAttributeValue(dm, vm.option_id, dm.Id).Result.ReadAsSync();
                 var vmm = Mapper.Map<OptionValue>(ret);
                 vmm.option_id = vm.option_id;
                 rets.Add(vmm);
             }

             return List(rets, 1);
         }

         [WebInvoke(UriTemplate = "deleteValue?id={id}")]
         public Task<Response<List<OptionValue>>> DeleteOptionValue(List<OptionValue> optionValues, int? id = null)
         {
            // List<OptionValue> ret = new List<OptionValue>();
             foreach (var vm in optionValues)
             {
                 var dm = Mapper.Map<DC.AttributeValue>(vm);
                 _attClient.DeleteAttributeValue(dm, vm.option_id, dm.Id).Wait();
             }
             return EmptyList<OptionValue>();
         }

         [WebInvoke(UriTemplate = "delete?id={id}")]
         public Task<Response<OptionValue>> DeleteOption(Option option, int? id = null)
         {
             var dm = Mapper.Map<DC.Attribute>(option);
             var res = _attClient.DeleteAttribute(dm.Id).Result;
             if ( res.HasException)
             {
                 throw res.ReadException();
             }
             return EmptySingle<OptionValue>(res.ResponseMessage.IsSuccessStatusCode);
         }

         [WebGet(UriTemplate = "listValue")]
         public Task<Response<List<OptionValue>>> GetOptionValueList(PagingParamaters pagingParams, FilterCollection extFilter)
         {
             int tmp;
             var optionId = extFilter.TryGetValue("option_id", out tmp) ? (int?)tmp: null;

              if (optionId.GetValueOrDefault (0) <1 )
              {
                  return EmptyList<OptionValue>();
              }
              var res = _attClient.GetAttributeValues(optionId, pagingParams.startIndex, pagingParams.pageSize, "LocalizedContent").Result.ReadAsSync() ?? new DC.AttributeValueCollection {  Items = new List<DC.AttributeValue>()};

              var res2 = Mapper.Map<List<OptionValue>>(res.Items).OrderBy(x => x.Sequence).ToList();

              res2.ForEach(x => x.option_id = optionId);
              return List(res2, (int) res.TotalCount);
         }
        
        [WebInvoke(UriTemplate = "edit?id={id}")]
        public Task<Response<List<Option>>> EditOption(Option option, int? id = null)
        {
            var dm = Mapper.Map<DC.Attribute>(option);
            var ret = _attClient.UpdateAttribute(dm, dm.Id).Result.ReadAsSync();
            var dmr = Mapper.Map<Option>(ret);
            return List(dmr);
        }

        [WebGet(UriTemplate = "autocomplete/?query={query}")]
        public Task<Response<List<AutoCompleteField<int?>>>> SearchByName(string query, FilterCollection extFilter)
        {
            var filter = CreateFilter(extFilter, query);
            var res = _attClient.GetAttributesCollection(null, null, "InternalName", "LocalizedContent", filter).Result.ReadAsSync();

            if(res.Items != null)
            {
                var fields = res.Items.Select(option => new AutoCompleteField<int?>
                {
                    Display = option.InternalName,
                    Value = option.Id,
                    IsConfigurable = option.IsConfigurable 
                }).ToList();

                return List(fields);
            }

            return EmptyList<AutoCompleteField<int?>>();
        }
        
        [WebGet(UriTemplate = "list?query={query}")]
        public Task<Response<List<Option>>> GetOptionList(PagingParamaters pagingParams, FilterCollection extFilter, string query)
        {
            if (pagingParams.NumericId != null )
            {
                var prod = _attClient.GetAttribute(pagingParams.NumericId, "LocalizedContent,ProductCount").Result.ReadAsSync();
                return List(Mapper.Map<Option>(prod));
            }

            var filter = CreateFilter(extFilter, query);
            var res = _attClient.GetAttributesCollection(pagingParams.startIndex, pagingParams.pageSize, "InternalName", "LocalizedContent,ProductCount", filter).Result.ReadAsSync();

            return List(Mapper.Map<List<Option>>(res.Items), (int) res.TotalCount);
        }

        private static string CreateFilter(FilterCollection extFilter, string query )
        {
            if (!string.IsNullOrEmpty(query))
            {
                return string.Format("InternalName.cont({0})", query);
            }
            if (extFilter == null || extFilter.Count == 0)
                return null;

            var sb = new StringBuilder();
            
            foreach (var filter in extFilter)
            {
                if (sb.Length > 0)
                {
                    sb.Append(";");
                }

                switch (filter.property.ToLowerInvariant())
                {

                    case "internalname":
                        {
                            sb.AppendFormat("InternalName.cont({0})", filter.value);
                            break;
                        }
                    case "isactive":
                        {
                            sb.AppendFormat("IsActive.{1}({0})", filter.value, filter.comparison);
                            break;
                        }
                    case "productname":
                        {
                            //ProductName.cont(poOpoo1);Price.gte(100)
                            sb.AppendFormat("ProductName.cont({0})", filter.value);
                            break;
                        }
                    case "price":
                        {
                            //ProductName.cont(poOpoo1);Price.gte(100)
                            sb.AppendFormat("Price.{1}({0})", filter.value, filter.comparison);
                            break;
                        }
                    case "isconfigurable":
                        {
                            sb.AppendFormat("IsConfigurable eq {0}", filter.value);
                            break;
                        }
                }
            }
            return sb.ToString();
        }
    }
}