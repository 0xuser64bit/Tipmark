use anchor_lang::prelude::*;

use crate::{constants::*, state::ProtocolConfig};

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ProtocolConfig::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    pub program: Program<'info, crate::program::TipmarkProtocol>,
    #[account(
        constraint = program.programdata_address()? == Some(program_data.key())
    )]
    pub program_data: Account<'info, ProgramData>,
    #[account(
        mut,
        constraint = program_data.upgrade_authority_address == Some(authority.key())
    )]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub(crate) fn handler(ctx: Context<InitializeConfig>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.authority = ctx.accounts.authority.key();
    config.pending_authority = None;
    config.profile_creation_paused = false;
    config.version = PROTOCOL_VERSION;
    config.bump = ctx.bumps.config;
    config.reserved = [0; 61];

    Ok(())
}
