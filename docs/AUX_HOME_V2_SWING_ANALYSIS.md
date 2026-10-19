# AUX Home v2 swing-control investigation

## Target and user test

- Device: AUX C-Smart Premium 3.5 kW
- Android app: AUX Home 2.4.1 (user-provided XAPK)
- User verified in the vendor app that both Up/Down and Left/Right swing turn on and off, and the UI reports the correct state.

## Static findings from the APK

The ARM64 native library `libAUXNativeLib.so` contains symbols/strings for:

- `upDownSwing`
- `getUpDownSwing`
- `leftRightSwing`
- `getLeftRightSwing`
- `up_down_swing`
- `left_right_swing`
- `parse_to_new_v2_control`
- `uart_instruction_new_v2_control`

These findings establish separate internal vertical/horizontal swing concepts, but symbol names alone do not establish the cloud request schema.

A follow-up analysis supplied for this implementation reports that `extracted_all_function.json` describes the following v2 control instructions:

- Vertical swing: `up_down_swing=0` for continuous swing; `up_down_swing=7` for off; values 1–5 are reported as fixed positions.
- Horizontal swing: `left_right_swing=0` for continuous swing; `left_right_swing=7` for off; values 1–3 and 5–6 are reported as fixed positions. The source analysis also mentions 4 as a possible continuous value.

The write implementation currently chooses 0 for enabled/continuous and 7 for disabled/off. These values are based on the supplied static-analysis result and have not yet been independently verified against a captured live request or confirmed device response.

## Current v2 write request

The supplied implementation specification gives this structure:

```json
{
  "intent": {
    "up_down_swing": 0
  },
  "dst": 1,
  "deviceId": "<device_id>"
}
```

For horizontal swing, `intent` becomes `{ "left_right_swing": 0 }`; for either axis being turned off, the corresponding intent value is `7`. The request uses the same object-shaped `intent` and numeric `dst: 1` schema as the app's existing v2 control calls.

The first implementation incorrectly encoded the instruction as a string in `dst` and set `intent` to the string `control`; the user's live test returned HTTP/API code 500. The implementation has now been changed to send the swing field as a numeric value inside the `intent` object and keep `dst: 1`, matching the existing v2 control request shape. This is a reasoned correction, not yet live-device verified.

## Existing integration and state read-back

The legacy backend uses `ac_vdir` and `ac_hdir`; those fields must not be assumed to describe the v2 protocol.

The current v2 `parseControlState` implementation exposes only a combined `swingActive` boolean, derived from `bytes[11] !== 0x20`. No verified mapping has yet been established from the returned v2 status bytes/fields to independent vertical and horizontal states.

Therefore:

- The v2 write methods send separate vertical and horizontal instructions.
- The legacy backend reads and writes separate `ac_vdir` / `ac_hdir` fields.
- Independent v2 status synchronization remains incomplete and must not be fabricated by copying the combined swing state into both capabilities.

## Remaining verification

Before calling this feature fully verified:

1. Confirm both on/off commands against the live AUX v2 API or a redacted official-app request.
2. Confirm the cloud response indicates success and the physical unit changes the requested axis.
3. Determine how the v2 status response represents each axis, or document that the API does not expose independent read-back.
4. Run TypeScript build and lint/tests.
5. Check that existing combined swing functionality and legacy behavior remain intact.

## Current conclusion

The write path has been implemented from the supplied `extracted_all_function.json` analysis using `0` for continuous swing and `7` for off. Live API/device verification and independent v2 status parsing are still outstanding.
