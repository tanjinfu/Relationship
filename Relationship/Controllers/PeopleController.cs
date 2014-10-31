﻿using System;
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
        private relationshipEntities_20141028 db = new relationshipEntities_20141028();

        // GET odata/People
        [EnableQuery]
        public IQueryable<Person> GetPeople()
        {
            return db.Person;
        }

        // GET odata/People(5)
        [EnableQuery]
        public SingleResult<Person> Get([FromODataUri] long key)
        {
            return SingleResult.Create(db.Person.Where(person => person.Id == key));
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
            Person originalPerson = db.Person.SingleOrDefault(p => p.Id == key);
            if (originalPerson == null)
            {
                return BadRequest("人员不存在：" + key);
            }
            originalPerson.BirthDay = person.BirthDay;
            originalPerson.BirthTime = person.BirthTime;
            originalPerson.DeathDay = person.DeathDay;
            originalPerson.DeathTime = person.DeathTime;
            originalPerson.FatherId = person.FatherId;
            originalPerson.FirstName = person.FirstName;
            originalPerson.Gender = person.Gender;
            originalPerson.LastName = person.LastName;
            originalPerson.MotherId = person.MotherId;
            //TODO: why there is no this field?
            //originalPerson.OrderInChildrenOfParents=person.
            originalPerson.Remark = person.Remark; ;

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

            return Ok(originalPerson);
        }

        // POST odata/People
        public IHttpActionResult Post(Person person)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Person.Add(person);

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

            Person person = db.Person.Find(key);
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
            Person person = db.Person.Find(key);
            if (person == null)
            {
                return NotFound();
            }

            db.Person.Remove(person);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        // GET odata/People(5)/Accounts
        //[EnableQuery]
        //public IQueryable<Account> GetAccounts([FromODataUri] long key)
        //{
        //    return db.Person.Where(m => m.Id == key).SelectMany(m => m.Accounts);
        //}

        // GET odata/People(5)/ChildrenByFather
        [EnableQuery]
        public IQueryable<Person> GetChildrenByFather([FromODataUri] long key)
        {
            return db.Person.Where(m => m.Id == key).SelectMany(m => m.ChildrenByFather);
        }

        // GET odata/People(5)/Father
        [EnableQuery]
        public SingleResult<Person> GetFather([FromODataUri] long key)
        {
            return SingleResult.Create(db.Person.Where(m => m.Id == key).Select(m => m.Father));
        }

        // GET odata/People(5)/ChildernByMother
        [EnableQuery]
        public IQueryable<Person> GetChildernByMother([FromODataUri] long key)
        {
            return db.Person.Where(m => m.Id == key).SelectMany(m => m.ChildrenByMother);
        }

        // GET odata/People(5)/Mother
        [EnableQuery]
        public SingleResult<Person> GetMother([FromODataUri] long key)
        {
            return SingleResult.Create(db.Person.Where(m => m.Id == key).Select(m => m.Mother));
        }

        [ODataRoute("GetRootPersons()")]
        public IHttpActionResult GetRootPersons()
        {
            IQueryable<Person> rootPersons = db.Person.Where(p => p.FatherId == null);
            return Ok(rootPersons);
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
            return db.Person.Count(e => e.Id == key) > 0;
        }
    }
}