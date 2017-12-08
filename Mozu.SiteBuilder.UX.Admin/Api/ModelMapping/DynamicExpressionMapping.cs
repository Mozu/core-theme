using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using DC = Mozu.ProductAdmin.Contracts;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class DynamicExpressionMapping : Profile
    {
        public DynamicExpressionMapping()
        {
            CreateMap<DC.DynamicExpression, DynamicExpression>()
                .ForMember(dest => dest.Text, opt => opt.ResolveUsing(c => c.Text))
                .ForMember(dest => dest.Tree, opt => opt.ResolveUsing(c => c.Tree))
               // .ForMember(dest => dest.Type, opt => opt.ResolveUsing(c => c.Type));
                //ignores
                // temporarily adding this until service is fleshed out that allows a single type of validation
                .ForMember(dest => dest.Type, opt => opt.Ignore());


            CreateMap<DynamicExpression, DC.DynamicExpression>()
                .ForMember(dest => dest.Text, opt => opt.ResolveUsing(c => (c.Text ?? null)))
                .ForMember(dest => dest.Tree, opt => opt.ResolveUsing(c => c.Tree));
            //.ForMember(dest => dest.Type, opt => opt.Ignore());
        }
    }
}