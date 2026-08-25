use anchor_lang::prelude::*;

use crate::{
    constants::CONFIG_SEED, error::TipmarkError, events::ProtocolAuthorityProposed,
    state::ProtocolConfig,
};

#[derive(Accounts)]
pub struct ProposeProtocolAuthority<'info> {
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

pub(crate) fn handler(
    ctx: Context<ProposeProtocolAuthority>,
    pending_authority: Pubkey,
) -> Result<()> {
    require_keys_neq!(
        pending_authority,
        Pubkey::default(),
        TipmarkError::InvalidPendingAuthority
    );
    require_keys_neq!(
        pending_authority,
        ctx.accounts.authority.key(),
        TipmarkError::InvalidPendingAuthority
    );

    ctx.accounts.config.pending_authority = Some(pending_authority);

    emit!(ProtocolAuthorityProposed {
        current_authority: ctx.accounts.authority.key(),
        pending_authority,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
