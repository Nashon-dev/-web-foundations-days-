
# School Database Design

## 1. Tables

### Students

The students table stores each student's unique ID, name and email address. The student ID is the primary key. The name and email are required, and the UNIQUE constraint on email prevents two students from using the same email address.

### Courses

The courses table stores each course's unique ID and name. The course ID is the primary key. Course names are required and unique.

### Enrolments

The enrolments table records which student is taking which course and the grade earned. It contains a primary key and foreign keys referencing the students and courses tables. The grade can be NULL until a grade is assigned. The UNIQUE constraint on student_id and course_id prevents duplicate enrolments for the same student and course.

## 2. Relationships

Students and enrolments have a one-to-many relationship because one student can enrol in several courses, creating multiple enrolment records. Each enrolment belongs to one student.

Courses and enrolments also have a one-to-many relationship because one course can have several students, creating multiple enrolment records. Each enrolment belongs to one course.

Students and courses have a many-to-many relationship because a student can take multiple courses and a course can contain multiple students. The enrolments table is a join table that connects the two tables and stores additional information about each relationship, such as the grade.

## 3. Index

I would add an index on enrolments(course_id) to improve searches for students enrolled in a particular course and to speed up queries that count enrolments per course. The index is defined in school.sql as follows:

CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);

## 4. SQL or NoSQL?

I would choose SQL for this school system because students, courses and enrolments have structured relationships. A relational database supports primary keys, foreign keys, unique constraints and JOIN queries, which help maintain accurate data and retrieve related records efficiently. SQLite is suitable for a small school application because it is lightweight and easy to set up. If the system grows and requires many simultaneous users, PostgreSQL could be a suitable alternative.
