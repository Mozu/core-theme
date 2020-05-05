//using Mozu.Core;
//using System;
//using System.Collections.Generic;
//using System.Text;
//using Microsoft.Extensions.DependencyInjection;

//namespace Mozu.SiteBuilder.Mvc
//{
//    //quick hack to get around httpcontext not being acceable in background tasks.
//    public class SBAPiContextAccessor : IApiContextAccessor
//    {
//        public SBAPiContextAccessor(IServiceProvider serviceProvider)
//        {
//            //Calling service provider here because it returns a null when something isn't registered
//            try
//            {
//                var factory = serviceProvider.GetService<IApiContextFactory>();
//                if (factory != null)
//                {
//                    ApiContext = factory.CreateContext();
//                }
//            }
//            catch { }
//        }

//        public IApiContext ApiContext { get; set; }
//    }
//}
