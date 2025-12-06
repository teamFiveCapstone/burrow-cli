import { spinner } from "@clack/prompts";
import { execa } from "execa";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export async function buildFrontend(frontendDir) {
  const s = spinner();
  s.start("Building UI");

  try {
    await execa("npm", ["run", "build"], { cwd: frontendDir });
    s.stop("Terraform initialized successfully");
  } catch (error) {
    s.stop("Failed to build the frontend");
    console.error("Error:", error.message);
    throw error;
  }
}

export async function getAllFiles(dirPath, baseDir = dirPath) {
  const files = [];
  const entries = await readdir(dirPath);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      files.push(...(await getAllFiles(fullPath, baseDir)));
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        filePath: fullPath,
        key: relativePath.replace(/\\/g, "/"),
      });
    }
  }

  return files;
}
