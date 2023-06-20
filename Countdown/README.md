# Countdown Clock

Countdown timer built for adding tension to a live drama.

Reference:

- beep.mp3 (Epidemic Sounds)
- Original Code [https://codepen.io/blucube/pen/pgqRKr]

Base features:

- Timer gets increasingly redder within the last 20 seconds
- Timer blinks when stopped, in the last 10 seconds
- Plays a beep every second (not to the second, but every 10 hundredths)
- Automatically saves the time
- Automatically loads the time from the last session
- Uses ExactTimeout for more accurate time keeping

Control features:

- Pause and unpause with the `s` key
- Reset time with the `r` key
- Switch to preset time with the `1`, `2` keys
- Switch to speed up mode with `Enter` key (disabled)
- Adjust speed up ratio with `m` and `n` keys (disabled)
