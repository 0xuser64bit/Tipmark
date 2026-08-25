use anchor_lang::prelude::*;

use crate::{
    constants::CONFIG_SEED, error::TipmarkError, events::ProfileCreationPauseChanged,
    state::ProtocolConfig,
};

#[derive(Accounts)]
pub struct SetProfileCreationPaused<'info> {
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key()
            @ TipmarkError::InvalidProtocolAuthority
    )]
    pub config: Account<'info, ProtocolConfig>,
}

pub(crate) fn handler(ctx: Context<SetProfileCreationPaused>, paused: bool) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    ctx.accounts.config.profile_creation_paused = paused;

    emit!(ProfileCreationPauseChanged {
        authority: ctx.accounts.authority.key(),
        paused,
        timestamp: now,
    });

    Ok(())
}
