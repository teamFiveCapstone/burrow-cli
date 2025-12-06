import { spinner } from "@clack/prompts";
import AWS from "aws-sdk";
import { readFile } from "node:fs/promises";
import { getAllFiles } from "./buildFrontend.js";

export async function createTerraformStateBucket(region, bucketName) {
  const s = spinner();
  s.start("Creating Terraform state bucket");

  try {
    const normalizedRegion = region.toLowerCase();
    const s3 = new AWS.S3({ region: normalizedRegion });

    const createBucketParams = {
      Bucket: bucketName,
    };

    if (normalizedRegion !== "us-east-1") {
      createBucketParams.CreateBucketConfiguration = {
        LocationConstraint: normalizedRegion,
      };
    }

    await s3.createBucket(createBucketParams).promise();

    console.log(`✅ Created Terraform state bucket: ${bucketName}`);
    s.stop(`Created state bucket: ${bucketName}`);
    return bucketName;
  } catch (error) {
    s.stop("Failed to create bucket");
    console.error(`❌ Failed to create bucket: ${error.message}`);
    throw error;
  }
}

async function uploadFile(s3, bucket, filePath, key) {
  const fileContent = await readFile(filePath);

  try {
    const response = await s3
      .putObject({
        Bucket: bucket,
        Key: key,
        Body: fileContent,
      })
      .promise();

    return response;
  } catch (error) {
    console.error(`Error uploading ${key}:`, error.message);
    throw error;
  }
}

export async function uploadToS3({ frontEndBucket, distDir }) {
  const s3 = new AWS.S3();

  try {
    const files = await getAllFiles(distDir);

    for (const file of files) {
      await uploadFile(s3, frontEndBucket, file.filePath, file.key);
    }
  } catch (error) {
    console.error("Error during upload:", error);
    throw error;
  }
}
