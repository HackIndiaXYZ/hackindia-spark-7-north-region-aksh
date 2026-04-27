use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Replace with actual program ID when deployed

#[program]
pub mod watchtower {
    use super::*;

    pub fn initialize_validator(
        ctx: Context<InitializeValidator>,
        validator_id: String,
    ) -> Result<()> {
        let reputation_account = &mut ctx.accounts.reputation_account;
        reputation_account.validator_id = validator_id;
        reputation_account.trust_score = 50;
        reputation_account.total_verified_checks = 0;
        reputation_account.last_checkpoint_ts = Clock::get()?.unix_timestamp;
        reputation_account.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn update_reputation(
        ctx: Context<UpdateReputation>,
        trust_score: u8,
        total_verified_checks: u64,
    ) -> Result<()> {
        let reputation_account = &mut ctx.accounts.reputation_account;
        
        // Ensure only the Hub authority can update this
        require!(
            reputation_account.authority == ctx.accounts.authority.key(),
            ErrorCode::Unauthorized
        );

        reputation_account.trust_score = trust_score;
        reputation_account.total_verified_checks = total_verified_checks;
        reputation_account.last_checkpoint_ts = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn log_status_change(
        ctx: Context<LogStatusChange>,
        website_id: String,
        old_status: String,
        new_status: String,
    ) -> Result<()> {
        let uptime_ledger = &mut ctx.accounts.uptime_ledger;
        
        uptime_ledger.website_id = website_id;
        uptime_ledger.old_status = old_status;
        uptime_ledger.new_status = new_status;
        uptime_ledger.timestamp = Clock::get()?.unix_timestamp;
        uptime_ledger.authority = ctx.accounts.authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(validator_id: String)]
pub struct InitializeValidator<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 8 + 8 + 32, // Discriminator + ID(string assumed 32 bytes max for hash) + score + checks + ts + authority
        seeds = [b"reputation", validator_id.as_bytes()],
        bump
    )]
    pub reputation_account: Account<'info, ValidatorReputation>,
    #[account(mut)]
    pub authority: Signer<'info>, // The Hub Wallet
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    #[account(mut)]
    pub reputation_account: Account<'info, ValidatorReputation>,
    pub authority: Signer<'info>, // The Hub Wallet
}

#[derive(Accounts)]
#[instruction(website_id: String)]
pub struct LogStatusChange<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 10 + 10 + 8 + 32, 
        seeds = [b"uptime", website_id.as_bytes(), &Clock::get().unwrap().unix_timestamp.to_le_bytes()],
        bump
    )]
    pub uptime_ledger: Account<'info, UptimeLedger>,
    #[account(mut)]
    pub authority: Signer<'info>, // The Hub Wallet
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ValidatorReputation {
    pub validator_id: String,
    pub trust_score: u8,
    pub total_verified_checks: u64,
    pub last_checkpoint_ts: i64,
    pub authority: Pubkey,
}

#[account]
pub struct UptimeLedger {
    pub website_id: String,
    pub old_status: String,
    pub new_status: String,
    pub timestamp: i64,
    pub authority: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
}
