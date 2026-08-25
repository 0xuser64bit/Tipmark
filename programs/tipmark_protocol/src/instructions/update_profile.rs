use anchor_lang::prelude::*;

use crate::{
    constants::PROFILE_SEED,
    error::TipmarkError,
    events::ProfileUpdated,
    state::CreatorProfile,
    validation::{is_valid_metadata_hash, is_valid_metadata_uri},
};

#[derive(Accounts)]
#[instruction(metadata_uri: String, metadata_hash: [u8; 32])]
pub struct UpdateProfile<'info> {
    #[account(
        constraint = is_valid_metadata_uri(&metadata_uri) @ TipmarkError::InvalidMetadataUri,
        constraint = is_valid_metadata_hash(&metadata_hash) @ TipmarkError::InvalidMetadataHash
    )]
    pub owner: Signer<'info>,
    pub payout_wallet: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [PROFILE_SEED, owner.key().as_ref()],
        bump = profile.bump,
        has_one = owner
    )]
    pub profile: Account<'info, CreatorProfile>,
}

pub(crate) fn handler(
    ctx: Context<UpdateProfile>,
    metadata_uri: String,
    metadata_hash: [u8; 32],
    active: bool,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let profile_key = ctx.accounts.profile.key();
    let owner = ctx.accounts.owner.key();
    let payout_wallet = ctx.accounts.payout_wallet.key();
    let profile = &mut ctx.accounts.profile;

    profile.payout_wallet = payout_wallet;
    profile.metadata_uri = metadata_uri;
    profile.metadata_hash = metadata_hash;
    profile.active = active;
    profile.updated_at = now;

    emit!(ProfileUpdated {
        profile: profile_key,
        owner,
        payout_wallet,
        metadata_hash,
        active,
        timestamp: now,
    });

    Ok(())
}
