pub mod account_init;
pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;
pub mod validation;

use anchor_lang::prelude::*;

#[allow(ambiguous_glob_reexports)]
pub use instructions::*;

declare_id!("7ZNWrEBx3QnTamR8ZZKwbksKvHhby3bg3W3akiz183TT");

#[program]
pub mod tipmark_protocol {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        instructions::initialize_config::handler(ctx)
    }

    pub fn create_profile(
        ctx: Context<CreateProfile>,
        username: String,
        metadata_uri: String,
        metadata_hash: [u8; 32],
    ) -> Result<()> {
        instructions::create_profile::handler(ctx, username, metadata_uri, metadata_hash)
    }

    pub fn update_profile(
        ctx: Context<UpdateProfile>,
        metadata_uri: String,
        metadata_hash: [u8; 32],
        active: bool,
    ) -> Result<()> {
        instructions::update_profile::handler(ctx, metadata_uri, metadata_hash, active)
    }

    pub fn tip(ctx: Context<Tip>, amount: u64, reference: [u8; 32]) -> Result<()> {
        instructions::tip::handler(ctx, amount, reference)
    }

    pub fn set_profile_creation_paused(
        ctx: Context<SetProfileCreationPaused>,
        paused: bool,
    ) -> Result<()> {
        instructions::set_profile_creation_paused::handler(ctx, paused)
    }

    pub fn propose_protocol_authority(
        ctx: Context<ProposeProtocolAuthority>,
        pending_authority: Pubkey,
    ) -> Result<()> {
        instructions::propose_protocol_authority::handler(ctx, pending_authority)
    }

    pub fn accept_protocol_authority(ctx: Context<AcceptProtocolAuthority>) -> Result<()> {
        instructions::accept_protocol_authority::handler(ctx)
    }
}
