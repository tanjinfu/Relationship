using System.Web.Http;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;
using Microsoft.OData.Edm;
using Microsoft.Owin.Security.OAuth;

namespace Relationship
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services
            // Configure Web API to use only bearer token authentication.
            config.SuppressDefaultHostAuthentication();
            config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            // Enforce HTTPS
            //config.Filters.Add(new LocalAccountsApp.Filters.RequireHttpsAttribute());
            
            // Web API configuration and services
            config.MapODataServiceRoute("OData", "odata", getEdmModel());

            //config.EnsureInitialized();
        }

        private static IEdmModel getEdmModel()
        {

            ODataConventionModelBuilder modelBuilder = new ODataConventionModelBuilder();
            EntitySetConfiguration<Person> peopleEntitySet = modelBuilder.EntitySet<Person>("People");
            EntityTypeConfiguration<Person> personType = peopleEntitySet.EntityType;
            personType.Ignore(p => p.CreatedTime);
            personType.Ignore(p => p.LastModifiedTime);

            EntitySetConfiguration<Account> accountEntitySet = modelBuilder.EntitySet<Account>("Accounts");
            EntityTypeConfiguration<Account> accountType = accountEntitySet.EntityType;
            accountType.Ignore(a => a.LastModifyTime);
            accountType.Ignore(a => a.CreateTime);

            FunctionConfiguration getPersonAndDescendants = modelBuilder.Function("GetPersonAndDescendants");
            getPersonAndDescendants.ReturnsFromEntitySet<Person>("People");
            getPersonAndDescendants.Parameter<long>("Id");// The id of the root person.
            getPersonAndDescendants.Parameter<long>("TotalLevels");// How many levels will be loaded and the root person is included.
            getPersonAndDescendants.IsComposable=true;

            FunctionConfiguration getPersonAndAncestors = modelBuilder.Function("GetPersonAndAncestors");
            getPersonAndAncestors.ReturnsCollectionFromEntitySet<Person>("People");
            getPersonAndAncestors.Parameter<long>("Id");// The id of the root person.
            getPersonAndAncestors.Parameter<long>("TotalLevels");// How many levels will be loaded and the root person is included.
            getPersonAndAncestors.IsComposable = true;

            modelBuilder.Namespace = typeof(Person).Namespace;
            return modelBuilder.GetEdmModel();
        }

    }
}
