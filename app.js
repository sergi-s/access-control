
// const  { usb, getDeviceList,findByIds,WebUSBDevice, DeviceEvents  } = require( 'usb');
// (async ()=>{

//   // const devices = getDeviceList();
//   const device = findByIds(1317, 42156);
//   // console.log(device);


//   const webDevice = await WebUSBDevice.createInstance(device);

//     if (webDevice) {
//         // console.log(webDevice); // WebUSB device
//         console.dir(webDevice, { depth: null })
//     }
//     // webDevice.
//     // DeviceEvents.

// })();

// conclusion not working
// ==========================================================================================

// var util= require('util');
// var encoder = new util.TextEncoder('utf-8');

// const port = new SerialPort("COM9", {
//   path: '/d/Work/EasyPass_/WiegandTEST',
//   baudRate: 9600
// })
// console.log("port")
// const parser = new Readline();
// console.log("parser")
// port.pipe(parser);
// console.log("pipe")
// parser.on("data", (line) => { console.log("i sense something"); console.log(line) })
// parser.on("readable", (line) => { console.log("i sense something"); console.log(line) })
// console.log("waiting for data")

// conclusion not working
// ==========================================================================================

// var port, textEncoder, writableStreamClosed, writer, historyIndex = -1;

// (async () => {


//   // port = await navigator.serial.requestPort();
//   // await port.open({ baudRate: "COM9" });
//   const port = new SerialPort("COM9", {
//       baudRate: 9600
//     })
//   textEncoder = new TextEncoderStream();
//   writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
//   writer = textEncoder.writable.getWriter();
//   await listenToPort();
// })();

// // ----------------------------------------------------------------------------------

// async function listenToPort() {
//   const textDecoder = new TextDecoderStream();
//   const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
//   const reader = textDecoder.readable.getReader();

//   // Listen to data coming from the serial device.
//   while (true) {
//     const { value, done } = await reader.read();
//     if (done) {
//       // Allow the serial port to be closed later.
//       console.log('[readLoop] DONE', done);
//       reader.releaseLock();
//       break;
//     }
//     // value is a string.
//     console.log(value)
//   }
// }

// conclusion not working
// ==========================================================================================

import fetch from "node-fetch"
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

const main = (async () => {
  //
  const arduinoSerialPort = new SerialPort({ path: 'COM7', baudRate: 9600, autoOpen: true })
  listenToArduino(arduinoSerialPort)
  // openRelay(arduinoSerialPort, 1)


  const QrScannerSerialPort = new SerialPort({ path: 'COM8', baudRate: 9600 })
  listenToQrScanner({ scanner: QrScannerSerialPort, arduino: arduinoSerialPort, relayNumber: 1 });

});

async function openRelay(serialport, relayNumber) {
  let commad = `T${relayNumber}`
  if (!relayNumber) commad = 'AT'
  if (relayNumber == 0) return
  serialport.write(commad);
}
async function listenToArduino(serialport) {
  const parser = serialport.pipe(new ReadlineParser({ delimiter: '\r\n' }))
  parser.on('data', async (data) => {
    console.log({ msgFrom: "I am alive", data })
    if (data == "o") console.log("everything is good")
    else console.log("something went wrrong")
  })
}
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
main();