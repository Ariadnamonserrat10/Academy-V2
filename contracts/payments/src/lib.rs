#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone)]
pub struct Payment {
    pub id: u64,
    pub from: Address,
    pub to: Address,
    pub amount: u64,
    pub course_id: u64,
    pub timestamp: u64,
    pub status: PaymentStatus,
}

#[contracttype]
#[derive(Clone)]
pub enum PaymentStatus {
    Pending,
    Completed,
    Refunded,
}

#[contracttype]
pub enum DataKey {
    Pmt(u64),
    Balance(Address),
    NextId,
}

#[contract]
pub struct PaymentsContract;

#[contractimpl]
impl PaymentsContract {
    pub fn process_payment(
        env: Env,
        from: Address,
        to: Address,
        amount: u64,
        course_id: u64,
    ) -> u64 {
        from.require_auth();
        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);

        let payment = Payment {
            id: next_id,
            from: from.clone(),
            to: to.clone(),
            amount,
            course_id,
            timestamp: env.ledger().timestamp(),
            status: PaymentStatus::Completed,
        };

        env.storage().instance().set(&DataKey::Pmt(next_id), &payment);

        let balance: u64 = env.storage().instance()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);
        env.storage().instance().set(&DataKey::Balance(to), &(balance + amount));

        env.storage().instance().set(&DataKey::NextId, &(next_id + 1));
        next_id
    }

    pub fn withdraw_funds(env: Env, user: Address, amount: u64) -> bool {
        user.require_auth();
        let balance: u64 = env.storage().instance()
            .get(&DataKey::Balance(user.clone()))
            .unwrap_or(0);
        if balance >= amount {
            env.storage().instance().set(&DataKey::Balance(user), &(balance - amount));
            true
        } else {
            false
        }
    }

    pub fn get_balance(env: Env, user: Address) -> u64 {
        env.storage().instance().get(&DataKey::Balance(user)).unwrap_or(0)
    }

    pub fn refund_payment(env: Env, admin: Address, payment_id: u64) -> bool {
        admin.require_auth();
        if let Some(mut payment) = env.storage().instance().get::<DataKey, Payment>(&DataKey::Pmt(payment_id)) {
            payment.status = PaymentStatus::Refunded;
            env.storage().instance().set(&DataKey::Pmt(payment_id), &payment);
            true
        } else {
            false
        }
    }

    pub fn get_payment(env: Env, payment_id: u64) -> Option<Payment> {
        env.storage().instance().get(&DataKey::Pmt(payment_id))
    }
}
