use anchor_lang::prelude::*;

use crate::{account_init::initialize_pda_account, constants::*, state::ProtocolConfig};

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump
    )]
    /// CHECK: The handler creates and serializes the canonical config PDA.
    pub config: UncheckedAccount<'info>,
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
    let bump = ctx.bumps.config;
    let config = ProtocolConfig {
        authority: ctx.accounts.authority.key(),
        pending_authority: None,
        profile_creation_paused: false,
        version: PROTOCOL_VERSION,
        bump,
        reserved: [0; 61],
    };
    initialize_pda_account(
        &ctx.accounts.authority,
        &ctx.accounts.config,
        &ctx.accounts.system_program,
        8 + ProtocolConfig::INIT_SPACE,
        &[CONFIG_SEED, &[bump]],
        &config,
    )
}
