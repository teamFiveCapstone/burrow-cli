import { intro, outro } from "@clack/prompts";
import { findUp } from "find-up";
import { runTerraformDestroy } from "../utils/terraform.js";

export async function destroy() {
  intro("Terraform Destroy Command Executed");

  const burrowInfraDir = await findUp("burrow-infrastructure/terraform", {
    type: "directory",
  });

  try {
    await runTerraformDestroy(burrowInfraDir);
    outro("All infrastructure has been destroyed.");
  } catch (error) {
    console.error("❌ Destroy operation failed:", error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    await destroy();
  } catch (error) {
    console.error("\n❌ Destroy operation failed!");
    console.error(`Error: ${error.message || error}`);
    process.exit(1);
  }
}

main();
