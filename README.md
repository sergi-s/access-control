# QR Code Access Control System - Prototype

This prototype demonstrates a QR code-based access control system using an Arduino and a QR code scanner. It toggles a relay based on QR code validation.

## Overview

- **Arduino**: Controls a relay to lock/unlock a door.
- **QR Code Scanner**: Reads QR codes and sends them to the system.
- **Backend Service**: Validates QR codes at `http://localhost:5000/guest`.

## Setup

1. **Install Dependencies**:

   ```bash
   npm install serialport @serialport/parser-readline node-fetch
   ```

2. **Configure Serial Ports**:

   Update `arduinoComNumber` and `scannerComNumber` with your COM port numbers.

3. **Run Backend Service**:

   Ensure the backend is running at `http://localhost:5000/guest`.

## Usage

Call the `main` function with appropriate parameters:

```javascript
main({
  arduinoComNumber: "COM7",
  scannerComNumber: "COM8",
  arduinoReplayNumber: 1,
  deviceId: 1,
});
```

## Functions

- **`toggleRelay`**: Toggles the relay via the Arduino.
- **`listenToArduino`**: Listens for Arduino responses.
- **`listenToQrScanner`**: Listens for QR codes and validates them.
- **`validateQrCodeBackend`**: Validates QR codes with the backend.

## Notes

- This is just a prototype.