#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub enum UserRole {
    Student,
    Teacher,
    Admin,
}

#[contracttype]
#[derive(Clone)]
pub struct UserProfile {
    pub id: Address,
    pub name: String,
    pub email: String,
    pub role: UserRole,
    pub active: bool,
    pub registered_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct TeacherProfile {
    pub id: Address,
    pub name: String,
    pub specialty: String,
    pub education_level: String,
    pub email: String,
    pub wallet: Address,
    pub verified: bool,
}

#[contracttype]
pub enum DataKey {
    Profile(Address),
    Teacher(Address),
    IsTeacher(Address),
    Nonce,
}

#[contract]
pub struct UsersContract;

#[contractimpl]
impl UsersContract {
    pub fn register_student(
        env: Env,
        id: Address,
        name: String,
        email: String,
    ) -> UserProfile {
        id.require_auth();
        let profile = UserProfile {
            id: id.clone(),
            name,
            email,
            role: UserRole::Student,
            active: true,
            registered_at: env.ledger().timestamp(),
        };
        env.storage().instance().set(&DataKey::Profile(id), &profile);
        profile
    }

    pub fn register_teacher(
        env: Env,
        id: Address,
        name: String,
        specialty: String,
        education_level: String,
        email: String,
        wallet: Address,
    ) -> TeacherProfile {
        id.require_auth();
        let teacher = TeacherProfile {
            id: id.clone(),
            name,
            specialty,
            education_level,
            email,
            wallet,
            verified: false,
        };
        env.storage().instance().set(&DataKey::Teacher(id.clone()), &teacher);
        env.storage().instance().set(&DataKey::IsTeacher(id), &true);
        teacher
    }

    pub fn verify_teacher(env: Env, admin: Address, teacher_id: Address) -> bool {
        admin.require_auth();
        if let Some(mut teacher) = env.storage().instance().get::<DataKey, TeacherProfile>(&DataKey::Teacher(teacher_id.clone())) {
            teacher.verified = true;
            env.storage().instance().set(&DataKey::Teacher(teacher_id), &teacher);
            true
        } else {
            false
        }
    }

    pub fn get_profile(env: Env, user_id: Address) -> Option<UserProfile> {
        env.storage().instance().get(&DataKey::Profile(user_id))
    }

    pub fn get_teacher(env: Env, teacher_id: Address) -> Option<TeacherProfile> {
        env.storage().instance().get(&DataKey::Teacher(teacher_id))
    }

    pub fn validate_user(env: Env, user_id: Address) -> bool {
        env.storage().instance().has(&DataKey::Profile(user_id))
    }

    pub fn is_teacher(env: Env, user_id: Address) -> bool {
        env.storage().instance().get::<DataKey, bool>(&DataKey::IsTeacher(user_id)).unwrap_or(false)
    }
}
