use anchor_lang::prelude::*;

use crate::constants::{MAX_METADATA_URI_LENGTH, MAX_USERNAME_LENGTH};

#[account]
#[derive(InitSpace)]
pub struct ProtocolConfig {
    pub authority: Pubkey,
    pub pending_authority: Option<Pubkey>,
    pub profile_creation_paused: bool,
    pub version: u8,
    pub bump: u8,
    pub reserved: [u8; 61],
}

#[account]
#[derive(InitSpace)]
pub struct CreatorProfile {
    pub owner: Pubkey,
    pub payout_wallet: Pubkey,
    #[max_len(MAX_USERNAME_LENGTH)]
    pub username: String,
    #[max_len(MAX_METADATA_URI_LENGTH)]
    pub metadata_uri: String,
    pub metadata_hash: [u8; 32],
    pub active: bool,
    pub created_at: i64,
    pub updated_at: i64,
    pub version: u8,
    pub bump: u8,
    pub reserved: [u8; 62],
}

#[account]
#[derive(InitSpace)]
pub struct UsernameRecord {
    pub owner: Pubkey,
    pub profile: Pubkey,
    pub version: u8,
    pub bump: u8,
    pub reserved: [u8; 30],
}
