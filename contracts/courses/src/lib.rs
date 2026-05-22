#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, String};

#[contracttype]
#[derive(Clone)]
pub struct Course {
    pub id: u64,
    pub teacher: Address,
    pub title: String,
    pub description: String,
    pub category: String,
    pub level: String,
    pub price: u64,
    pub modules: Vec<Module>,
    pub students: Vec<Address>,
    pub active: bool,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct Module {
    pub title: String,
    pub content_hash: String,
    pub duration: u64,
    pub order: u32,
}

#[contracttype]
pub enum DataKey {
    Course(u64),
    TeacherCourses(Address),
    StudentCourses(Address),
    NextId,
}

#[contract]
pub struct CoursesContract;

#[contractimpl]
impl CoursesContract {
    pub fn create_course(
        env: Env,
        teacher: Address,
        title: String,
        description: String,
        category: String,
        level: String,
        price: u64,
    ) -> u64 {
        teacher.require_auth();
        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);

        let course = Course {
            id: next_id,
            teacher: teacher.clone(),
            title,
            description,
            category,
            level,
            price,
            modules: Vec::new(&env),
            students: Vec::new(&env),
            active: true,
            created_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&DataKey::Course(next_id), &course);

        let mut teacher_courses: Vec<u64> = env.storage().instance()
            .get(&DataKey::TeacherCourses(teacher.clone()))
            .unwrap_or(Vec::new(&env));
        teacher_courses.push_back(next_id);
        env.storage().instance().set(&DataKey::TeacherCourses(teacher), &teacher_courses);

        env.storage().instance().set(&DataKey::NextId, &(next_id + 1));
        next_id
    }

    pub fn purchase_course(env: Env, student: Address, course_id: u64) -> bool {
        student.require_auth();
        if let Some(mut course) = env.storage().instance().get::<DataKey, Course>(&DataKey::Course(course_id)) {
            for s in course.students.iter() {
                if s == student {
                    return false;
                }
            }
            course.students.push_back(student.clone());
            env.storage().instance().set(&DataKey::Course(course_id), &course);

            let mut student_courses: Vec<u64> = env.storage().instance()
                .get(&DataKey::StudentCourses(student.clone()))
                .unwrap_or(Vec::new(&env));
            student_courses.push_back(course_id);
            env.storage().instance().set(&DataKey::StudentCourses(student), &student_courses);
            true
        } else {
            false
        }
    }

    pub fn get_course(env: Env, course_id: u64) -> Option<Course> {
        env.storage().instance().get(&DataKey::Course(course_id))
    }

    pub fn get_student_courses(env: Env, student: Address) -> Vec<Course> {
        let course_ids: Vec<u64> = env.storage().instance()
            .get(&DataKey::StudentCourses(student))
            .unwrap_or(Vec::new(&env));

        let mut courses: Vec<Course> = Vec::new(&env);
        for id in course_ids.iter() {
            if let Some(course) = env.storage().instance().get::<DataKey, Course>(&DataKey::Course(id)) {
                courses.push_back(course);
            }
        }
        courses
    }

    pub fn get_teacher_courses(env: Env, teacher: Address) -> Vec<Course> {
        let course_ids: Vec<u64> = env.storage().instance()
            .get(&DataKey::TeacherCourses(teacher))
            .unwrap_or(Vec::new(&env));

        let mut courses: Vec<Course> = Vec::new(&env);
        for id in course_ids.iter() {
            if let Some(course) = env.storage().instance().get::<DataKey, Course>(&DataKey::Course(id)) {
                courses.push_back(course);
            }
        }
        courses
    }

    pub fn get_courses_by_category(env: Env, category: String) -> Vec<Course> {
        let mut result: Vec<Course> = Vec::new(&env);
        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(0);
        let mut i: u64 = 1;
        while i < next_id {
            if let Some(course) = env.storage().instance().get::<DataKey, Course>(&DataKey::Course(i)) {
                if course.category == category && course.active {
                    result.push_back(course);
                }
            }
            i += 1;
        }
        result
    }

    pub fn update_course(
        env: Env,
        teacher: Address,
        course_id: u64,
        title: String,
        description: String,
        price: u64,
    ) -> bool {
        teacher.require_auth();
        if let Some(mut course) = env.storage().instance().get::<DataKey, Course>(&DataKey::Course(course_id)) {
            if course.teacher != teacher {
                return false;
            }
            course.title = title;
            course.description = description;
            course.price = price;
            env.storage().instance().set(&DataKey::Course(course_id), &course);
            true
        } else {
            false
        }
    }
}
