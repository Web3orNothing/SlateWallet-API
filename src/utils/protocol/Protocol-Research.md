1. Lido
   - deposit / StakingRouter -> done
     - depositCount {type: number} (non-zero) [required] parameter
     - stakingModuleId {type: number} (currently 1 is only available value) [required] parameter, [discuss]
     - "0x"
   - withdraw -> done
     - none
2. GMX
   - deposit / Vester -> done
   - withdraw / Vester -> done
   - stake / RewardTracker -> done [discuss - fee? staked? bonus?]
   - unstake / RewardTracker -> done
   - long / PositionRouter
   - short / PositionRouter
   - close / PositionRouter
3. Rocket Pool
   - deposit / Deposit -> done
   - withdraw / Deposit -> done
4. Pendle
   - deposit / PendleMarketV2 (created by factory contract)
   - withdraw / PendleMarketV2 (created by factory contract)
   - lock / VotingEscrowPendleMainChain -> done
   - unlock / VotingEscrowPendleMainChain -> done
   - vote / PendleVotingControllerUpg -> done
5. JonesDAO
   - deposit / MillinerV2 -> done
   - withdraw / MillinerV2 -> done
   - claim (+) / MillinerV2 -> done
6. Lodestar
   - deposit /
   - withdraw /
   - lend / Unitroller -> done
   - borrow / Unitroller -> done
   - repay / Unitroller -> done
   - stake / Staking Rewards Proxy -> done
   - unstake / Staking Rewards Proxy -> done
   - claim / Staking Rewards Proxy -> done
   - harvest / Staking Rewards Proxy -> done
   - vote (+) / Voting Power Proxy -> done
7. Dolomite (fully skipped)
   - deposit
   - withdraw
   - lend
   - borrow
   - repay
   - stake
   - unstake
   - claim
   - harvest
8. Plutus
   - deposit / plvGLP, plsSPA, plsJONES farm + MasterChef -> done
   - withdraw / plvGLP, plsSPA, plsJONES farm + MasterChef -> done
   - stake / Epoch Time 1/3/6 Month Staking -> done
   - unstake / Epoch Time 1/3/6 Month Staking -> done
   - lock / Vester -> done
   - unlock / Vester -> done
9. Rodeo
   - deposit / PositionManager ->
   - withdraw / PositionManager -> done
   - lend / Pool (USDC) -> done
   - borrow / Pool (USDC) -> done
   - repay / Pool (USDC) -> done
10. Kwenta
    - deposit / StakingRewards V2 Proxy -> done
    - withdraw / StakingRewards V2 Proxy -> done
    - long / Smart Margin Account Factory
    - short / Smart Margin Account Factory
    - close / Smart Margin Account Factory
