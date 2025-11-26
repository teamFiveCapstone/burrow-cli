import { intro, outro, text, spinner, isCancel, cancel } from "@clack/prompts";
import { exec } from "child_process";

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

// intro(asciiArt);

// const awsAccessKey = await text({
//   message: "Enter AWS Access Key ID:",
//   validate(value) {
//     if (value.length === 0) return `Value is required!`;
//   },
// });

// if (isCancel(awsAccessKey)) {
//   cancel("Operation cancelled.");
//   process.exit(0);
// }

// const awsAccessSecret = await text({
//   message: "Enter AWS Secret Access Key:",
//   validate(value) {
//     if (value.length === 0) return `Value is required!`;
//   },
// });

// // see if we can log in

// if (isCancel(awsAccessSecret)) {
//   cancel("Operation cancelled.");
//   process.exit(0);
// }

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

exec(`npm run test`, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    // A command might write errors to stderr but still not return an 'error' object
  }
  console.log(`stdout: ${stdout}`);
});

// const s = spinner();
// s.start("Building AWS infra");

// await new Promise((resolve) => setTimeout(resolve, 3000));
// log them in
// make s3 state bucket (Terraform backend)
// uuid funciton to generate id append to burrow-state

// terraform apply supply arguments vpc, subnet ids, region, state bucket name
// s.stop("Done building.");

// outro(`You're all set!`);
