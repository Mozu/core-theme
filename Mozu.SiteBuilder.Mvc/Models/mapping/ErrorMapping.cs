using AutoMapper;
using System;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.Mvc.MessageHandler;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class ErrorMapping: Profile
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

            Mapper.CreateMap<ErrorCollection, SiteBuilderErrorCollection>();

        }
    }
}