const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  endpoint: process.env.IONOS_ENDPOINT,
  region: "eu-central-1",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.IONOS_ACCESS_KEY,
    secretAccessKey: process.env.IONOS_SECRET_KEY
  }
});

exports.handler = async (event) => {

  try {

    const {
      storageFolder,
      eventDate,
      eventTitle,
      fileName,
      contentType
    } = JSON.parse(event.body);

    const ext =
      fileName.split(".").pop().toLowerCase();

    const slugTitle =
      eventTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    const now = new Date();

    const hh =
      String(now.getHours()).padStart(2, "0");

    const mm =
      String(now.getMinutes()).padStart(2, "0");

    const ss =
      String(now.getSeconds()).padStart(2, "0");

    const ssss =
      String(now.getMilliseconds()).padStart(4, "0");

    const timestamp =
      `${hh}${mm}${ss}${ssss}`;

    const random6 =
      Math.random()
        .toString(36)
        .substring(2, 8);

    const newFilename =
      `${eventDate}_${slugTitle}_${timestamp}_${random6}.${ext}`;

    const key =
      `${storageFolder}/${newFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.IONOS_BUCKET,
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(
      s3,
      command,
      {
        expiresIn: 300
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl,
        key,
        filename: newFilename
      })
    };

  } catch (error) {

    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };

  }

};