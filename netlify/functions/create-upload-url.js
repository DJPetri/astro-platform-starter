import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const requiredEnv = [
  "IONOS_ENDPOINT",
  "IONOS_ACCESS_KEY",
  "IONOS_SECRET_KEY",
  "IONOS_BUCKET",
];

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

export const handler = async (event) => {

  try {
    if (event.httpMethod !== "POST") {
      return jsonResponse(405, {
        error: "Method not allowed",
      });
    }

    const missingEnv =
      requiredEnv.filter((key) => !process.env[key]);

    if (missingEnv.length > 0) {
      console.error("Missing upload environment variables:", missingEnv);

      return jsonResponse(500, {
        error: "Upload ist nicht korrekt konfiguriert.",
      });
    }

    const {
      storageFolder,
      eventDate,
      eventTitle,
      fileName,
      contentType
    } = JSON.parse(event.body || "{}");

    if (!storageFolder || !eventDate || !eventTitle || !fileName || !contentType) {
      return jsonResponse(400, {
        error: "Upload-Anfrage ist unvollständig.",
      });
    }

    const ext =
      fileName.includes(".")
        ? fileName.split(".").pop().toLowerCase()
        : "bin";

    const slugTitle =
      eventTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "event";

    const s3 = new S3Client({
      endpoint: process.env.IONOS_ENDPOINT,
      region: "eu-central-1",
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.IONOS_ACCESS_KEY,
        secretAccessKey: process.env.IONOS_SECRET_KEY
      }
    });

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

    return jsonResponse(200, {
      uploadUrl,
      key,
      filename: newFilename
    });

  } catch (error) {

    console.error(error);

    return jsonResponse(500, {
      error: "Upload URL konnte nicht erstellt werden.",
      detail: error.message
    });

  }

};
