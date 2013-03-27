using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductTypeHelpers;
using Mozu.SiteBuilder.UX.Admin.MockServices;
using Mozu.SiteBuilder.UX.Admin.MockServices.Mocks;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for product types.
    /// </summary>
    [ServiceContract]
    public class ProductTypeController : BaseController
    {
        private readonly IProductTypeWebApiClient _productTypeClient;

        private readonly CollectionTaskUnMapper<ProductType, DC.ProductType> _productTypeMapper = new CollectionTaskUnMapper<ProductType, DC.ProductType>();

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ProductTypeController(IProductTypeWebApiClient productTypeClient)
        {
            _productTypeClient = productTypeClient;
        }

        /// <summary>
        /// Get a list of Product Types.
        /// </summary>
        [WebGet(UriTemplate = "read")]
        public async Task<Response<List<ProductType>>> ListProductTypes([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                int id;
                try
                {
                    id = Convert.ToInt32(pagingParams.id);
                }
                catch (System.FormatException e)
                {
                    return FailureList2<ProductType>("Invalid id parameter passed." + e.ToString());
                }

                var resultSingle = await _productTypeClient.GetProductType(id);
                DC.ProductType prod = resultSingle.ReadAsAsync().Result;
                return List2(Mapper.Map<ProductType>(prod));
            }

            string filter = extFilter.ToFilterString();
            string sort = null; // pagingParams.sort.ToSortString();

            DC.ProductTypeCollection res;
            var result = await _productTypeClient.GetProductTypes(
                /* startIndex:     */ pagingParams.startIndex,
                /* pageSize:       */ pagingParams.pageSize,
                /* sortBy:         */ sort,
                /* filter:         */ filter,
                /* responseGroups: */ null
            );
            res = result.ReadAsAsync().Result;

            return List2(Mapper.Map<List<ProductType>>(res.Items), (int)res.TotalCount);
        }

        /// <summary>
        /// Create new product types.
        /// </summary>
        [WebInvoke(UriTemplate = "create")]
        public async Task<Response<List<ProductType>>> CreateProductType(List<ProductType> productTypes)
        {
            if (productTypes == null || !productTypes.Any())
                return Message3<List<ProductType>>(false, "No product types were created because they were not sent correctly. Please try again.");

            var createdProductTypes = await _productTypeMapper.PerformAction(productTypes, x => _productTypeClient.AddProductType(x));
            return List2(createdProductTypes.ToList());
        }

        /// <summary>
        /// Edit existing product types.
        /// </summary>
        [WebInvoke(UriTemplate = "update")]
        public async Task<Response<List<ProductType>>> EditProductType(List<ProductType> productTypes)
        {
            if (productTypes == null || !productTypes.Any())
                return Message3<List<ProductType>>(false, "No product types were edited because they were not sent correctly. Please try again.");

            var editedProductTypes = await _productTypeMapper.PerformAction(productTypes, (a, b) => _productTypeClient.UpdateProductType(a, b.Id));
            return List2(editedProductTypes.ToList());
        }

        /// <summary>
        /// Delete existing product types.
        /// </summary>
        [WebInvoke(UriTemplate = "destroy")]
        public async Task<Response<List<ProductType>>> DeleteProductType(List<ProductType> productTypes)
        {
            if (productTypes == null || !productTypes.Any())
                return Message3<List<ProductType>>(false, "No product types were deleted because they were not sent correctly. Please try again.");

            var deletedProducts = await _productTypeMapper.PerformVoidAction(productTypes, x => _productTypeClient.DeleteProductType(x.Id));

            return List2(deletedProducts.ToList());
        }

        /// <summary>
        /// Generates a mock ProductType with all types of attributes on it.
        /// </summary>
        private DC.ProductType GiveTravisAMockProductType()
        {
            return new DC.ProductType
            {
                Options = new List<DC.AttributeInProductType> {
                    // Option - List - String
                    new DC.AttributeInProductType {
                        AttributeDetail = new ColorAttribute(),
                        AttributeFQN = ColorAttribute.ATTRIBUTE_FQN
                    },
                    // Option - List - Number
                    new DC.AttributeInProductType {
                        AttributeDetail = new NumberOfWheelsAttribute(),
                        AttributeFQN = NumberOfWheelsAttribute.ATTRIBUTE_FQN
                    },
                    // Option - List - DateTime
                    new DC.AttributeInProductType {
                        AttributeDetail = new LastTimeYouPaidTaxesAttribute(),
                        AttributeFQN = LastTimeYouPaidTaxesAttribute.ATTRIBUTE_FQN
                    }
                },
                Extras = new List<DC.AttributeInProductType>
                {
                    // Extra - Date - DateTime
                    new DC.AttributeInProductType {
                        AttributeDetail = new ShopperDateAttribute(),
                        AttributeFQN = ShopperDateAttribute.ATTRIBUTE_FQN
                    },

                    // Extra - DateTime - DateTime
                    new DC.AttributeInProductType {
                        AttributeDetail = new ShopperDateTimeAttribute(),
                        AttributeFQN = ShopperDateTimeAttribute.ATTRIBUTE_FQN
                    },

                    // Extra - TextArea - String
                    new DC.AttributeInProductType {
                        AttributeDetail = new EngravingParagraphAttribute(),
                        AttributeFQN = EngravingParagraphAttribute.ATTRIBUTE_FQN
                    },
                    
                    // Extra - TextBox - Number
                    new DC.AttributeInProductType {
                        AttributeDetail = new NumberOfMissingScrewsAttribute(),
                        AttributeFQN = NumberOfMissingScrewsAttribute.ATTRIBUTE_FQN
                    },

                    // Extra - TextBox - String
                    new DC.AttributeInProductType {
                        AttributeDetail = new EngravingAttribute(),
                        AttributeFQN = EngravingAttribute.ATTRIBUTE_FQN
                    },

                    // Extra - YesNo - Boolean
                    new DC.AttributeInProductType {
                        AttributeDetail = new GiftWrapAttribute(),
                        AttributeFQN = GiftWrapAttribute.ATTRIBUTE_FQN
                    }
                },
                Properties = new List<DC.AttributeInProductType> {
                    // Property - Date - DateTime
                    new DC.AttributeInProductType {
                        AttributeDetail = new NewYearsEditionAttribute(),
                        AttributeFQN = NewYearsEditionAttribute.ATTRIBUTE_FQN
                    },
                    // Property - DateTime - DateTime
                    new DC.AttributeInProductType {
                        AttributeDetail = new AppointmentKeeperAttribute(),
                        AttributeFQN = AppointmentKeeperAttribute.ATTRIBUTE_FQN
                    },
                    // Property - TextArea - String
                    new DC.AttributeInProductType {
                        AttributeDetail = new EngravedPoem(),
                        AttributeFQN = EngravedPoem.ATTRIBUTE_FQN
                    },
                    // Property - TextBox - Number
                    new DC.AttributeInProductType {
                        AttributeDetail = new UnitCostAttribute(),
                        AttributeFQN = UnitCostAttribute.ATTRIBUTE_FQN
                    },
                    // Property - TextBox - String
                    new DC.AttributeInProductType {
                        AttributeDetail = new UPCAttribute(),
                        AttributeFQN = UPCAttribute.ATTRIBUTE_FQN
                    },
                    // Property - YesNo - Bool
                    new DC.AttributeInProductType {
                        AttributeDetail = new SmashedToPiecesAttribute(),
                        AttributeFQN = SmashedToPiecesAttribute.ATTRIBUTE_FQN
                    },
                }
            };
        }
    }
}
