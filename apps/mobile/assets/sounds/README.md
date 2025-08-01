# Timer Sound Assets

This directory contains sound files for timer notifications.

## Adding a Custom Timer Sound

To add a custom sound when the timer completes:

1. **Add your sound file** to this directory as `timer-complete.mp3` or `timer-complete.wav`

2. **Uncomment the sound loading code** in `components/Timer.tsx`:
   ```typescript
   const { sound } = await Audio.Sound.createAsync(
     require('../assets/sounds/timer-complete.mp3'),
     { shouldPlay: false }
   );
   soundRef.current = sound;
   ```

3. **Recommended sound specifications:**
   - Duration: 1-3 seconds
   - Format: MP3 or WAV
   - Sample rate: 44.1kHz or 22kHz
   - Bit depth: 16-bit
   - Keep file size under 100KB for best performance

## Sound Sources

You can find free timer sounds from:
- [Freesound.org](https://freesound.org) (Creative Commons)
- [Zapsplat](https://www.zapsplat.com) (requires free account)
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk) (free)

## Current Implementation

Without a custom sound file, the timer uses:
- ✅ Strong haptic feedback (vibration)
- ✅ Visual alert dialog
- ✅ Multiple haptic pulses for emphasis

The haptic feedback works reliably across all devices, while audio notifications require the custom sound file setup above.