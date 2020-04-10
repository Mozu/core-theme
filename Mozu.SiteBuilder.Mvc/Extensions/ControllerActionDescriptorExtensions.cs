using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.Mvc.Controllers;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class ControllerActionDescriptorExtensions
    {
        public static bool HasAttribute<T>(this ControllerActionDescriptor descriptor)
        {
            return descriptor.MethodInfo.GetCustomAttributes(false).OfType<T>().Any();
        }
    }
}
