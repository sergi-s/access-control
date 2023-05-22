import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import fetch from "node-fetch";

// ========================================================================
const main = async ({
  arduinoComNumber = "COM7", // com number of the arduino
  scannerComNumber = "COM8", // com number of the qr code scanner
  arduinoReplayNumber = 1, // door number
  deviceId = 1, // security id (for the backend to know who/what door)
}) => {
  // connect to the arduino
  const arduinoSerialPort = new SerialPort({
    path: arduinoComNumber,
    baudRate: 9600,
    autoOpen: true,
  });
  // listen for Arduino responses
  listenToArduino(arduinoSerialPort);
  // toggleRelay(arduinoSerialPort, arduinoReplayNumber);

  // connect to the QrCode Scanner
  const QrScannerSerialPort = new SerialPort({
    path: scannerComNumber,
    baudRate: 9600,
  });

  // listen for QrCode Scanner readings
  listenToQrScanner({
    scanner: QrScannerSerialPort,
    arduino: arduinoSerialPort,
    relayNumber: arduinoReplayNumber,
    deviceId,
  });
};

// ------------------------------------------------------------------------

async function toggleRelay(serialport, relayNumber) {
  let command = `T${relayNumber}`; // toggle door with relayNumber
  if (!relayNumber) command = "AT"; // toggle all doors
  if (relayNumber == 0) return;
  serialport.write(command);
}

// ------------------------------------------------------------------------

async function listenToArduino(serialport) {
  const parser = serialport.pipe(new ReadlineParser({ delimiter: "\r\n" }));
  parser.on("data", async (data) => {
    const arduinoResponse = data;
    if (arduinoResponse == "o") {
      console.log("Command was successful");
      return true;
    } else {
      console.log("something went wrong");
      return false;
    }
  });
}

// ------------------------------------------------------------------------

async function listenToQrScanner({ scanner, arduino, relayNumber, deviceId }) {
  scanner.on("data", async (data) => {
    const ASCIIString = data.toString("ASCII");
    console.log(ASCIIString);
    validateQrCodeController({ ASCIIString, arduino, relayNumber, deviceId });
  });
}

// ------------------------------------------------------------------------

async function validateQrCodeController({
  ASCIIString,
  arduino,
  relayNumber,
  deviceId,
}) {
  const { qrcode } = ASCIIString;
  if (!qrcode || !deviceId) {
    throw new Error("Invalid QrCode");
  }
  const isValid = await validateQrCodeBackend({ qrcode, deviceId });
  if (isValid) {
    toggleRelay(arduino, relayNumber);
  } else {
    console.log("Not valid Qrcode");
  }
}

// ------------------------------------------------------------------------

async function validateQrCodeBackend({ qrcode, deviceId }) {
  const rawResponse = await fetch("http://localhost:5000/guest", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ encryptedQrcode: qrcode, deviceId }),
  });
  const content = await rawResponse.json();
  const isValid = content.scan?.success ? content.scan?.success : false;
  console.log({ content, boo: content?.scan?.success });
  return isValid;
}

// ------------------------------------------------------------------------

// main({
//   arduinoComNumber: "COM7",
//   scannerComNumber: "COM9",
//   arduinoReplayNumber: 1,
//   deviceId: 5,
// });
