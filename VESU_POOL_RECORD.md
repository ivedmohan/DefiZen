# Yield Position - Vesu Fusion STRK Pool

## 📍 Pool Information

**Protocol**: Vesu (via Troves.fi)  
**Pool URL**: https://app.troves.fi/strategy/vesu_fusion_strk  
**Pool Name**: Vesu Fusion STRK  
**Token**: STRK  
**APY**: ~12-15% (variable)

## 💰 Transaction History

### Deposit
- **Amount**: 22.7556 STRK
- **Date**: October 2, 2025 (16:27 UTC)
- **Transaction**: 0x340373e339011973adb017db38babd92e555d83126f8ae6e566ab1ace3ea2a
- **Action**: Autonomous deposit via backend

### Withdrawal
- **Date**: October 2, 2025
- **Action**: Manual withdrawal via Vesu website
- **Method**: Direct interaction with https://app.troves.fi/strategy/vesu_fusion_strk
- **Status**: ✅ Completed

## 📊 Duration
- **Total Time**: ~30 minutes (testing period)
- **Yield Earned**: Minimal (short duration)

## 🎓 Lessons Learned

### Gas Fee Issue
- StarkNet v3 transactions require ETH for gas fees, not STRK
- Need ~0.001 ETH (~$4-5) for withdrawal transactions
- Wallet had insufficient ETH for backend withdrawal

### Solution
- Manual withdrawal via Vesu website worked successfully
- Vesu UI handles gas estimation better
- Direct protocol interaction bypassed backend gas issues

## 🔄 Next Steps

Update autonomous strategy to:
1. Only deposit 50% of available tokens to yield pools
2. Keep 50% liquid for volatility swaps
3. Ensure sufficient ETH for gas before deposits

---

**Note**: This pool was accessed via Troves.fi (Vesu aggregator) not StrkFarm directly.
