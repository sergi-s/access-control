
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import fetch from "node-fetch";


// ========================================================================
const main = (async ({ arduinoComNumber = 'COM7', scannerComNumber = 'COM8', arduinoReplayNumber = 1 }) => {
  // working
  const arduinoSerialPort = new SerialPort({ path: arduinoComNumber, baudRate: 9600, autoOpen: true })
  listenToArduino(arduinoSerialPort)
  openRelay(arduinoSerialPort, arduinoReplayNumber)

  // working
  const QrScannerSerialPort = new SerialPort({ path: scannerComNumber, baudRate: 9600 })
  listenToQrScanner({ scanner: QrScannerSerialPort, arduino: "arduinoSerialPort", relayNumber: arduinoReplayNumber });
});

// ------------------------------------------------------------------------

async function openRelay(serialport, relayNumber) {
  let commad = `T${relayNumber}`
  if (!relayNumber) commad = 'AT'
  if (relayNumber == 0) return
  serialport.write(commad);
}

// ------------------------------------------------------------------------

async function listenToArduino(serialport) {
  const parser = serialport.pipe(new ReadlineParser({ delimiter: '\r\n' }))
  parser.on('data', async (data) => {
    console.log({ msgFrom: "I am alive", data })
    if (data == "o") console.log("everything is good")
    else console.log("something went wrrong")
  })
}

// ------------------------------------------------------------------------

async function listenToQrScanner({ scanner, arduino, relayNumber }) {
  scanner.on('data', async (data) => {
    const qrcode = data.toString('ASCII')
    console.log(qrcode);
    const isValid = await validateQrcode(qrcode)
    if (isValid) {
      openRelay(arduino, relayNumber)
    } else {
      console.log("Not valid Qrcode")
    }
  })
}

// ------------------------------------------------------------------------

async function validateQrcode(qrcode) {
  const rawResponse = await fetch("http://localhost:5000/guest", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ encryptedQrcode: qrcode, deviceId: 1 }),
  });
  const content = await rawResponse.json();
  const isValid = (content.scan?.success) ? content.scan?.success : false;
  console.log({ content, boo: content?.scan?.success });
  return isValid;
}

// ------------------------------------------------------------------------

main({ arduinoComNumber: 'COM7', scannerComNumber: 'COM9', arduinoReplayNumber: 1 });