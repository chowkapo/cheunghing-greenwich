const csv = require("csvtojson");

const signalTypeConversionMap = {
  正常電源: "故障",
  服務中: "服務中",
  故障: "警鐘",
  緊急電源: "正常電源",
  警鐘: "緊急電源",
};

const convert = async (filename) => {
  const data = await csv({
    headers: [
      "modbusChannelId",
      "modbusDeviceId",
      "channelName",
      "locationMask",
    ],
    colParser: {
      modbusChannelId: "number",
      modbusDeviceId: "string",
      channelName: "string",
      locationMask: "number",
    },
    delimiter: "\t",
    checkType: true,
  }).fromFile(filename);
  const filteredData = data
    .filter((v) => !!v.modbusChannelId)
    .map(({ modbusChannelId, channelName, locationMask }) => {
      const match = /^(L\d+)-(.*)$/.exec(channelName);
      const liftNumber = match?.[1];
      // const signalType = signalTypeConversionMap[match?.[2]];
      const signalType = match?.[2];
      return {
        modbusChannelId,
        channelName,
        liftNumber,
        signalType,
        locationMask,
      };
    });
  console.log(JSON.stringify(filteredData, null, 2));
};

filename = process.argv[2];

convert(filename);
