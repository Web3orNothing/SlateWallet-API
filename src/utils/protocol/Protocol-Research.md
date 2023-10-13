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
3.
