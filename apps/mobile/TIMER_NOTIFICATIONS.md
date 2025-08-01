# Timer Notifications Setup & Testing

This guide explains how to set up and test timer notifications (sound and haptic feedback) in the Fractal Assembly mobile app.

## Current Implementation Status

✅ **Working Features:**
- Strong haptic feedback (vibration) when timer completes
- Visual alert dialog notification
- Multiple haptic pulses for emphasis
- Audio framework setup (expo-av installed)
- Timer completion sound (bell chime included)

## Quick Test

To test the timer notifications:

1. **Start the app:**
   ```bash
   cd apps/mobile
   npm start
   # or
   expo start
   ```

2. **Create a short test timer:**
   - Add a new task with a 5-second duration
   - Start the timer
   - Wait for completion

3. **Expected behavior when timer completes:**
   - Device vibrates with success haptic pattern
   - Alert dialog appears saying "⏰ Timer Complete!"
   - Additional heavy haptic pulses at 200ms, 400ms, and 600ms intervals

## Sound Implementation

The timer now includes a built-in completion sound:

- **Default Sound:** Pleasant bell chime (`timer-complete.wav`)
- **Auto-plays:** When any timer completes
- **Works in:** Silent mode (iOS) and all Android modes

### Replacing the Sound (Optional)

To use your own timer sound:

1. Replace the file at: `assets/sounds/timer-complete.wav`
2. Keep the same filename or update the require path in `InlineTimer.tsx`
3. Restart the app to load the new sound

## Recommended Sound Specifications

- **Duration:** 1-3 seconds
- **Format:** MP3 (preferred) or WAV
- **Sample Rate:** 44.1kHz or 22kHz
- **Bit Depth:** 16-bit
- **File Size:** Under 100KB for best performance
- **Style:** Bell, chime, or gentle notification sound

## Free Sound Sources

- [Freesound.org](https://freesound.org) - Creative Commons sounds
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk) - Free library
- [Zapsplat](https://www.zapsplat.com) - Requires free account

## Troubleshooting

### Haptics Not Working
- Ensure you're testing on a physical device (simulators don't support haptics)
- Check device haptic settings are enabled
- Try restarting the app

### Audio Not Playing
- Verify sound file exists: `assets/sounds/timer-complete.wav`
- Check device volume settings
- Test with headphones/speakers connected
- Note: Sound should play even in silent mode on iOS

### Timer Not Triggering
- Ensure task has a duration set
- Check that timer reaches zero (watch the countdown)
- Verify network connection to backend

## Technical Details

### Haptic Implementation
```typescript
// Success notification haptic
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Additional emphasis haptics
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
```

### Audio Configuration
```typescript
await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,        // Play even in silent mode
  staysActiveInBackground: false,     // Don't continue in background
  shouldDuckAndroid: true,           // Lower other audio on Android
});
```

## Platform Differences

### iOS
- Haptics work on iPhone 6s and newer
- Audio respects silent mode (unless configured otherwise)
- Haptic feedback is subtle but distinct

### Android
- Haptics work on most modern devices
- Audio behavior varies by manufacturer
- Some devices have stronger haptic feedback

## Testing Checklist

- [ ] Timer countdown works correctly
- [ ] Haptic feedback triggers on completion
- [ ] Alert dialog appears
- [ ] Multiple haptic pulses occur
- [ ] Custom sound plays (if configured)
- [ ] Works in silent mode (iOS)
- [ ] Works with device locked
- [ ] No crashes or errors in console

## Next Steps

After basic testing works:
1. Customize the timer sound if desired
2. Test on multiple devices/platforms
3. Consider adding different notification types for different timer durations
4. Add user preferences for notification style

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed (`expo-av`, `expo-haptics`)
3. Test on a physical device rather than simulator
4. Ensure the backend timer API is working correctly