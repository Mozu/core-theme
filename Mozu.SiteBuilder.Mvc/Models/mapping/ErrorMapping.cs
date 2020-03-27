using AutoMapper;
using System;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class ErrorMapping: Profile
    {
        public ErrorMapping()
        { 

            CreateMap<ErrorCollection, SiteBuilderErrorCollection>();

        }
    }
}