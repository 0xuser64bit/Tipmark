use anchor_lang::prelude::*;

use crate::{
    constants::*,
    error::TipmarkError,
    events::ProfileCreated,
    state::{CreatorProfile, ProtocolConfig, UsernameRecord},
    validation::{is_valid_metadata_hash, is_valid_metadata_uri, is_valid_username},
};

#[derive(Accounts)]
#[instruction(username: String, metadata_uri: String, metadata_hash: [u8; 32])]
pub struct CreateProfile<'info> {
    #[account(
        mut,
        constraint = is_valid_username(&username) @ TipmarkError::InvalidUsername,
        constraint = is_valid_metadata_uri(&metadata_uri) @ TipmarkError::InvalidMetadataUri,
        constraint = is_valid_metadata_hash(&metadata_hash) @ TipmarkError::InvalidMetadataHash
    )]
    pub owner: Signer<'info>,
    pub payout_wallet: SystemAccount<'info>,
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
        constraint = !config.profile_creation_paused @ TipmarkError::ProfileCreationPaused
    )]
    pub config: Account<'info, ProtocolConfig>,
    #[account(
        init,
        payer = owner,
        space = 8 + CreatorProfile::INIT_SPACE,
        seeds = [PROFILE_SEED, owner.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, CreatorProfile>,
    #[account(
        init,
        payer = owner,
        space = 8 + UsernameRecord::INIT_SPACE,
        seeds = [USERNAME_SEED, username.as_bytes()],
        bump
    )]
    pub username_record: Account<'info, UsernameRecord>,
    pub system_program: Program<'info, System>,
}

pub(crate) fn handler(
    ctx: Context<CreateProfile>,
    username: String,
    metadata_uri: String,
    metadata_hash: [u8; 32],
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let owner = ctx.accounts.owner.key();
    let profile_key = ctx.accounts.profile.key();
    let payout_wallet = ctx.accounts.payout_wallet.key();

    let profile = &mut ctx.accounts.profile;
    profile.owner = owner;
    profile.payout_wallet = payout_wallet;
    profile.username = username.clone();
    profile.metadata_uri = metadata_uri;
    profile.metadata_hash = metadata_hash;
    profile.active = true;
    profile.created_at = now;
    profile.updated_at = now;
    profile.version = PROTOCOL_VERSION;
    profile.bump = ctx.bumps.profile;
    profile.reserved = [0; 62];

    let username_record = &mut ctx.accounts.username_record;
    username_record.owner = owner;
    username_record.profile = profile_key;
    username_record.version = PROTOCOL_VERSION;
    username_record.bump = ctx.bumps.username_record;
    username_record.reserved = [0; 30];

    emit!(ProfileCreated {
        profile: profile_key,
        owner,
        payout_wallet,
        username,
        metadata_hash,
        timestamp: now,
    });

    Ok(())
}
