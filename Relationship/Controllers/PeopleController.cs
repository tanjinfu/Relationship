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
using Microsoft.AspNet.Identity;
using System.Text;

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
    [Authorize]
    public class PeopleController : ODataController
    {
        private relationshipEntities_20141028 db = new relationshipEntities_20141028();

        // GET odata/People
        [EnableQuery]
        public IQueryable<Person> GetPeople()
        {
            string userId = User.Identity.GetUserId();
            return db.Person.Where(p => p.CreatedBy == userId);
        }

        // GET odata/People(5)
        [EnableQuery(MaxExpansionDepth = 9)]
        public SingleResult<Person> Get([FromODataUri] long key)
        {
            string userId = User.Identity.GetUserId();
            return SingleResult.Create(db.Person.Where(p => p.Id == key && p.CreatedBy == userId));
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
            string userId = User.Identity.GetUserId();
            Person originalPerson = db.Person.SingleOrDefault(p => p.Id == key && p.CreatedBy == userId);
            if (originalPerson == null)
            {
                return BadRequest("人员不存在：" + key);
            }
            if (person.FatherId != null && person.FatherId != originalPerson.FatherId)
            {
                Person father = db.Person.SingleOrDefault(p => p.Id == person.FatherId);
                if (father == null)
                {
                    return BadRequest("不存在编号为'" + person.FatherId + "'的人员，请检查。");
                }
                if (father.Gender == 0)
                {
                    return BadRequest("父亲必须是男性！");
                }
            }
            if (person.MotherId != null && person.MotherId != originalPerson.MotherId)
            {
                Person mother = db.Person.SingleOrDefault(p => p.Id == person.MotherId);
                if (mother == null)
                {
                    return BadRequest("不存在编号为'" + person.MotherId + "'的人员，请检查。");
                }
                if (mother.Gender == 1)
                {
                    return BadRequest("母亲必须是女性！");
                }
            }
            try
            {
                checkCircle(person);
            }
            catch (RelationsipException e)
            {
                return BadRequest(e.Message);
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
            originalPerson.OrderInChildrenOfParents = person.OrderInChildrenOfParents;
            originalPerson.Remark = person.Remark;
            originalPerson.LastModifiedBy = User.Identity.GetUserId();
            originalPerson.LastModifiedTime = DateTime.Now;
            //TODO: check circle.
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

            if (person.FatherId != null)
            {
                Person father = db.Person.SingleOrDefault(p => p.Id == person.FatherId);
                if (father.Gender == 0)
                {
                    return BadRequest("父亲必须是男性！");
                }
            }
            if (person.MotherId != null)
            {
                Person father = db.Person.SingleOrDefault(p => p.Id == person.MotherId);
                if (father.Gender == 1)
                {
                    return BadRequest("母亲必须是女性！");
                }
            }

            string userId = User.Identity.GetUserId();
            DateTime now = DateTime.Now;
            person.CreatedBy = userId;
            person.CreatedTime = now;
            person.LastModifiedBy = userId;
            person.LastModifiedTime = now;
            person.CreatedBy =
            person.LastModifiedBy = User.Identity.GetUserId();

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
            string userId = User.Identity.GetUserId();
            Person person = db.Person.SingleOrDefault(p => p.Id == key && p.CreatedBy == userId);
            if (person == null)
            {
                return NotFound();
            }

            db.Person.Remove(person);
            if (person.Gender == 1)
            {
                var childrenByFather = db.Person.Where<Person>(p => p.FatherId == key);
                foreach (Person child in childrenByFather.ToList<Person>())
                {
                    child.FatherId = null;
                }
            }
            else if (person.Gender == 0)
            {
                var childrenByMother = db.Person.Where<Person>(p => p.MotherId == key);
                foreach (Person child in childrenByMother.ToList<Person>())
                {
                    child.MotherId = null;
                }
            }
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
            string userId = User.Identity.GetUserId();
            return db.Person.Where(m => m.Id == key && m.CreatedBy == userId).SelectMany(m => m.ChildrenByFather);
        }

        // GET odata/People(5)/Father
        [EnableQuery]
        public SingleResult<Person> GetFather([FromODataUri] long key)
        {
            string userId = User.Identity.GetUserId();
            return SingleResult.Create(db.Person.Where(m => m.Id == key && m.CreatedBy == userId).Select(m => m.Father));
        }

        // GET odata/People(5)/ChildernByMother
        [EnableQuery]
        public IQueryable<Person> GetChildernByMother([FromODataUri] long key)
        {
            string userId = User.Identity.GetUserId();
            return db.Person.Where(m => m.Id == key && m.CreatedBy == userId).SelectMany(m => m.ChildrenByMother);
        }

        // GET odata/People(5)/Mother
        [EnableQuery]
        public SingleResult<Person> GetMother([FromODataUri] long key)
        {
            string userId = User.Identity.GetUserId();
            return SingleResult.Create(db.Person.Where(m => m.Id == key && m.CreatedBy == userId).Select(m => m.Mother));
        }

        [EnableQuery(MaxExpansionDepth = 14)]
        [ODataRoute("GetPersonAndDescendants(Id={personId},TotalLevels={totalLevels})")]
        public IHttpActionResult GetPersonAndDescendants(long personId, int totalLevels)
        {
            string userId = User.Identity.GetUserId();
            Person rootPerson = db.Person.SingleOrDefault(m => m.Id == personId && m.CreatedBy == userId);
            if (rootPerson == null)
            {
                return NotFound();
            }
            loadPersonAndDescdants(rootPerson, 1, totalLevels);
            return Ok(rootPerson);
        }

        [EnableQuery]
        [ODataRoute("GetPersonAndAncestors(Id={personId},TotalLevels={totalLevels})")]
        public IHttpActionResult GetPersonAndAncestors(long personId, int totalLevels)
        {
            string userId = User.Identity.GetUserId();
            Person rootPerson = db.Person.SingleOrDefault(m => m.Id == personId && m.CreatedBy == userId);
            if (rootPerson == null)
            {
                return NotFound();
            }

            IList<Person> personAndAncestors = new List<Person>();

            loadFatherAndMother(rootPerson, 1, totalLevels, personAndAncestors);

            return Ok(personAndAncestors);
        }

        private void loadFatherAndMother(Person person, int currentLevel, int totalLevels, IList<Person> persons)
        {
            if (currentLevel > totalLevels)
            {
                return;
            }
            if (person == null)
            {
                return;
            }
            persons.Add(person);
            if (person.FatherId != null)
            {
                Person father = db.Person.SingleOrDefault(p => p.Id == person.FatherId);
                if (father != null)
                {
                    loadFatherAndMother(father, currentLevel + 1, totalLevels, persons);
                }
            }
            if (person.MotherId != null)
            {
                Person mother = db.Person.SingleOrDefault(p => p.Id == person.MotherId);
                if (mother != null)
                {
                    loadFatherAndMother(mother, currentLevel + 1, totalLevels, persons);
                }
            }
        }

        private void loadPersonAndDescdants(Person person, int currentLevel, int totalLevels)
        {
            if (currentLevel > totalLevels)
            {
                return;
            }
            if (person == null)
            {
                return;
            }
            if (person.Gender != 1)
            {
                return;
            }
            IList<Person> childrenByFather = db.Person.Where(p => p.FatherId == person.Id).ToList();
            person.ChildrenByFather = childrenByFather
                .OrderBy(p => p.BirthDay)
                .ThenBy(p => p.BirthTime)
                .ThenBy(p => p.OrderInChildrenOfParents)
                .ToList();
            foreach (Person child in childrenByFather.Where(p => p.Gender == 1))
            {
                loadPersonAndDescdants(child, currentLevel + 1, totalLevels);
            }
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

        private void checkCircle(Person person)
        {
            Stack<CircleFrame> stack = new Stack<CircleFrame>();
            CircleFrame root = new CircleFrame() { Id = person.Id, firstName = person.FirstName, lastName = person.LastName };
            stack.Push(root);
            checkCircle(person.FatherId, person.Id, stack);
            checkCircle(person.MotherId, person.Id, stack);
        }

        private void checkCircle(long? currentPersonId, long rootPersonId, Stack<CircleFrame> stack)
        {
            if (currentPersonId == null)
            {
                return;
            }
            if (rootPersonId == currentPersonId.Value)
            {
                StringBuilder stringBuilder = new StringBuilder();
                stringBuilder.Append("存在循环：");
                CircleFrame circleFrame = null;
                for (int i = stack.Count - 1; i >= 0; i--)
                {
                    circleFrame = stack.ElementAt(i);
                    stringBuilder.Append(circleFrame.lastName);
                    stringBuilder.Append(circleFrame.firstName);
                    stringBuilder.Append("->");
                }
                circleFrame = stack.ElementAt(stack.Count - 1);
                stringBuilder.Append(circleFrame.lastName);
                stringBuilder.Append(circleFrame.firstName);

                throw new RelationsipException(stringBuilder.ToString());
            }
            Person currentPerson = db.Person.SingleOrDefault(p => p.Id == currentPersonId.Value);
            if (currentPerson == null)
            {
                throw new RelationsipException(string.Format("不存丰ID为{0}的人员，请检查。", currentPersonId));
            }
            CircleFrame currentCheckCircle = new CircleFrame()
            {
                Id = currentPerson.Id,
                firstName = currentPerson.FirstName,
                lastName = currentPerson.LastName
            };

            stack.Push(currentCheckCircle);
            checkCircle(currentPerson.MotherId, rootPersonId, stack);
            checkCircle(currentPerson.FatherId, rootPersonId, stack);
            stack.Pop();
        }

        private class CircleFrame
        {
            public long Id;
            public string firstName;
            public string lastName;
        }

        private class RelationsipException : Exception
        {
            public RelationsipException(string message) : base(message) { }
        }
    }
}
