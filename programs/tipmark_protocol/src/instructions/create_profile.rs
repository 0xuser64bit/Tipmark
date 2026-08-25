use anchor_lang::prelude::*;

use crate::{
    account_init::initialize_pda_account,
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
        mut,
        seeds = [PROFILE_SEED, owner.key().as_ref()],
        bump
    )]
    /// CHECK: The handler creates and serializes the canonical profile PDA.
    pub profile: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [USERNAME_SEED, username.as_bytes()],
        bump
    )]
    /// CHECK: The handler creates and serializes the username PDA.
    pub username_record: UncheckedAccount<'info>,
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

    let profile_bump = ctx.bumps.profile;
    let profile = CreatorProfile {
        owner,
        payout_wallet,
        username: username.clone(),
        metadata_uri,
        metadata_hash,
        active: true,
        created_at: now,
        updated_at: now,
        version: PROTOCOL_VERSION,
        bump: profile_bump,
        reserved: [0; 62],
    };
    initialize_pda_account(
        &ctx.accounts.owner,
        &ctx.accounts.profile,
        &ctx.accounts.system_program,
        8 + CreatorProfile::INIT_SPACE,
        &[PROFILE_SEED, owner.as_ref(), &[profile_bump]],
        &profile,
    )?;

    let username_bump = ctx.bumps.username_record;
    let username_record = UsernameRecord {
        owner,
        profile: profile_key,
        version: PROTOCOL_VERSION,
        bump: username_bump,
        reserved: [0; 30],
    };
    initialize_pda_account(
        &ctx.accounts.owner,
        &ctx.accounts.username_record,
        &ctx.accounts.system_program,
        8 + UsernameRecord::INIT_SPACE,
        &[USERNAME_SEED, username.as_bytes(), &[username_bump]],
        &username_record,
    )?;

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
