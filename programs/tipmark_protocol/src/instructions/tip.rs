use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::{
    constants::PROFILE_SEED, error::TipmarkError, events::TipReceived, state::CreatorProfile,
};

#[derive(Accounts)]
pub struct Tip<'info> {
    #[account(mut)]
    pub supporter: Signer<'info>,
    #[account(
        seeds = [PROFILE_SEED, profile.owner.as_ref()],
        bump = profile.bump,
        constraint = profile.active @ TipmarkError::ProfileInactive
    )]
    pub profile: Account<'info, CreatorProfile>,
    #[account(
        mut,
        constraint = payout_wallet.key() == profile.payout_wallet
            @ TipmarkError::InvalidPayoutWallet,
        constraint = payout_wallet.key() != supporter.key()
            @ TipmarkError::SelfTipNotAllowed
    )]
    pub payout_wallet: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub(crate) fn handler(ctx: Context<Tip>, amount: u64, reference: [u8; 32]) -> Result<()> {
    require!(amount > 0, TipmarkError::InvalidTipAmount);

    let transfer_accounts = Transfer {
        from: ctx.accounts.supporter.to_account_info(),
        to: ctx.accounts.payout_wallet.to_account_info(),
    };
    let transfer_context = CpiContext::new(ctx.accounts.system_program.key(), transfer_accounts);
    transfer(transfer_context, amount)?;

    emit!(TipReceived {
        profile: ctx.accounts.profile.key(),
        profile_owner: ctx.accounts.profile.owner,
        supporter: ctx.accounts.supporter.key(),
        payout_wallet: ctx.accounts.payout_wallet.key(),
        amount,
        reference,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
