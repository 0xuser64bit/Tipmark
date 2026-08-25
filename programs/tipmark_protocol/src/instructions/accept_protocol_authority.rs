use anchor_lang::prelude::*;

use crate::{
    constants::CONFIG_SEED, error::TipmarkError, events::ProtocolAuthorityAccepted,
    state::ProtocolConfig,
};

#[derive(Accounts)]
pub struct AcceptProtocolAuthority<'info> {
    pub pending_authority: Signer<'info>,
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
        constraint = config.pending_authority.is_some()
            @ TipmarkError::NoPendingAuthority,
        constraint = config.pending_authority == Some(pending_authority.key())
            @ TipmarkError::InvalidPendingAuthority
    )]
    pub config: Account<'info, ProtocolConfig>,
}

pub(crate) fn handler(ctx: Context<AcceptProtocolAuthority>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let previous_authority = config.authority;
    let new_authority = ctx.accounts.pending_authority.key();

    config.authority = new_authority;
    config.pending_authority = None;

    emit!(ProtocolAuthorityAccepted {
        previous_authority,
        new_authority,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
