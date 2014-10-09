using System.Web.Http;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;
using Microsoft.OData.Edm;

namespace Relationship
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services
            config.MapODataServiceRoute("OData", "odata", getEdmModel());
        }

        private static IEdmModel getEdmModel()
        {

            ODataConventionModelBuilder modelBuilder = new ODataConventionModelBuilder();
            EntitySetConfiguration<Person> peopleEntitySet = modelBuilder.EntitySet<Person>("People");
            EntityTypeConfiguration<Person> personType = peopleEntitySet.EntityType;
            personType.Ignore(p => p.InsertedTime);
            personType.Ignore(p => p.UpdatedTime);

            EntitySetConfiguration<Account> accountEntitySet = modelBuilder.EntitySet<Account>("Accounts");
            EntityTypeConfiguration<Account> accountType = accountEntitySet.EntityType;
            accountType.Ignore(a => a.LastModifyTime);
            accountType.Ignore(a => a.CreateTime);

            modelBuilder.Namespace = typeof(Person).Namespace;
            return modelBuilder.GetEdmModel();
        }

    }
}
