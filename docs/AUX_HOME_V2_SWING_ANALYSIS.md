# AUX Home v2 swing-control investigation

## Target and user test

- Device: AUX C-Smart Premium 3.5 kW
- Android app: AUX Home 2.4.1 (user-provided XAPK)
- User verified in the vendor app that both Up/Down and Left/Right swing turn on and off, and the UI reports the correct state.

## Verified static findings from the APK

The ARM64 native library `libAUXNativeLib.so` contains symbols/strings for:

- `upDownSwing`
- `getUpDownSwing`
- `leftRightSwing`
- `getLeftRightSwing`
- `up_down_swing`
- `left_right_swing`
- `parse_to_new_v2_control`
- `uart_instruction_new_v2_control`

These findings establish that the app has separate internal vertical/horizontal swing concepts and a native v2 control encoder. They do **not** establish the JSON schema accepted by the cloud endpoint or the values expected for each command.

## Existing integration

The Homey v2 client currently sends requests to `/app/device/v2/control` with the existing generic control structure. The exact swing-specific v2 intent/payload fields have not been verified. The legacy backend uses `ac_vdir` and `ac_hdir`, but those names must not be assumed to work with the v2 endpoint.

## Safety / implementation status

- Homey capability definitions for `aux_vertical_swing` and `aux_horizontal_swing` are added on this branch.
- Legacy backend mapping uses `ac_vdir` and `ac_hdir`.
- The v2 backend intentionally rejects these writes until the v2 request schema is established.
- Do not remove this guard or send guessed fields to a real device.

## Evidence needed to finish v2 commands

To implement the v2 command adapter safely, establish at least one of:

1. The Java/JNI call path showing the arguments passed to `upDownSwing` / `leftRightSwing` and how the native control buffer is wrapped for the cloud API; or
2. A redacted request/response from the official app when toggling each axis, including the request body and relevant response/status fields; or
3. A vendor/SDK protocol definition that specifies the v2 command fields and values.

Once that is known, implement and test both directions (on/off) and poll/read-back of each axis before considering the feature ready.

## Current conclusion

The APK provides useful reverse-engineering leads, but no exact, verified cloud payload is documented yet. This document deliberately does not invent one.
