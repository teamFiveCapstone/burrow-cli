import { intro, outro, text, isCancel, cancel } from "@clack/prompts";
import { randomUUID } from "crypto";
import { findUp } from "find-up";
import { createTerraformStateBucket, uploadToS3 } from "../utils/aws.js";
import {
  runTerraformInit,
  runTerraApply,
  getTerraformOutput,
  getTerraformOutputValue,
} from "../utils/terraform.js";
import { buildFrontend } from "../utils/buildFrontend.js";
import { burrowSquirrel } from "../assets/ascii.ts";

export async function deploy() {
  const burrowInfraDir = await findUp("burrow-infrastructure/terraform", {
    type: "directory",
  });

  intro(burrowSquirrel);

  const region = await text({
    message: "Enter AWS region:",
    validate(value) {
      if (!value) return "Region is required!";
      if (!/^[a-z0-9-]+$/i.test(value)) return "Invalid region format";
    },
  });

  if (isCancel(region)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const uuid = randomUUID().split("-")[0];
  const bucketName = `burrow-terraform-state-${region.toLowerCase()}-${uuid}`;

  const awsVPCId = await text({
    message: "Enter VPC ID:",
    validate(value) {
      if (value.length === 0) return `Value is required!`;
    },
  });

  if (isCancel(awsVPCId)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const publicSubnet1 = await text({
    message: "Enter Public Subnet ID #1:",
    validate(value) {
      if (value.length === 0) return `Value is required!`;
    },
  });

  if (isCancel(publicSubnet1)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const publicSubnet2 = await text({
    message: "Enter Public Subnet ID #2:",
    validate(value) {
      if (value.length === 0) return `Value is required!`;
    },
  });

  if (isCancel(publicSubnet2)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const privateSubnet1 = await text({
    message: "Enter Private Subnet ID #1:",
    validate(value) {
      if (value.length === 0) return `Value is required!`;
    },
  });

  if (isCancel(privateSubnet1)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  const privateSubnet2 = await text({
    message: "Enter Private Subnet ID #2:",
    validate(value) {
      if (value.length === 0) return `Value is required!`;
    },
  });

  if (isCancel(privateSubnet2)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  await createTerraformStateBucket(region, bucketName);
  await runTerraformInit(burrowInfraDir, bucketName, region);
  await runTerraApply(
    burrowInfraDir,
    awsVPCId,
    publicSubnet1,
    publicSubnet2,
    privateSubnet1,
    privateSubnet2,
    region
  );

  const frontendDir = await findUp("burrow-frontend", {
    type: "directory",
  });

  await getTerraformOutput(burrowInfraDir);
  await buildFrontend(frontendDir);
  const distDir = await findUp("burrow-frontend/dist", {
    type: "directory",
  });

  const frontEndBucket = await getTerraformOutputValue(
    burrowInfraDir,
    "front-end-bucket"
  );

  await uploadToS3({ frontEndBucket, distDir });

  outro(`You're all set!`);
}

async function main() {
  try {
    await deploy();
  } catch (error) {
    console.error("\n❌ Deployment failed!");
    console.error(`Error: ${error.message || error}`);
    process.exit(1);
  }
}

main();
