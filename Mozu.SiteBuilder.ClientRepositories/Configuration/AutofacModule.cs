using System;
using System.Configuration;
using System.Net.Http;
using Autofac;
using Volusion.Core.Configuration;
using Volusion.SiteBuilder.ClientRepositories.Admin.ServiceClients;
using Volusion.SiteBuilder.ClientRepositories.ServiceClient;
using Volusion.SiteBuilder.Mvc;

namespace Volusion.SiteBuilder.ClientRepositories.Configuration
{
	public class AutofacModule : Module
	{
		

		public bool UseMockRepos
		{
			get
			{
				bool result;
				Boolean.TryParse(ConfigurationManager.AppSettings["UseMockRepos"], out result);
				return result;
			}
		}

		/// <summary>
		/// Override to add registrations to the container.
		/// </summary>
		/// <remarks>
		/// Note that the ContainerBuilder parameter is unique to this module.
		/// </remarks>
		/// <param name="builder">The builder through which components can be
		///             registered.</param>
		protected override void Load(ContainerBuilder builder)
		{
			builder.Register(c => new JsonResourceUriMappingProvider(ConfigurationManager.AppSettings["ResourceUriList"]))
				.As<IResourceUriMappingProvider>()
				.SingleInstance();

			//TODO: remove mock to their own assy and handle loading from UX so we dont need this code here.
            //load mocks first
            builder.RegisterAssemblyTypes(ThisAssembly) 
                    .Where(t=> (t.IsClosedTypeOf(typeof(IRepository<>)) || t.IsClosedTypeOf(typeof(IServiceClient<>))) && t.Name.StartsWith("Mock"))
                    .AsImplementedInterfaces()
						  .InstancePerLifetimeScope();

			//TODO: rationalize IRepository & IServiceContract repos so we dont' need both of these
            // add in real types
			builder.ScanAssemblyAndRegisterTypes(ThisAssembly,
				t=> (t.IsClosedTypeOf(typeof(IRepository<>)) || t.IsClosedTypeOf(typeof(IServiceClient<>))) && !t.Name.StartsWith("Mock"))
				.AsImplementedInterfaces()
				.InstancePerLifetimeScope();

           
			//TODO: remove mock to their own assy and handle loading from UX so we dont need this code here.
            //if only mocks add em back in
			if(UseMockRepos)
			{
				
				builder.RegisterAssemblyTypes(ThisAssembly)
					.Where(t => (t.IsClosedTypeOf(typeof(IRepository<>)) || t.IsClosedTypeOf(typeof(IServiceClient<>))) && t.Name.StartsWith("Mock"))
					.AsImplementedInterfaces().InstancePerLifetimeScope();
			}
		}
	}
}