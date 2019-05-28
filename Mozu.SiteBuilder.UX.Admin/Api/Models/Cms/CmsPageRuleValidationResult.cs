using Mozu.Core.Expressions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Cms
{
    public class CmsPageRuleValidationResult
    {
        public CmsPageRuleValidationResult()
        {
            ValidationResult = new ExpressionValidationResult();
        }

        public string ExpressionText { get; set; }

        public AbstractExpression Expression { get; set; }

        public ExpressionValidationResult ValidationResult { get; set; }

    }
}