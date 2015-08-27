using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using Mozu.Core.Api.ErrorHandler;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.UX.Admin.Api.ErrorHandlers
{
    //todo: eventually remove in R5 once Wayne makes GetDefaults public - Greg Murray on 2014-04-04 
    public class FriendlyExceptionResponseBuilderCollection : IExceptionResponseBuilderCollection
    {
        private readonly List<IExceptionResponseBuilder> _builders = new List<IExceptionResponseBuilder>();

		public FriendlyExceptionResponseBuilderCollection(ISettings settings)
		{   
            //"ReturnDetailedExceptionInfo"
		    _builders.AddRange(settings.AppSettingsAsNullableBool("FriendlyExceptionInfo").GetValueOrDefault(true)
		        ? GetFriendlyBuilders()
		        : GetDefaultBuilders() );
		}

        //public FriendlyExceptionResponseBuilderCollection(IEnumerable<IExceptionResponseBuilder> items)
        //{
        //    if (items == null) throw new ArgumentNullException("items");

        //    foreach (IExceptionResponseBuilder item in items)
        //    {
        //        if (item == null) throw new ArgumentException("Cannot have null item in list");

        //        _builders.Add(item);
        //    }
        //}

		/// <summary>
		///     Response builders will be looked at in the order they are registered.
		/// </summary>
		/// <param name="exceptionType"></param>
		/// <returns></returns>
		private IExceptionResponseBuilder FindExceptionResponseBuilderFor(Type exceptionType)
		{
			IExceptionResponseBuilder builder =
				_builders.FirstOrDefault(
					i => i.HandlesExceptionType == exceptionType || exceptionType.BaseType == i.HandlesExceptionType) ??
				_builders.FirstOrDefault(i => exceptionType.IsSubclassOf(i.HandlesExceptionType));

			return builder;
		}

        private static IEnumerable<IExceptionResponseBuilder> GetDefaultBuilders()
        {
            //These are order dependent.
            return new IExceptionResponseBuilder[]
            {
                new ValidationConflictExceptionResponseBuilder(),
                new ApiClientAbstractExceptionResponseBuilder(),
                new InvalidOrMissingTokenExceptionResponseBuilder(),
                new MozuApplicationExceptionResponseBuilder(),
                new AggregateExceptionResponseBuilder(),
                new SystemExceptionResponseBuilder()
            };
        }

        private static IEnumerable<IExceptionResponseBuilder> GetFriendlyBuilders()
        {
            //These are order dependent.
            return new IExceptionResponseBuilder[]
            {
                new ValidationConflictExceptionResponseBuilder(),
                new ApiClientAbstractExceptionResponseBuilder(),
                new InvalidOrMissingTokenExceptionResponseBuilder(),
                new MozuApplicationExceptionResponseBuilder(),
                new FriendlyAggregateExceptionResponseBuilder(), 
                new SystemExceptionResponseBuilder()
            };
        }

		#region Implementation of IAbstractExceptionResponseBuilder

		public HttpResponseMessage BuildResponseMessage(Exception exception, bool includeExceptionDetail,
			MediaTypeFormatter formatter)
		{
			//remember, IHttpMessageHandlerErrorHandler now uses this too, so actionExecutedContext can be null

			IExceptionResponseBuilder builder = FindExceptionResponseBuilderFor(exception.GetType());
			if (builder == null)
				throw new InvalidOperationException(string.Format("No ExceptionResponseBuilder registered for {0}",
					exception.GetType()));

			return builder.BuildResponseMessage(exception, includeExceptionDetail, formatter);
        }

        #endregion
    }
}