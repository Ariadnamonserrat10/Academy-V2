#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, String};

#[contracttype]
#[derive(Clone)]
pub struct Certificate {
    pub id: u64,
    pub student: Address,
    pub teacher: Address,
    pub course_id: u64,
    pub course_name: String,
    pub grade: u32,
    pub issued_at: u64,
    pub valid: bool,
}

#[contracttype]
pub enum DataKey {
    Cert(u64),
    StudentCerts(Address),
    TeacherCerts(Address),
    NextId,
}

#[contract]
pub struct CertificatesContract;

#[contractimpl]
impl CertificatesContract {
    pub fn mint_certificate(
        env: Env,
        teacher: Address,
        student: Address,
        course_id: u64,
        course_name: String,
        grade: u32,
    ) -> u64 {
        teacher.require_auth();
        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);

        let certificate = Certificate {
            id: next_id,
            student: student.clone(),
            teacher: teacher.clone(),
            course_id,
            course_name,
            grade,
            issued_at: env.ledger().timestamp(),
            valid: true,
        };

        env.storage().instance().set(&DataKey::Cert(next_id), &certificate);

        let mut student_certs: Vec<u64> = env.storage().instance()
            .get(&DataKey::StudentCerts(student.clone()))
            .unwrap_or(Vec::new(&env));
        student_certs.push_back(next_id);
        env.storage().instance().set(&DataKey::StudentCerts(student), &student_certs);

        let mut teacher_certs: Vec<u64> = env.storage().instance()
            .get(&DataKey::TeacherCerts(teacher.clone()))
            .unwrap_or(Vec::new(&env));
        teacher_certs.push_back(next_id);
        env.storage().instance().set(&DataKey::TeacherCerts(teacher), &teacher_certs);

        env.storage().instance().set(&DataKey::NextId, &(next_id + 1));
        next_id
    }

    pub fn verify_certificate(env: Env, cert_id: u64) -> Option<Certificate> {
        if let Some(cert) = env.storage().instance().get::<DataKey, Certificate>(&DataKey::Cert(cert_id)) {
            if cert.valid {
                Some(cert)
            } else {
                None
            }
        } else {
            None
        }
    }

    pub fn revoke_certificate(env: Env, teacher: Address, cert_id: u64) -> bool {
        teacher.require_auth();
        if let Some(mut cert) = env.storage().instance().get::<DataKey, Certificate>(&DataKey::Cert(cert_id)) {
            if cert.teacher != teacher {
                return false;
            }
            cert.valid = false;
            env.storage().instance().set(&DataKey::Cert(cert_id), &cert);
            true
        } else {
            false
        }
    }

    pub fn get_student_certificates(env: Env, student: Address) -> Vec<Certificate> {
        let cert_ids: Vec<u64> = env.storage().instance()
            .get(&DataKey::StudentCerts(student))
            .unwrap_or(Vec::new(&env));

        let mut certificates: Vec<Certificate> = Vec::new(&env);
        for id in cert_ids.iter() {
            if let Some(cert) = env.storage().instance().get::<DataKey, Certificate>(&DataKey::Cert(id)) {
                certificates.push_back(cert);
            }
        }
        certificates
    }

    pub fn get_teacher_issued(env: Env, teacher: Address) -> Vec<Certificate> {
        let cert_ids: Vec<u64> = env.storage().instance()
            .get(&DataKey::TeacherCerts(teacher))
            .unwrap_or(Vec::new(&env));

        let mut certificates: Vec<Certificate> = Vec::new(&env);
        for id in cert_ids.iter() {
            if let Some(cert) = env.storage().instance().get::<DataKey, Certificate>(&DataKey::Cert(id)) {
                certificates.push_back(cert);
            }
        }
        certificates
    }
}
