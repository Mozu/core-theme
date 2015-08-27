using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.ErrorHandler;

namespace Mozu.SiteBuilder.UX.Admin.Api.ErrorHandlers
{
    public class FriendlyAggregateExceptionResponseBuilder : AbstractExceptionResponseBuilder<AggregateException>
    {
        #region Overrides of AbstractExceptionResponseBuilder

        protected override ErrorCollection GetHttpError(AggregateException aex, bool includeExceptionDetail)
        {
            if (aex == null) return null;

            ErrorCollection retVal = null;

            var theWorldIsFlattened = aex.Flatten();

            if (theWorldIsFlattened.InnerExceptions.Count > 1)
            {
                retVal = BuildErrorCollection(theWorldIsFlattened, includeExceptionDetail);
                retVal.Message = CombineMultipleErrorMessages(theWorldIsFlattened);
                if (retVal.ExceptionDetail != null)
                    retVal.ExceptionDetail.Message = retVal.Message;
            }
            else
            {
                retVal = BuildErrorCollection(theWorldIsFlattened.InnerExceptions[0], includeExceptionDetail);
            }

            retVal.Items =
                (aex.InnerExceptions != null && aex.InnerExceptions.Count > 0) ? BuildFromInnerExceptions(aex, includeExceptionDetail) : null;

            return retVal;
        }

        #endregion

        private List<Error> BuildFromInnerExceptions(AggregateException ae, bool includeExceptionDetail)
        {
            return ae.InnerExceptions.Select(e => BuildError(e, includeExceptionDetail)).ToList();
        }

        /// <summary>
        /// aex has already been flattened, so just loops through innerExceptions.
        /// </summary>
        /// <param name="aex"></param>
        /// <param name="messageContext"></param>
        /// <returns></returns>
        private static string CombineMultipleErrorMessages(AggregateException aex)
        {
            var sb = new StringBuilder();
            sb.Append("<ul>");
            foreach (var ex in aex.InnerExceptions)
            {
                sb.Append("<li>").Append(ex.Message).Append("</li>");
            }
            sb.Append("</ul>");
            return sb.ToString();
        }
    }
}