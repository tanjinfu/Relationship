using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using System.Web.OData;
using System.Web.OData.Routing;
using Relationship;

namespace Relationship.Controllers
{
    /*
    To add a route for this controller, merge these statements into the Register method of the WebApiConfig class. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using Relationship;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<Person>("People");
    builder.EntitySet<Account>("Account"); 
    config.Routes.MapODataRoute("odata", "odata", builder.GetEdmModel());
    */
    public class PeopleController : ODataController
    {
        private RelationEntities1 db = new RelationEntities1();

        // GET odata/People
        [EnableQuery]
        public IQueryable<Person> GetPeople()
        {
            return db.People;
        }

        // GET odata/People(5)
        [EnableQuery]
        public SingleResult<Person> GetPerson([FromODataUri] long key)
        {
            return SingleResult.Create(db.People.Where(person => person.Id == key));
        }

        // PUT odata/People(5)
        public IHttpActionResult Put([FromODataUri] long key, Person person)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (key != person.Id)
            {
                return BadRequest();
            }

            db.Entry(person).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(person);
        }

        // POST odata/People
        public IHttpActionResult Post(Person person)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.People.Add(person);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (PersonExists(person.Id))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(person);
        }

        // PATCH odata/People(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IHttpActionResult Patch([FromODataUri] long key, Delta<Person> patch)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Person person = db.People.Find(key);
            if (person == null)
            {
                return NotFound();
            }

            patch.Patch(person);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(person);
        }

        // DELETE odata/People(5)
        public IHttpActionResult Delete([FromODataUri] long key)
        {
            Person person = db.People.Find(key);
            if (person == null)
            {
                return NotFound();
            }

            db.People.Remove(person);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET odata/People(5)/Accounts
        [EnableQuery]
        public IQueryable<Account> GetAccounts([FromODataUri] long key)
        {
            return db.People.Where(m => m.Id == key).SelectMany(m => m.Accounts);
        }

        // GET odata/People(5)/ChildrenByFather
        [EnableQuery]
        public IQueryable<Person> GetChildrenByFather([FromODataUri] long key)
        {
            return db.People.Where(m => m.Id == key).SelectMany(m => m.ChildrenByFather);
        }

        // GET odata/People(5)/Father
        [EnableQuery]
        public SingleResult<Person> GetFather([FromODataUri] long key)
        {
            return SingleResult.Create(db.People.Where(m => m.Id == key).Select(m => m.Father));
        }

        // GET odata/People(5)/ChildernByMother
        [EnableQuery]
        public IQueryable<Person> GetChildernByMother([FromODataUri] long key)
        {
            return db.People.Where(m => m.Id == key).SelectMany(m => m.ChildernByMother);
        }

        // GET odata/People(5)/Mother
        [EnableQuery]
        public SingleResult<Person> GetMother([FromODataUri] long key)
        {
            return SingleResult.Create(db.People.Where(m => m.Id == key).Select(m => m.Mother));
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PersonExists(long key)
        {
            return db.People.Count(e => e.Id == key) > 0;
        }
    }
}
