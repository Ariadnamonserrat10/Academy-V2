#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, String};

#[contracttype]
#[derive(Clone)]
pub struct Material {
    pub id: u64,
    pub course_id: u64,
    pub teacher: Address,
    pub title: String,
    pub description: String,
    pub file_type: String,
    pub price: u64,
    pub free: bool,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Mat(u64),
    CourseMaterials(u64),
    StudentMats(Address),
    NextId,
}

#[contract]
pub struct MaterialsContract;

#[contractimpl]
impl MaterialsContract {
    pub fn upload_material(
        env: Env,
        teacher: Address,
        course_id: u64,
        title: String,
        description: String,
        file_type: String,
        price: u64,
        free: bool,
    ) -> u64 {
        teacher.require_auth();
        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);

        let material = Material {
            id: next_id,
            course_id,
            teacher: teacher.clone(),
            title,
            description,
            file_type,
            price,
            free,
            created_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&DataKey::Mat(next_id), &material);

        let mut course_mats: Vec<u64> = env.storage().instance()
            .get(&DataKey::CourseMaterials(course_id))
            .unwrap_or(Vec::new(&env));
        course_mats.push_back(next_id);
        env.storage().instance().set(&DataKey::CourseMaterials(course_id), &course_mats);

        env.storage().instance().set(&DataKey::NextId, &(next_id + 1));
        next_id
    }

    pub fn purchase_material(env: Env, student: Address, material_id: u64) -> bool {
        student.require_auth();
        if let Some(material) = env.storage().instance().get::<DataKey, Material>(&DataKey::Mat(material_id)) {
            if material.free {
                return true;
            }
            let mut student_mats: Vec<u64> = env.storage().instance()
                .get(&DataKey::StudentMats(student.clone()))
                .unwrap_or(Vec::new(&env));
            student_mats.push_back(material_id);
            env.storage().instance().set(&DataKey::StudentMats(student), &student_mats);
            true
        } else {
            false
        }
    }

    pub fn get_material(env: Env, material_id: u64) -> Option<Material> {
        env.storage().instance().get(&DataKey::Mat(material_id))
    }

    pub fn get_materials_by_course(env: Env, course_id: u64) -> Vec<Material> {
        let mat_ids: Vec<u64> = env.storage().instance()
            .get(&DataKey::CourseMaterials(course_id))
            .unwrap_or(Vec::new(&env));

        let mut materials: Vec<Material> = Vec::new(&env);
        for id in mat_ids.iter() {
            if let Some(material) = env.storage().instance().get::<DataKey, Material>(&DataKey::Mat(id)) {
                materials.push_back(material);
            }
        }
        materials
    }

    pub fn get_student_materials(env: Env, student: Address) -> Vec<Material> {
        let mat_ids: Vec<u64> = env.storage().instance()
            .get(&DataKey::StudentMats(student))
            .unwrap_or(Vec::new(&env));

        let mut materials: Vec<Material> = Vec::new(&env);
        for id in mat_ids.iter() {
            if let Some(material) = env.storage().instance().get::<DataKey, Material>(&DataKey::Mat(id)) {
                materials.push_back(material);
            }
        }
        materials
    }

    pub fn update_material(
        env: Env,
        teacher: Address,
        material_id: u64,
        title: String,
        description: String,
        price: u64,
    ) -> bool {
        teacher.require_auth();
        if let Some(mut material) = env.storage().instance().get::<DataKey, Material>(&DataKey::Mat(material_id)) {
            if material.teacher != teacher {
                return false;
            }
            material.title = title;
            material.description = description;
            material.price = price;
            env.storage().instance().set(&DataKey::Mat(material_id), &material);
            true
        } else {
            false
        }
    }
}
