use anchor_lang::prelude::*;

#[event]
pub struct ProfileCreated {
    pub profile: Pubkey,
    pub owner: Pubkey,
    pub payout_wallet: Pubkey,
    pub username: String,
    pub metadata_hash: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct ProfileUpdated {
    pub profile: Pubkey,
    pub owner: Pubkey,
    pub payout_wallet: Pubkey,
    pub metadata_hash: [u8; 32],
    pub active: bool,
    pub timestamp: i64,
}

#[event]
pub struct TipReceived {
    pub profile: Pubkey,
    pub profile_owner: Pubkey,
    pub supporter: Pubkey,
    pub payout_wallet: Pubkey,
    pub amount: u64,
    pub reference: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct ProfileCreationPauseChanged {
    pub authority: Pubkey,
    pub paused: bool,
    pub timestamp: i64,
}

#[event]
pub struct ProtocolAuthorityProposed {
    pub current_authority: Pubkey,
    pub pending_authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProtocolAuthorityAccepted {
    pub previous_authority: Pubkey,
    pub new_authority: Pubkey,
    pub timestamp: i64,
}
