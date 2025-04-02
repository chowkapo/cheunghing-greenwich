const fs = require('fs').promises
const path = require('path')

const mapUrl = (image) => `require('./map_images/${image}')`

const run = async (file) => {
  try {
    const data = await fs.readFile(file, 'utf16le')
    const lines = data.split(/\n+/)
    const json = []
    lines.forEach(line => {
      const [id, name, map, map_width, map_height] = line.split(/\t/)
      if (id && name && map && id.trim() !== 'id' && parseInt(map_width) && parseInt(map_height)) {
        json.push({
          id: id.trim(),
          name: name.replace(/"/g, '').trim(),
          map: mapUrl(map.trim()),
          map_width: map_width ? parseInt(map_width) : 0,
          map_height: map_height ? parseInt(map_height) : 0
        })
      }
    })
    // console.log(JSON.stringify(json, null, 2))
    let output = JSON.stringify(json, null, 2)
    // output = output.replace(/require/, 'xxx')
    output = output.replace(/"require/g, "require").replace(/'\)"/g, "')")
    // console.log(output.replace(/require/, 'xxx'))
    console.log(`const mapData = ${output};\nexport default mapData;`)
  } catch (err) {
    console.error(err)
  }
}

const input_file = process.argv[2]

if (!input_file) {
  console.log(`node ${path.basename(__filename)} map_data.txt`)
} else {
  run(input_file)
}