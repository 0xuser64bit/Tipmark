use std::io::Cursor;

use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke_signed, system_instruction},
    system_program::{transfer, Transfer},
};

use crate::error::TipmarkError;

pub fn initialize_pda_account<'info, T: AccountSerialize>(
    payer: &Signer<'info>,
    account: &UncheckedAccount<'info>,
    system_program: &Program<'info, System>,
    space: usize,
    signer_seeds: &[&[u8]],
    value: &T,
) -> Result<()> {
    require_keys_eq!(
        *account.owner,
        system_program::ID,
        TipmarkError::InvalidPdaAccountOwner
    );
    require!(account.data_is_empty(), TipmarkError::PdaAlreadyInitialized);

    let rent_lamports = Rent::get()?.minimum_balance(space);
    let current_lamports = account.lamports();
    if current_lamports == 0 {
        let instruction = system_instruction::create_account(
            &payer.key(),
            &account.key(),
            rent_lamports,
            space as u64,
            &crate::ID,
        );
        invoke_signed(
            &instruction,
            &[
                payer.to_account_info(),
                account.to_account_info(),
                system_program.to_account_info(),
            ],
            &[signer_seeds],
        )?;
    } else {
        if current_lamports < rent_lamports {
            transfer(
                CpiContext::new(
                    system_program.key(),
                    Transfer {
                        from: payer.to_account_info(),
                        to: account.to_account_info(),
                    },
                ),
                rent_lamports - current_lamports,
            )?;
        }
        invoke_signed(
            &system_instruction::allocate(&account.key(), space as u64),
            &[account.to_account_info(), system_program.to_account_info()],
            &[signer_seeds],
        )?;
        invoke_signed(
            &system_instruction::assign(&account.key(), &crate::ID),
            &[account.to_account_info(), system_program.to_account_info()],
            &[signer_seeds],
        )?;
    }

    let mut data = account.try_borrow_mut_data()?;
    value.try_serialize(&mut Cursor::new(&mut data[..]))?;
    Ok(())
}
