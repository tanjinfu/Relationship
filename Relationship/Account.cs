//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Relationship
{
    using System;
    using System.Collections.Generic;
    
    public partial class Account
    {
        public long Id { get; set; }
        public string LoginName { get; set; }
        public string Pword { get; set; }
        public Nullable<byte> Gender { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public Nullable<byte> IsAdmin { get; set; }
        public Nullable<System.DateTime> LastModifyTime { get; set; }
        public Nullable<System.DateTime> CreateTime { get; set; }
    }
}
