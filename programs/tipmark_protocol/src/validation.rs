use crate::constants::{MAX_METADATA_URI_LENGTH, MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH};

pub fn is_valid_username(username: &str) -> bool {
    let bytes = username.as_bytes();

    (MIN_USERNAME_LENGTH..=MAX_USERNAME_LENGTH).contains(&bytes.len())
        && bytes
            .iter()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || *byte == b'-')
        && bytes.first() != Some(&b'-')
        && bytes.last() != Some(&b'-')
        && !bytes.windows(2).any(|window| window == b"--")
}

pub fn is_valid_metadata_uri(uri: &str) -> bool {
    if uri.is_empty() || uri.len() > MAX_METADATA_URI_LENGTH || !uri.is_ascii() {
        return false;
    }

    let resource = uri
        .strip_prefix("ar://")
        .or_else(|| uri.strip_prefix("ipfs://"));

    resource.is_some_and(|value| {
        !value.is_empty()
            && value
                .bytes()
                .all(|byte| byte.is_ascii_graphic() && !byte.is_ascii_whitespace())
    })
}

pub fn is_valid_metadata_hash(hash: &[u8; 32]) -> bool {
    hash.iter().any(|byte| *byte != 0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_canonical_usernames() {
        for username in ["ab", "ada", "ada-lovelace", "creator-42"] {
            assert!(is_valid_username(username), "{username}");
        }
    }

    #[test]
    fn rejects_ambiguous_or_noncanonical_usernames() {
        for username in [
            "a",
            "Ada",
            "ada_lovelace",
            "-ada",
            "ada-",
            "ada--lovelace",
            "this-handle-is-longer-than-thirty-characters",
        ] {
            assert!(!is_valid_username(username), "{username}");
        }
    }

    #[test]
    fn accepts_only_bounded_content_addressed_metadata() {
        assert!(is_valid_metadata_uri("ar://transaction-id"));
        assert!(is_valid_metadata_uri("ipfs://bafybeigdyrzt"));
        assert!(!is_valid_metadata_uri(""));
        assert!(!is_valid_metadata_uri("https://example.com/profile.json"));
        assert!(!is_valid_metadata_uri("ar://contains spaces"));
        assert!(!is_valid_metadata_uri(&format!("ar://{}", "a".repeat(200))));
    }

    #[test]
    fn rejects_an_empty_metadata_hash() {
        assert!(!is_valid_metadata_hash(&[0; 32]));

        let mut hash = [0; 32];
        hash[31] = 1;
        assert!(is_valid_metadata_hash(&hash));
    }
}
