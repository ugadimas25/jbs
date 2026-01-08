import COS from "cos-nodejs-sdk-v5";
import path from "path";

// Initialize Tencent COS client
const cos = new COS({
  SecretId: process.env.TENCENT_COS_SECRET_ID || "",
  SecretKey: process.env.TENCENT_COS_SECRET_KEY || "",
});

const BUCKET = process.env.TENCENT_COS_BUCKET || "pewaca-1379748683";
const REGION = process.env.TENCENT_COS_REGION || "ap-singapore";
const COS_URL = process.env.TENCENT_COS_URL || "https://pewaca-1379748683.cos.ap-singapore.myqcloud.com";
const FOLDER = "jbs"; // Folder inside bucket

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file buffer to Tencent COS
 */
export async function uploadToCOS(
  fileBuffer: Buffer,
  originalFilename: string,
  mimetype: string
): Promise<UploadResult> {
  const ext = path.extname(originalFilename);
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const key = `${FOLDER}/${uniqueSuffix}${ext}`;

  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
        ContentDisposition: "inline", // Display in browser instead of download
      },
      (err, data) => {
        if (err) {
          console.error("COS upload error:", err);
          reject(err);
        } else {
          console.log("COS upload success:", data);
          resolve({
            url: `${COS_URL}/${key}`,
            key: key,
          });
        }
      }
    );
  });
}

/**
 * Delete a file from Tencent COS
 */
export async function deleteFromCOS(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cos.deleteObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
      },
      (err, data) => {
        if (err) {
          console.error("COS delete error:", err);
          reject(err);
        } else {
          console.log("COS delete success:", data);
          resolve();
        }
      }
    );
  });
}
