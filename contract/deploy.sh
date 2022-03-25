env 'RUSTFLAGS=-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
near dev-deploy target/wasm32-unknown-unknown/release/nearbasicattentiontoken.wasm
