import { intro, outro, text, spinner, isCancel, cancel } from "@clack/prompts";
import { execa } from "execa";
import { randomUUID } from "crypto";
import AWS from "aws-sdk";
import path from "node:path";
// import { pathExists } from "path-exists";
import { findUp, findDown } from "find-up";

const asciiArt = `
                                                                                                                                                                        
                                            :--:.         .:..                                      
                                           .=#**#+.      .:###-.                                    
                                          .+*++++**+*##########-.                                   
                                          .+*++++*#*+++++++*###+.                                   
                                          .-#*:..-++++++++++++*#+.                                  
                                           .-*=....-=+++++++++++#*:                                 
                                           .=+.......:=++++++++++#*.                                
                                          .-+:.........:=+++++++++#-                                
                                        .:++............:=++++++=:#-                                
                              ........  =*........-*#=...:+===+:-:*.                                
                           .+#####*#####-++.......=##*.........=*.+*:                               
                        .=##*+++===+++++*##:...............:+:...:*-                                
                      .:#*++=:.......-=++*##+-...................++.                                
                     .=#++=:.::--:....:=++##*-................:=*-.                                 
                    .=#++=:-++++++++=-=+++##=................:+-.                                   
                   .-#+++=+++++++++++++++*#*:.............=###*:                                    
                   .+*+++++++++++++++++++##-.........*=:*########+.                                 
                  .-#*++++++++++++++++++##+.......:=++*###########-                                 
                  .-#*+++++++++++++++++##+=.......=+++++*########*#-                                
                  .-#*++++++++++++++++##++=......::=+++*########+**:                                
                  .:**+++++++++++++++##++++:......=++++++########=.                                 
                   .=#++++++++++++++*#*++++=:............:=**=+*.                                   
                    .+*+++++++++++++#*+++++++==-..............-*-                                   
                     .*#+++++++++++##*++++++++++*+.............=#=                                  
                      .*#*++++++++###++++++++++++*+............=*#.                                 
                        :###*+++#####*+++++++++++**:..........-+*#.                                 
                         .-###########+++++++++++**-:........:=+#*:.                                
                           ..+*########++++++++=...-*#:.....-++-.:+*:.                              
                          ..::::-+**#####******====++#*===+****+=++*=:::..                          
                          ...........:::::--------------::::::::::........                          
                                                                                                    
                                                                                                    
              ...........                                                                           
              .=#########=.                                                                         
              .=##.   .-##=.:-:.    .--..--:.:=:--:.:=: .:-===-:..:-:.   .:--.   .--:.              
              .=##.    .##=:*#+.    :##-.######=######=-*##++*###--##:. .-###:   +#*.               
              .=##++++*##-..*#+.    :##-.##*-...##*:..-##-.  ..=##=+#+. :+###*. .*#-.               
              .=##=---=##+:.*#+.    :##-.##+.  .##=. .*#+.     .##*-##..-#+:##:.=#*.                
              .=##.    .+#*-*#+.    :##-.##+.  .##=. .*#+.     .##*.+#*.*#-.+#+:*#:                 
              .=##.    .*#*:*##:    +##-.##+.  .##=. .-##=.   .+##- :*#-#+. .#*+#+                  
              .=#########*:..*#########-.##+.  .##=.  .:*#######*:  .=###-   =###:                  
              .:-------:.     .-==-..--..--:.  .--:.    ..-==-:..    .--:.   .--:.                  
`;

const burrowInfraDir = await findUp("burrow-infrastructure/terraform-test", {
  type: "directory",
});

// if (!burrowInfraDir) {
//   console.error("Error: burrow-infrastructure/terraform directory not found");
//   process.exit(1);
// }

