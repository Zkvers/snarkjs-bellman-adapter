pub mod parser;
pub mod types;
use ff::PrimeField as Fr;
pub use parser::{parse_proof, parse_vkey};
use std::env;
pub use types::{ProofStr, VkeyStr};

#[test]
pub fn snark_proof_bellman_verify() {
	let arg_value = match env::var("CIRCUIT_DIR_NAME") {
		Ok(value) => {
			if value.is_empty() {
				eprintln!("Error: CIRCUIT_DIR_NAME arg is empty.");
				assert!(false);
				return;
			}
			value
		},
		Err(e) => {
			eprintln!("Error: Failed to get CIRCUIT_DIR_NAME: {}", e);
			assert!(false);
			return;
		},
	};

	println!("THE CIRCUIT YOU ARE TESTING IS : {}", arg_value);

	let circuit_name = arg_value.as_str();

	use bellman::groth16::{prepare_verifying_key, verify_proof};
	use bls12_381::Bls12;

	println!(">>>>start encode the uncompressed data to Affine<<<<<");

	let pof = parse_proof::<Bls12>(circuit_name);

	let verificationkey = parse_vkey::<Bls12>(circuit_name);

	let pvk = prepare_verifying_key(&verificationkey);

    // "33" is the public signal
	assert!(verify_proof(&pvk, &pof, &[Fr::from_str_vartime("33").unwrap()]).is_ok());

	println!(">>>>end verification<<<<<<<");
}
