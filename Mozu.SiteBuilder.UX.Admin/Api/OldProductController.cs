using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.ProductAdmin.Contracts.Clients;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using AutoMapper;
using System.Net.Http;
using System.Text;
using System.Linq.Expressions;
using System.Web.Mvc;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class OldProductController : BaseController
    {
        class PropertyGuy
        {
            public static string Convert<T>(Expression<Func<DC.Product, T>> exp)
            {
                return ExpressionHelper.GetExpressionText(exp);
            }

        }
        internal static string CreateSort(PagingParamaters pageing)
        {
            if (pageing == null || pageing.sort == null || pageing.sort.Count == 0)
                return null;


            
            var sb = new StringBuilder();

            foreach (var sort in pageing.sort)
            {
                if (sb.Length > 0)
                {
                    sb.Append(" and ");
                }

                switch (sort.property.ToLowerInvariant())
                {
                    case "categoryids":
                        sb.Append("CategoryId");
                        break;
                    case "isactive":
                        sb.Append("IsActive");
                        break;
                    case "productname":
                    case "name":
                        sb.Append(PropertyGuy.Convert(x => x.Content.ProductName));

                        break;
                    case "saleprice":
                    case "price":
                        sb.Append(PropertyGuy.Convert(x => x.Price.Price));
                       
                        break;
                    case "productcode":
                        sb.Append(PropertyGuy.Convert(x => x.ProductCode ));
                        break;
                    case "stockonhand":
                        sb.Append(PropertyGuy.Convert(x => x.StockAvailable ));
                        break;
                    default:
                        {
                            throw new InvalidOperationException("unknown sort.property " + sort.property);
                        }
                }
                sb.Append (sort.IsAscending ? " asc" : " desc");
            }

            return sb.ToString();
        }

        internal static string CreateFilter(FilterCollection extFilter)
        {
            if (!string.IsNullOrEmpty(extFilter.query))
                extFilter.Add(new FilterCollectionItem { comparison = "cont", field = PropertyGuy.Convert(x => x.Content.ProductName), value = extFilter.query });

            if (extFilter.Count == 0)
                return null;

            var sb = new StringBuilder();

            foreach (var filter in extFilter)
            {
                if (sb.Length > 0)
                {
                    sb.Append(" and ");
                }

                switch (filter.property.ToLowerInvariant())
                {
                    case "categoryids":
                        sb.AppendFormat("CategoryId {1} {0}", filter.value, filter.comparison);
                        break;
                    case "isactive":
                        sb.AppendFormat("{2} {1} {0}", filter.value, filter.comparison, "IsActive");
                        break;
                    case "productname":
                    case "name":
                        sb.AppendFormat("({1} cont \"{0}\" or {2} cont \"{0}\")", filter.value, PropertyGuy.Convert(x => x.Content.ProductName), PropertyGuy.Convert(x => x.ProductCode));
                        
                        break;
                    case "price":
                        sb.AppendFormat("{2} {1} {0}", filter.value, filter.comparison, PropertyGuy.Convert(x => x.Price.Price));
                        break;
                }
            }
            
            return sb.ToString();
        }
    }
}