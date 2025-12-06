import { spinner, note } from "@clack/prompts";
import { execa } from "execa";

export async function runTerraformInit(terraformDir, bucketName, region) {
  const s = spinner();
  s.start("Initializing Terraform");

  try {
    await execa(
      "terraform",
      [
        "init",
        "-reconfigure",
        `-backend-config=bucket=${bucketName}`,
        "-backend-config=key=burrow/terraform-main.tfstate",
        `-backend-config=region=${region}`,
        "-backend-config=encrypt=true",
      ],
      { cwd: terraformDir }
    );
    s.stop("Terraform initialized successfully");
  } catch (error) {
    s.stop("Failed to initialize Terraform");
    console.error("Error:", error.message);
    throw error;
  }
}

export async function runTerraApply(
  terraformDir,
  awsVPCId,
  publicSubnet1,
  publicSubnet2,
  privateSubnet1,
  privateSubnet2,
  region
) {
  const s = spinner();
  s.start("Applying Terraform");

  try {
    await execa(
      "terraform",
      [
        "apply",
        "-auto-approve",
        `-var=vpc_id=${awsVPCId}`,
        `-var=public_subnet_1_id=${publicSubnet1}`,
        `-var=public_subnet_2_id=${publicSubnet2}`,
        `-var=private_subnet_1_id=${privateSubnet1}`,
        `-var=private_subnet_2_id=${privateSubnet2}`,
        `-var=region=${region}`,
      ],
      {
        cwd: terraformDir,
        stdio: "inherit",
      }
    );
    s.stop("Terraform applied successfully");
  } catch (error) {
    s.stop("Failed to apply Terraform");
    console.error("Error:", error.message);
    throw error;
  }
}

export async function getTerraformOutput(terraformDir) {
  const s = spinner();
  s.start("Getting Terraform outputs");

  try {
    const [adminPassword, queryToken, cloudfrontDnsRecord, pipelineToken] =
      await Promise.all([
        execa("terraform", ["output", "-raw", "admin-password"], {
          cwd: terraformDir,
        }),
        execa("terraform", ["output", "-raw", "query-api-token"], {
          cwd: terraformDir,
        }),
        execa("terraform", ["output", "-raw", "cloudfront-dns-record"], {
          cwd: terraformDir,
        }),
        execa("terraform", ["output", "-raw", "pipeline-api-token"], {
          cwd: terraformDir,
        }),
      ]);

    s.stop("Deployed! Here's all the information you'll need:");

    const formatContent = (content, minLines = 2, width = 60) => {
      const lines = content.split("\n");
      // Pad each line to the same width
      const paddedLines = lines.map((line) => line.padEnd(width));
      // Ensure minimum number of lines
      while (paddedLines.length < minLines) {
        paddedLines.push("".padEnd(width));
      }
      return paddedLines.join("\n");
    };

    note(
      formatContent(
        `URL:      ${cloudfrontDnsRecord.stdout.trim()}\nUsername: admin\nPassword: ${adminPassword.stdout.trim()}\nUsed for: Accessing the Burrow pipeline management UI`
      ),
      "🌐🔒 Pipeline Management UI"
    );

    note(
      formatContent(
        `Token:    ${pipelineToken.stdout.trim()}\nUsed for: Authenticating requests to the management API`
      ),
      "🔑 Management API Token"
    );

    note(
      formatContent(
        `Token:    ${queryToken.stdout.trim()}\nUsed for: Authenticating requests to the query API`
      ),
      "🔑 Query API Token"
    );
  } catch (error) {
    s.stop("Failed to get Terraform outputs");
    console.error("Error:", error.message);
    throw error;
  }
}

export async function runTerraformDestroy(terraformDir) {
  const s = spinner();
  s.start("Destroying Terraform infrastructure");

  try {
    await execa("terraform", ["destroy", "-auto-approve"], {
      cwd: terraformDir,
      stdio: "inherit",
    });
    s.stop("Terraform destroy completed successfully");
  } catch (error) {
    s.stop("Failed to destroy Terraform infrastructure");
    console.error("Error:", error.message);
    throw error;
  }
}

export async function getTerraformOutputValue(terraformDir, outputName) {
  try {
    const result = await execa("terraform", ["output", "-raw", outputName], {
      cwd: terraformDir,
    });
    return result.stdout.trim();
  } catch (error) {
    console.error(
      `Error getting Terraform output ${outputName}:`,
      error.message
    );
    throw error;
  }
}
