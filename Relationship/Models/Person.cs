//using System;
//using System.Collections.Generic;

//namespace Relationship.Models
//{
//    public class Person
//    {
//        public long Id { get; set; }
//        /**
//        * 姓
//        */
//        public String LastName { get; set; }
//        /**
//        * 名
//        */
//        public String FirstName { get; set; }

//        /**
//        * 性别
//        */
//        public short Sex { get; set; }

//        /**
//        * 父亲编号
//        */
//        public long FatherId { get; set; }
//        /**
//        * 母亲编号
//        */
//        public long MotherId { get; set; }
//        /**
//        * 出生日期
//        */
//        public String BirthDay { get; set; }
//        /**
//        * 出生时间
//        */
//        public String BirthTime { get; set; }
//        /**
//        * 逝世日期
//        */
//        public String DeathDay { get; set; }
//        /**
//        * 逝世时间
//        */
//        public String DeathTime { get; set; }
//        /**
//        * 备注
//        */
//        public String Remark { get; set; }
//        /**
//        * InsertedBy
//        */
//        public long InsertedBy { get; set; }
//        /**
//        * InsertedTime
//        */
//        public DateTime InsertedTime { get; set; }
//        /**
//        * UpdatedBy
//        */
//        public long UpdatedBy { get; set; }
//        /**
//        * UpdatedTime
//        */
//        public DateTime UpdatedTime { get; set; }

//        Person Mother { get; set; }
//        Person Father { get; set; }
//        IList<Person> Chilren { get; set; }
//    }
//}