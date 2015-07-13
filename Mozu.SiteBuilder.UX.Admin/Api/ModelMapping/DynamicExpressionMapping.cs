using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Category;
using DC = Mozu.ProductAdmin.Contracts;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class DynamicExpressionMapping : Profile
    {
        public override string ProfileName
        {
            get
            {
                return this.GetType().FullName;
            }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DC.DynamicExpression, DynamicExpression>()
                .ForMember(dest => dest.Text, opt => opt.ResolveUsing(c => c.Text))
                .ForMember(dest => dest.Tree, opt => opt.ResolveUsing(c => c.Tree))
                .ForMember(dest => dest.Type, opt => opt.ResolveUsing(c => c.Type));
                //ignores
                // temporarily adding this until service is fleshed out that allows a single type of validation
                //.ForMember(dest => dest.Type, opt => opt.Ignore());


            Mapper.CreateMap<DynamicExpression, DC.DynamicExpression>()
                .ForMember(dest => dest.Text, opt => opt.ResolveUsing(c => (c.Text ?? null)))
                .ForMember(dest => dest.Tree, opt => opt.ResolveUsing(c => c.Tree));
            //.ForMember(dest => dest.Type, opt => opt.Ignore());
        }
    }
}