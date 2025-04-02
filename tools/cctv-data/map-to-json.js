const csv = require("csvtojson");

const convert = async (filename) => {
  const data = await csv({
    headers: [
      "id",
      "description",
      "image",
      "map_width",
      "map_height"
    ],
    colParser: {
      id: "string",
      description: "string",
      image: "string",
      map_width: "number",
      map_height: "number"
    },
    delimiter: '\t',
    checkType: true,
  }).fromFile(filename);
  // data.forEach(v => {
  //   v.src = `require('../cctv_map_images/${v.id}.png')`
  // })
  // const mapIdList = data.map(v => v.id)
  const mapDataObject = {}
  data.filter(v => !!v.id).forEach(v => {
    mapDataObject[v.id] = {
      // ...v,
      id: v.id,
      // name: v.id,
      src: `require('../cctv_map_images/${v.image}')`,
      width: v.map_width,
      height: v.map_height
    }
  })
  const dataOutput = JSON.stringify(mapDataObject, null, 2).replace(
    /"(require.*?)"/g, "$1"
  )
  const output = `const cctvMapData: {
    [id: string]: {
      id: string;
      src: any;
      width: number;
      height: number;
    }
  } = ${dataOutput}
export default cctvMapData
`
  console.log(output);
};

filename = process.argv[2]

convert(filename);
