using AutoMapper;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class JObjectMapping : Profile
    {
        public JObjectMapping()
        {
            CreateMap<JObject, JObject>().ConvertUsing(src => src == null ? null : (JObject)src.DeepClone());
        }
    }
}