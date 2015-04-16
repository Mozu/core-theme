using AutoMapper;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class JObjectMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<JObject, JObject>().ConvertUsing(src => src == null ? null : (JObject)src.DeepClone());
        }
    }
}