const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

async function uploadFile(bucketName = '', filePath = '', destFileName = '') {
    if (!bucketName || !filePath || !destFileName) {
        throw new Error("Missing required parameters")
    }
    await storage.bucket(bucketName).upload(filePath, {
        destination: destFileName,
    });
    console.log(`${filePath} uploaded to ${bucketName}`);
    const [metadata] = await storage.bucket(bucketName).file(destFileName).setMetadata({
        cacheControl: "public, max-age=86400"
    })
    console.log(JSON.stringify(metadata, null, 2))
    return metadata
}

const bucketName = "dold-tw-dev-media"
const filePath = process.argv[2]
const destFileName = process.argv[3]

uploadFile(bucketName, filePath, destFileName)