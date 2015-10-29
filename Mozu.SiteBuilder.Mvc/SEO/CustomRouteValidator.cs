using System.Collections.Generic;
using FluentValidation;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Mozu.MZDB.Contracts.Clients;
using FluentValidation.Results;
using System.Threading.Tasks;
using System;
using System.Reflection;
using System.Linq;
using Mozu.Core.Extensions;
using Mozu.Core.Api.Client;
using Mozu.ProductAdmin.Contracts.Clients;
using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public class CustomRouteValidator : AbstractValidator<CustomRouteSettings>
    {
        public CustomRouteValidator(IEntityListsWebApiClient entityListClient, IAttributeWebApiClient attributeClient)
        {
            RuleFor(x => x).NotNull().WithName("custom routes").WithMessage("custom routes cannot be null");
            RuleFor(x => x.Mappings).SetCollectionValidator(new MappingValidator(entityListClient)).When(x => x.Mappings != null && x.Mappings.Count > 0).WithName("mappings").WithMessage("Mappings must all be valid");
            RuleFor(x => x.Validators).SetCollectionValidator(new ConstraintValidator(entityListClient, attributeClient)).When(x => x.Validators != null && x.Validators.Count > 0).WithName("validators").WithMessage("Validators must all be valid");
            RuleFor(x => x.Routes).SetCollectionValidator(x => new RouteValidator(x.Mappings.Keys, x.Validators.Keys)).When(x => x.Routes != null && x.Routes.Count > 0).WithName("routes").WithMessage("Routes must all be valid");
            RuleFor(x => x.Routes)
                .Must(HaveDistinctTemplates)
                .When(x => x.Routes != null)
                .WithName("Duplicate Routes detected")
                .WithMessage("There are multiple routes with the same templates: [{0}]", x => string.Join(",", Group(x.Routes).Where(rs => rs.Count() > 1).Select(g => g.Key)));
        }

        static bool HaveDistinctTemplates(List<Route> routes)
        {
            return Group(routes).All(x => x.Count() == 1);
        }

        static IEnumerable<IGrouping<string, Route>> Group(List<Route> routes) { return routes.GroupBy(x => x.Template, StringComparer.OrdinalIgnoreCase); }

    }

    public class MappingValidator : AbstractValidator<KeyValuePair<string, Mapping>>
    {
        readonly IEntityListsWebApiClient _entityListClient;
        public MappingValidator(IEntityListsWebApiClient client)
        {
            _entityListClient = client;
            RuleFor(x => x.Value.type.ToLowerInvariant()).Must(BeInTypeConst).WithName("mapping type").WithMessage(string.Format("mapping type must be one of {0}", string.Join(",", types)));
            RuleFor(x => x.Value).Must(HaveFacetMapFields).When(x => x.Value.type == Mapping.TypeConst.facet).WithName("facet mapping").WithMessage("facet mapping must provide  mapTo, and facetId");
            RuleFor(x => x.Value).Must(HaveMZDBMapFields).When(x => x.Value.type == Mapping.TypeConst.mzdb).WithName("mzdb mapping").WithMessage("mzdb mapping must provide listFqn and docId");
            RuleFor(x => x.Value).Must(HaveDirectMapFields).When(x => x.Value.type == Mapping.TypeConst.direct).WithName("direct mapping").WithMessage("direct mapping must provide mappings");
        }

        private bool HaveDirectMapFields(Mapping arg)
        {
            return arg.mappings != null;
        }

        private bool HaveMZDBMapFields(Mapping arg)
        {
            return !arg.listFqn.IsNullOrEmpty() && !arg.docId.IsNullOrEmpty();
        }

        private bool HaveFacetMapFields(Mapping arg)
        {
            return !arg.facetId.IsNullOrEmpty()  && !arg.mapTo.IsNullOrEmpty();
        }

        static string[] types = typeof(Mapping.TypeConst)
            .GetFields(BindingFlags.Static | BindingFlags.Public)
            .Where(fi => fi.FieldType == typeof(string))
            .Select(fi => (string)fi.GetValue(null))
            .ToArray();
        private bool BeInTypeConst(string arg)
        {
            return types.Contains(arg, StringComparer.OrdinalIgnoreCase);
        }

        public override async Task<ValidationResult> ValidateAsync(ValidationContext<KeyValuePair<string, Mapping>> context)
        {
            var instance = context.InstanceToValidate.Value;
            var validDoc = ValidatorExt.OK;
            if (instance.type == Mapping.TypeConst.mzdb)
            {
                validDoc = await IsValidMZDBDoc(_entityListClient, instance.listFqn, instance.docId).ConfigureAwait(false);
            }
            var result = await base.ValidateAsync(context).ConfigureAwait(false);
            return result.Concat(validDoc);
        }

        private async Task<ValidationResult> IsValidMZDBDoc(IEntityListsWebApiClient _entityListClient, string listFqn, string docId)
        {
            var response = await _entityListClient.CloneWithoutUserClaims().GetEntity(listFqn, docId).ConfigureAwait(false);
            if(response.HasException) return new ValidationResult(new List<ValidationFailure> { new ValidationFailure("mapping listFqn and docId", "the listFqn must have a document matching docId") });
            return ValidatorExt.OK;

        }
    }

    public class ConstraintValidator : AbstractValidator<KeyValuePair<string, Validator>>
    {
        readonly IAttributeWebApiClient _attributeClient;
        readonly IEntityListsWebApiClient _entityListClient;

        public ConstraintValidator(IEntityListsWebApiClient entityListClient, IAttributeWebApiClient attributeClient)
        {
            _entityListClient = entityListClient;
            _attributeClient = attributeClient;

            RuleFor(x => x.Value.type.ToLowerInvariant()).Must(BeInTypeConst).WithName("validator type").WithMessage(string.Format("The validator must be one of the following types: [{0}]", string.Join(", ", types)));
            RuleFor(x => x.Value).Must(HaveAttributeConstraintFields).When(x => x.Value.type == Validator.TypeConst.attribute).WithName("attribute validator").WithMessage("A validator of type 'productAttribute' must provide an attributeFQN.");
            RuleFor(x => x.Value).Must(HaveListConstraintFields).When(x => x.Value.type == Validator.TypeConst.list).WithName("stringlist validator").WithMessage("A validator of type 'stringlist' must provide a list of values.");
            RuleFor(x => x.Value).Must(HaveMZDBConstraintFields).When(x => x.Value.type == Validator.TypeConst.mzdb).WithName("mzdb constraint").WithMessage("A validator of type 'mzdb' must provide a listFqn and a field.");
        }

        private bool HaveMZDBConstraintFields(Validator arg)
        {
            return !arg.listFqn.IsNullOrEmpty() && !arg.field.IsNullOrEmpty();
        }

        private bool HaveListConstraintFields(Validator arg)
        {
            return arg.values != null && arg.values.Count > 0;
        }

        private bool HaveAttributeConstraintFields(Validator arg)
        {
            return !arg.attributeFQN.IsNullOrEmpty();
        }

        static string[] types = typeof(Validator.TypeConst)
            .GetFields(BindingFlags.Static | BindingFlags.Public)
            .Where(fi => fi.FieldType == typeof(string))
            .Where(fi => !fi.Name.StartsWith("category", StringComparison.OrdinalIgnoreCase)) // we don't want to expose the categegory* types for validation, because they are internal.
                                                                                              // we should probably have a better way of marking this.
            .Select(fi => (string)fi.GetValue(null))
            
            .ToArray();

        private bool BeInTypeConst(string arg)
        {
            return types.Contains(arg, StringComparer.OrdinalIgnoreCase);
        }

        public override async Task<ValidationResult> ValidateAsync(ValidationContext<KeyValuePair<string, Validator>> context)
        {
            var instance = context.InstanceToValidate.Value;
            var extraTypeValidations = await DoDataValidations(instance, _entityListClient, _attributeClient).ConfigureAwait(false);
            return (await base.ValidateAsync(context)).Concat(extraTypeValidations);
        }

        private async Task<ValidationResult> DoDataValidations(Validator instance, IEntityListsWebApiClient _entityListClient, IAttributeWebApiClient _attributeClient)
        {
            switch (instance.type.ToLowerInvariant())
            {
                case Validator.TypeConst.attribute:
                    var attrResponse = await _attributeClient.CloneWithoutUserClaims().GetAttribute(instance.attributeFQN).ConfigureAwait(false);
                    if (attrResponse.HasException) return new ValidationResult(new List<ValidationFailure> { new ValidationFailure("attributeFqn", "attribute FQN must exist", instance.attributeFQN) });
                    return ValidatorExt.OK;
                case Validator.TypeConst.mzdb:
                    var mzdbResponse = await _entityListClient.CloneWithoutUserClaims().GetEntityList(instance.listFqn).ConfigureAwait(false);
                    if (mzdbResponse.HasException) return new ValidationResult(new List<ValidationFailure> { new ValidationFailure("listFqn", "list FQN must exist", instance.listFqn) });
                    return ValidatorExt.OK;
                default:
                    return ValidatorExt.OK;
            }
        }
    }

    public class RouteValidator : AbstractValidator<Route>
    {
        public RouteValidator(IEnumerable<string> mappingNames, IEnumerable<string> validatorKeys)
        {
            RuleFor(x => x.InternalRoute).Must(ParseAsFancyRoute).WithName("internal route").WithMessage(string.Format("the internal route must be one of {0}", string.Join(",", Enum.GetNames(typeof(FancyRoute)))));
            RuleFor(x => x.Mappings.Keys ).Must( x => x.All(map => mappingNames.Contains(map, StringComparer.OrdinalIgnoreCase))).WithName("mapping name").WithMessage("all mappings must be declared in the mapping section of the custom routes");
            RuleFor(x => x.Validators.Keys).Must(x => x.All(constraint => validatorKeys.Contains(constraint, StringComparer.OrdinalIgnoreCase))).WithName("validator name").WithMessage("all validators must be declared in the validators section of the custom routes.  Error with validators:({0}) in routeTempate:{1}", x =>  String.Join(",", x.Validators.Keys), x=> x.Template );
            RuleFor(x => x.InternalRoute).NotNull().NotEmpty().WithName("Internal Route").WithMessage("An Internal Route must be provided");
            RuleFor(x => x.Template).NotNull().WithName("template");
            RuleFor(x => x.Template).Must(NotContainDuplicateRouteParameters).When(x => !string.IsNullOrEmpty(x.Template)).WithName("Route Template").WithMessage("The route \"{0}\" has duplicate route parameters: [{1}]", x => x.Template, x => string.Join(",", GetDuplicateRouteParameters(x.Template)));
            RuleFor(x => x.Template).Must(NotStartWithInvalidRouteCharacters).When(x => !string.IsNullOrEmpty(x.Template)).WithName("Route Template").WithMessage("The route \"{0}\" cannot start with '~' or '/'", x => x.Template);
            RuleFor(x => x.UrlScheme).Must(ParseAsOneOfHttpOrHttps).When(x => !x.UrlScheme.IsNullOrEmpty()).WithName("Url Scheme").WithMessage("The Url Scheme must be one of {0}, but was {1}", x => string.Join(", ", SchemeNames), x => x.UrlScheme);
        }

        static string[] SchemeNames = Enum.GetNames(typeof(CustomRoute.Scheme));
        static bool ParseAsOneOfHttpOrHttps(string arg)
        {
            return SchemeNames.Any(x => x.EqualsIgnoreCase(arg));
        }

        static string[] badStrings = new[] { "/", "~" };
        static bool NotStartWithInvalidRouteCharacters(string arg)
        {
            return !badStrings.Any(arg.StartsWith);
        }

        static bool NotContainDuplicateRouteParameters(string arg)
        {
            return !GetDuplicateRouteParameters(arg).Any();
        }

        static Regex paramParser = new Regex("{(?<param>\\w*)}", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        static IEnumerable<string> GetDuplicateRouteParameters(string route)
        {
            var matches = paramParser.Matches(route).Cast<Match>();
            return matches
                .Where(x => x.Success)
                .Select(x => x.Groups["param"].Value)
                .GroupBy(x => x, StringComparer.OrdinalIgnoreCase)
                .Where(x => x.Count() > 1)
                .Select(x => x.Key);
        }

        static bool ParseAsFancyRoute(string arg)
        {
            try
            {
                arg.ToEnum<FancyRoute>();
                return true;
            }
            catch
            {
                return false;
            }
        }
    }

    public static class ValidatorExt
    {
        public static ValidationResult OK = new ValidationResult();
        public static ValidationResult Concat(this ValidationResult one, ValidationResult two)
        {
            return new ValidationResult(one.Errors.Concat(two.Errors));
        }
    }
}
