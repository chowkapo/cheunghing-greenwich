const csv = require("csvtojson");

const convert = async (filename) => {
  const data = await csv({
    headers: [
      "cameraId",
      "location",
      // "cameraName",
      // "IpAddress",
      // "subnetMask",
      // "gateWay",
      "mainStream",
      "subStream",
      "monitor",
      "mapid",
      "x",
      "y",
    ],
    colParser: {
      cameraId: "string",
      location: "string",
      // cameraName: "string",
      // IpAddress: "string",
      // subnetMask: "string",
      // gateWay: "string",
      mainStream: "string",
      subStream: "string",
      monitor: "string",
      mapid: "string",
      x: "number",
      y: "number",
    },
    delimiter: "\t",
    checkType: true,
  }).fromFile(filename);
  data.forEach((v) => {
    v.monitor = v.monitor.trim().split(/[ +&]+/);
    const matches = /(\b(\w+)\/F)/i.exec(v.location);
    const lift = /(Lift\s+\d+)/i.exec(v.location);
    if (matches?.[0]) {
      v.floor = matches?.[0] ?? "";
    } else if (lift?.[0]) {
      // v.floor = lift?.[0] ?? "";
      // put lift cameras on G/F
      v.floor = "G/F";
    } else if (/Refuge/i.exec(v.location)) {
      v.floor = "R/F";
    } else if (/^\w+\/F$/i.exec(v.location)) {
      v.floor = v.location;
    } else if (v.mapid === "GF") {
      v.floor = "G/F";
    } else {
      v.floor = "-";
    }
  });
  // console.log(JSON.stringify(data.filter(v => v.mapid && v.x !== '' && v.y !== ''), null, 2));
  console.log(
    JSON.stringify(
      data
        .filter((v) => v.cameraId && v.mapid && v.x && v.y)
        .map((v) => {
          const {
            cameraId,
            // cameraName,
            mainStream,
            subStream,
            monitor,
            mapid,
            x,
            y,
            location,
            floor,
          } = v;
          const cameraNumber = Number(cameraId.replace(/[^\d+]/g, ""));
          return {
            cameraId: cameraNumber,
            // cameraName,
            mainStream,
            subStream,
            monitor,
            mapid,
            x,
            y,
            location,
            floor,
          };
        }),
      null,
      2
    )
  );
};

filename = process.argv[2];

convert(filename);
