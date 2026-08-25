use anchor_lang::prelude::*;

#[error_code]
pub enum TipmarkError {
    #[msg("Profile creation is currently paused")]
    ProfileCreationPaused,
    #[msg("Username must be 2-30 lowercase letters, numbers, or dashes")]
    InvalidUsername,
    #[msg("Metadata URI must be a valid ar:// or ipfs:// content URI")]
    InvalidMetadataUri,
    #[msg("Metadata hash cannot be empty")]
    InvalidMetadataHash,
    #[msg("Payout wallet must be different from the supporter")]
    SelfTipNotAllowed,
    #[msg("Tip amount must be greater than zero")]
    InvalidTipAmount,
    #[msg("Profile is not accepting support")]
    ProfileInactive,
    #[msg("The supplied payout wallet does not match the profile")]
    InvalidPayoutWallet,
    #[msg("Only the current protocol authority may perform this action")]
    InvalidProtocolAuthority,
    #[msg("A pending protocol authority has not been configured")]
    NoPendingAuthority,
    #[msg("Only the pending protocol authority may accept authority")]
    InvalidPendingAuthority,
    #[msg("The PDA is already initialized")]
    PdaAlreadyInitialized,
    #[msg("The PDA must be an empty system-owned account")]
    InvalidPdaAccountOwner,
}
