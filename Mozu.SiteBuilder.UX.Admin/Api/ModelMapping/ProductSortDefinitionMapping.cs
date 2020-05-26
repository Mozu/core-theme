using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductSortDefinitions;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class ProductSortDefinitionMapping : Profile
    {
        public ProductSortDefinitionMapping()
        {
            CreateMap<ProductRuntime.Contracts.Product, ProductSortDefinitionPreviewProduct>()
                .ForMember(d => d.Position, opt => opt.Ignore())
                .ForMember(d => d.IsRanked, opt => opt.Ignore())
                .ForMember(d => d.IsPinned, opt => opt.Ignore())
                .ForMember(d => d.IsBuried, opt => opt.Ignore())
                .ForMember(d => d.NotAvailableInStorefront, opt => opt.Ignore())
                
                //.ForMember(d => d.Name,
                //    opt => opt.ResolveUsing(r => r.Content != null ? r.Content.ProductName : string.Empty))
                //.ForMember(d => d.Price, opt => opt.ResolveUsing(r => r.Price != null
                //    ? r.Price.CatalogListPrice
                //    : (r.PriceRange != null ? r.PriceRange.Lower?.Price : ((decimal?) null))))
                //.ForMember(d => d.SalePrice, opt => opt.ResolveUsing(r => r.Price != null
                //    ? r.Price.SalePrice
                //    : (r.PriceRange != null ? r.PriceRange.Lower?.SalePrice : ((decimal?) null))))
                //.ForMember(d => d.ImageUrl,
                //    opt => opt.ResolveUsing(r => r.Content?.ProductImages?.FirstOrDefault()?.ImageUrl ?? string.Empty))
                ;

            CreateMap<ProductSortDefinition, DC.ProductSortDefinition>()
                .ForMember(d => d.ProductSortDefinitionId, opt => opt.ResolveUsing(s => s.Id))
                .ForMember(d => d.SortExpressions, opt => opt.ResolveUsing(s => s.SortExpressions))
                .ForMember(d => d.Boosted, opt => opt.ResolveUsing(s => s.Products.Where(p => p.IsRanked == true)))
                .ForMember(d => d.Buried, opt => opt.ResolveUsing(s => s.Products.Where(p => p.IsBuried == true)))
                .ForMember(d => d.AuditInfo, opt => opt.Ignore());

            CreateMap<DC.ProductSortDefinition, ProductSortDefinition>()
                .ForMember(d => d.Id, opt => opt.ResolveUsing(s => s.ProductSortDefinitionId))
                .ForMember(d => d.SortExpressions, opt => opt.ResolveUsing(s => s.SortExpressions))
                .ForMember(d => d.Products, opt => opt.ResolveUsing(s => s.Boosted.Concat(s.Buried)));

            CreateMap<SortingCollectionItem, DC.ProductSortExpression>()
                .ForMember(d => d.Direction, opt => opt.ResolveUsing(s => s.direction))
                .ForMember(d => d.Field, opt => opt.ResolveUsing(s => s.property));

            CreateMap<DC.ProductSortExpression, SortingCollectionItem>()
                .ForMember(d => d.direction, opt => opt.ResolveUsing(s => s.Direction))
                .ForMember(d => d.property, opt => opt.ResolveUsing(s => s.Field));

            CreateMap<ProductSortPosition, DC.ProductSortOverride>()
                ;

            CreateMap<DC.ProductSortOverride, ProductSortPosition>()
                .ForMember(d => d.IsBuried, opt => opt.ResolveUsing(s => s.Position < 0))
                .ForMember(d => d.IsRanked, opt => opt.ResolveUsing(s => s.Position >= 1))
                .ForMember(d=>d.UniqueKey, o=>o.Ignore());
        }
    }
}