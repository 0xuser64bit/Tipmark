use anchor_lang::prelude::*;

#[constant]
pub const PROTOCOL_VERSION: u8 = 1;

pub const CONFIG_SEED: &[u8] = b"config";
pub const PROFILE_SEED: &[u8] = b"profile";
pub const USERNAME_SEED: &[u8] = b"username";

pub const MIN_USERNAME_LENGTH: usize = 2;
pub const MAX_USERNAME_LENGTH: usize = 30;
pub const MAX_METADATA_URI_LENGTH: usize = 200;