async function verifyingAWSUser() {
  try {
    const { stdout } = await execa("aws", ["sts", "get-caller-identity"]);
    console.log(stdout);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// // verifyingAWSUser();

// intro(asciiArt);

// Get region from user
const region = await text({
  message: "Enter AWS region:",
  validate(value) {
    if (!value) return "Region is required!";
    // Optional: validate region format
    if (!/^[a-z0-9-]+$/i.test(value)) return "Invalid region format";
  },
});

// Normalize region to lowercase
const normalizedRegion = region.toLowerCase();

// // Generate unique bucket name
const uuid = randomUUID().split("-")[0]; // First 8 chars for shorter name
const bucketName = `burrow-terraform-state-${normalizedRegion}-${uuid}`;
const s3 = new AWS.S3({ region: normalizedRegion });

const s = spinner();
s.start("Creating Terraform state bucket");

try {
  // Create bucket
  // Note: LocationConstraint not needed for us-east-1
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
} catch (error) {
  console.error(`❌ Failed to create bucket: ${error.message}`);
}
s.stop(`Created state bucket: ${bucketName}`);

async function runTerraformInit(terraformDir) {
  const s = spinner();
  s.start("Initializing Terraform");

  try {
    await execa("terraform", ["init"], { cwd: terraformDir });
    s.stop("Terraform initialized successfully");
  } catch (error) {
    s.stop("Failed to initialize Terraform");
    console.error("Error:", error.message);
    throw error;
  }
}

async function runTerraApply(terraformDir, bucketName) {
  const s = spinner();
  s.start("Applying Terraform");

  try {
    await execa(
      "terraform",
      [
        "apply",
        "-auto-approve",
        `-var`,
        `state_bucket=${"hello-cli-world-1234"}`,
      ],
      {
        cwd: terraformDir,
        stdio: "inherit", // Show terraform output
      }
    );
    s.stop("Terraform applied successfully");
  } catch (error) {
    s.stop("Failed to apply Terraform");
    console.error("Error:", error.message);
    throw error;
  }
}

await runTerraformInit(burrowInfraDir);
await runTerraApply(burrowInfraDir);

// Bucket creation code here

// Pass bucketName to Terraform as backend configuration

// const awsVPCId = await text({
//   message: "Enter VPC ID:",
//   validate(value) {
//     if (value.length === 0) return `Value is required!`;
//   },
// });

// if (isCancel(awsVPCId)) {
//   cancel("Operation cancelled.");
//   process.exit(0);
// }

// const publicSubnet1 = await text({
//   message: "Enter Public Subnet ID #1:",
//   validate(value) {
//     if (value.length === 0) return `Value is required!`;
//   },
// });

// if (isCancel(publicSubnet1)) {
//   cancel("Operation cancelled.");
//   process.exit(0);
// }

// const publicSubnet2 = await text({
//   message: "Enter Public Subnet ID #2:",
//   validate(value) {
//     if (value.length === 0) return `Value is required!`;
//   },
// });

// if (isCancel(publicSubnet2)) {
//   cancel("Operation cancelled.");
//   process.exit(0);
// }

// const privateSubnet1 = await text({
//   message: "Enter Private Subnet ID #1:",
//   validate(value) {
//     if (value.length === 0) return `Value is required!`;
//   },
// });

// if (isCancel(privateSubnet1)) {
//   cancel("Operation cancelled.");
//   process.exit(0);
// }

// const privateSubnet2 = await text({
//   message: "Enter Private Subnet ID #2:",
//   validate(value) {
//     if (value.length === 0) return `Value is required!`;
//   },
// });

// if (isCancel(privateSubnet2)) {
//   cancel("Operation cancelled.");
//   process.exit(0);
// }

// exec(`npm run test`, (error, stdout, stderr) => {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     return;
//   }
//   if (stderr) {
//     console.error(`stderr: ${stderr}`);
//     // A command might write errors to stderr but still not return an 'error' object
//   }
//   console.log(`stdout: ${stdout}`);
// });

// const s = spinner();
// s.start("Building AWS infra");

// await new Promise((resolve) => setTimeout(resolve, 3000));
// log them in
// make s3 state bucket (Terraform backend)
// uuid funciton to generate id append to burrow-state

// terraform apply supply arguments vpc, subnet ids, region, state bucket name
// s.stop("Done building.");

outro(`You're all set!`);
