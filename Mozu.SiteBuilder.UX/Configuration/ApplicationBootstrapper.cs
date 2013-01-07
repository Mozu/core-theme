using System;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;
using System.Web.Routing;
using Autofac;
using Autofac.Integration.Mvc;
using AutoMapper;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.StartupTasks;
using Volusion.SiteBuilder.UX.Models;

namespace Mozu.SiteBuilder.UX.Configuration
{
	/// <summary>
	/// The DependecyBootstrapper class is responsible for kicking off the initialization of the IOC
	/// and the ServiceLocator which all other classes will use to instantiate thier dependencies.
	/// </summary>
	public class ApplicationBootstrapper
	{

        private static IContainer _container;
	    private static IDependencyResolver _resolver;
		private ApplicationBootstrapper() {}
        
		/// <summary>
		/// This is the method that clients call to kickoff the bootstrapper.
		/// </summary>
		public static void Bootstrap()
		{
			//Auto registers any interface/implementations that follow the standard naming convention
			_container = new AutofacContainerFactory()
						//.UsingAssembly(Assembly.Load("Mozu.Core"))

                        .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.UX"))
                        .UsingAssembly(Assembly.Load("Mozu.SiteBuilder.Mvc"))
                        .UsingAssembly(typeof(IStartUpTask).Assembly)
                        //.UsingAssembly(Assembly.Load("Mozu.Core.Api"))
                        //.UsingAssembly(Assembly.Load("Mozu.Core.Api.Contracts"))
						    .UsingAssembly(Assembly.GetExecutingAssembly())
						    .Build();

            _resolver = new AutofacDependencyResolver(_container);

            var profileType = typeof(Profile);


            Mapper.Initialize(mapper =>
            {
                mapper.ConstructServicesUsing(_resolver.GetService );
                typeof(ApplicationBootstrapper).Assembly.GetTypes().Concat(typeof(Mozu.SiteBuilder.Mvc.ISiteBuilderContext).Assembly.GetTypes())
                    .Where(x => x.IsSubclassOf(profileType))
                    .Select(y => (Profile)System.Activator.CreateInstance(y)).ToList()
                    .ForEach(mapper.AddProfile);
            });

            ModelBinders.Binders.DefaultBinder = new JsonModelBinder();

            InitLogging();

            //ValueProviderFactories.Factories.Remove(ValueProviderFactories.Factories.OfType<JsonValueProviderFactory>().FirstOrDefault());
           // ValueProviderFactories.Factories.Add(new JsonNetValueProviderFactory());

			DependencyResolver.SetResolver(_resolver);
            new RoutingConfigurationStartupTask().RegisterRoutes(RouteTable.Routes);
		}

	    private static void InitLogging()
	    {
            LoggingService.InitializeLoggingServiceFactory(new MozuLoggingServiceFactory());
            LoggingService.LoggingServiceFactory.CreateLoggingService = () => _resolver.GetService<ILoggingService>();
            LoggingService.LoggerFor<ApplicationBootstrapper>().Debug("Starting up the Taco!");
	    }
	}
}