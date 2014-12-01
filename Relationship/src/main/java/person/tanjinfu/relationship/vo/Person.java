package person.tanjinfu.relationship.vo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;

/**
 * Created by Administrator on 2014/11/30.
 */
@Entity
@Table(name = "Person")
public class Person {

    /**
     * Id
     */
    protected long id;
    /**
     * 姓
     */
    protected String lastName;
    /**
     * 名
     */
    protected String firstName;
    /**
     * 性别
     */
    protected short gender;
    /**
     * 父亲编号
     */
    protected long fatherID;
    /**
     * 母亲编号
     */
    protected long motherID;
    /**
     * 排行
     */
    protected int orderInChildrenOfParents;
    /**
     * 出生日期
     */
    protected String birthDay;
    /**
     * 出生时间
     */
    protected String birthTime;
    /**
     * 逝世日期
     */
    protected String deathDay;
    /**
     * 逝世时间
     */
    protected String deathTime;
    /**
     * 备注
     */
    protected String remark;
    /**
     * InsertedBy
     */
    protected long createdBy;
    /**
     * InsertedTime
     */
    protected Date createdTime;
    /**
     * UpdatedBy
     */
    protected long lastModifiedBy;
    /**
     * UpdatedTime
     */
    protected Date lastModifiedTime;

    public Person() {

    }

    @Id
    @GeneratedValue(generator = "increment")
    @GenericGenerator(name = "increment", strategy = "increment")
    @Column(name = "Id")
    public long getId() {
        return this.id;
    }

    public void setId(long id) {
        this.id = id;
    }

    @Column(name = "LastName")
    public String getLastName() {
        return this.lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFirstName() {
        return this.firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public short getGender() {
        return this.gender;
    }

    public void setGender(short gender) {
        this.gender = gender;
    }

    public long getFatherID() {
        return this.fatherID;
    }

    public void setFatherID(long fatherID) {
        this.fatherID = fatherID;
    }

    public long getMotherID() {
        return this.motherID;
    }

    public void setMotherID(long motherID) {
        this.motherID = motherID;
    }

    public int getOrderInChildrenOfParents() {
        return this.orderInChildrenOfParents;
    }

    public void setOrderInChildrenOfParents(int orderInChildrenOfParents) {
        this.orderInChildrenOfParents = orderInChildrenOfParents;
    }

    public String getBirthDay() {
        return this.birthDay;
    }

    public void setBirthDay(String birthDay) {
        this.birthDay = birthDay;
    }

    public String getBirthTime() {
        return this.birthTime;
    }

    public void setBirthTime(String birthTime) {
        this.birthTime = birthTime;
    }

    public String getDeathDay() {
        return this.deathDay;
    }

    public void setDeathDay(String deathDay) {
        this.deathDay = deathDay;
    }

    public String getDeathTime() {
        return this.deathTime;
    }

    public void setDeathTime(String deathTime) {
        this.deathTime = deathTime;
    }

    public String getRemark() {
        return this.remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public long getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(long createdBy) {
        this.createdBy = createdBy;
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "CreatedTime")
    public Date getCreatedTime() {
        return this.createdTime;
    }

    public void setCreatedTime(Date createdTime) {
        this.createdTime = createdTime;
    }

    public long getLastModifiedBy() {
        return this.lastModifiedBy;
    }

    public void setLastModifiedBy(long lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "LastModifiedTime")
    public Date getLastModifiedTime() {
        return this.lastModifiedTime;
    }

    public void setLastModifiedTime(Date lastModifiedTime) {
        this.lastModifiedTime = lastModifiedTime;
    }

}