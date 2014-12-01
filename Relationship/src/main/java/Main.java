import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.service.ServiceRegistryBuilder;
import person.tanjinfu.relationship.vo.Person;

import java.util.Date;
import java.util.List;

/**
 * Created by Administrator on 2014/12/1.
 */
public class Main {
    public static void main(String... args) {
        Configuration configuration = new Configuration();
        configuration.configure();
        ServiceRegistry serviceRegistry = new ServiceRegistryBuilder().applySettings(configuration.getProperties()).buildServiceRegistry();
        SessionFactory sessionFactory = configuration.buildSessionFactory(serviceRegistry);
        Session session = sessionFactory.openSession();
        Person person = new Person();
        person.setBirthDay("1:0001-01-01");
        person.setFirstName("Jinfu");
        person.setLastName("Tan");

        Date now = new Date();
        person.setLastModifiedTime(now);
        person.setCreatedTime(now);

        Transaction transaction = session.beginTransaction();
        Object obj = session.save(person);
        transaction.commit();

        System.out.println("ok");

        List<Person> persons = session.createQuery("from Person").list();
        System.out.println(persons.size());
        session.close();
    }
}
