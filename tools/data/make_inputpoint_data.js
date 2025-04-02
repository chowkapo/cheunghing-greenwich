const fs = require("fs").promises;
const path = require("path");

const fix = (text) => {
  text = text.replace(/"/g, "").trim();
  // text = text.replace(/高水位 *警報/, "高水位");
  // text = text.replace(/低水位 *警報/, "低水位");
  // text = text.replace(/過壓 *警報/, "過壓");
  // text = text.replace(/運行$/, "運行/停止");
  // text = text.replace(/電源供應 故障$/, "電源故障");
  return text;
};

const run = async (file) => {
  try {
    const data = await fs.readFile(file, "utf16le");
    const lines = data.split(/\n+/);
    const json = [];
    lines.forEach((line) => {
      const [
        inputPointId,
        ioModuleId,
        controllerId,
        id,
        name,
        enabledInput,
        LocationMask,
        type,
        sub_type,
        // sub_type2,
        mapId,
        x,
        y,
        // location,
      ] = line.split(/\t/);
      const fixedName = name ? fix(name) : "";
      if (
        inputPointId &&
        parseInt(inputPointId) &&
        type &&
        !fixedName.match(/deleted/i)
      ) {
        const allowedLocations = LocationMask.replace(/\s+/g, "").split("+");
        json.push({
          id: parseInt(inputPointId),
          ioModuleId: parseInt(ioModuleId),
          controllerId: parseInt(controllerId),
          type: type.replace(/"/g, "").trim(),
          sub_type: sub_type ? sub_type.replace(/"/g, "").trim() : "",
          // sub_type2: sub_type2 ? sub_type2.replace(/"/g, "").trim() : "",
          // sub_type3: sub_type3 ? sub_type3.replace(/"/g, "").trim() : "",
          name: fixedName,
          mapId,
          x: x ? parseInt(x) : 0,
          // ioModuleId: parseInt(ioModuleId),
          // controllerId: parseInt(controllerId),
          y: y ? parseInt(y) : 0,
          // panelNumber: Panel_Number.trim(),
          allowedLocations,
          // location: location ? location.replace(/"/g, "").trim() : "",
        });
      }
    });
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
};

const input_file = process.argv[2];

if (!input_file) {
  console.log(`node ${path.basename(__filename)} input_point_data.txt`);
} else {
  run(input_file);
}
