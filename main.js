import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { dirname } from 'path';
import fs from 'fs';
import ytdl from 'ytdl-core';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from "child_process";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

ipcMain.on('download-videos', async (event, requestObj) => {
  const links = requestObj.links;
  const format = requestObj.format;
  
  console.log("starting download", format);
  const outputDir = path.join(__dirname, 'downloads');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  for (const url of links) {

      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, '');
      const outputPath = path.join(outputDir, `${title}.${'mp4'}`);
      const fileStream = fs.createWriteStream(outputPath);
      // event.sender.send('download-status', { title, status: 'starting' });

      let downloaded = 0;
      let total = 0;
      const stream = ytdl(url, { filter: format==='mp4' ? 'audioandvideo': 'audioonly', quality: 'highest' })
      

      stream
      .on("response", (res) => {
        total = parseInt(res.headers["content-length"], 10);
      })
      .on("data", (chunk) => {
        downloaded += chunk.length;
        // const percent = ((downloaded / total) * 100).toFixed(2);
        // event.sender.send("download-status", { title, status: "progress", percent });
      })
      .on("error", (err) => {
        event.sender.send("download-status", { title, status: "error", error: err.message });
      })
      .pipe(fileStream);

    // ✅ Run conversion only after file is fully written
    fileStream.on("finish", () => {
      console.log("Download complete and file saved to disk.");

      if (format === "mp3") {
        try {
          // Output path for mp3 (don’t overwrite mp4)
          const mp3Path = outputPath.replace(/\.[^/.]+$/, ".mp3");

          const ffmpeg = spawn(ffmpegPath, [
            "-y",              // overwrite
            "-i", outputPath,  // input mp4
            "-q:a", "0",       // best quality VBR
            "-map", "a",       // audio only
            mp3Path,           // output mp3
          ]);

          ffmpeg.stderr.on("data", (data) => {
            console.log(`ffmpeg: ${data}`);
          });

          ffmpeg.on("close", (code) => {
            if (code === 0) {
              console.log("Conversion finished! Saved to", mp3Path);
              event.sender.send("download-status", { title, status: "done" });

              // ✅ delete original mp4
              fs.unlink(outputPath, (err) => {
                if (err) {
                  console.error("Failed to delete original file:", err);
                } else {
                  console.log("Deleted original file:", outputPath);
                }
              });
            } else {
              console.error(`FFmpeg exited with code ${code}`);
              event.sender.send("download-status", { title, status: "error", error: `Exit code ${code}` });
            }
          });

        } catch (err) {
          console.error("FFmpeg error:", err);
          event.sender.send("download-status", { title, status: "error", error: err.message });
        }
      } else {
        event.sender.send("download-status", { title, status: "done" });
      }
    });

  }
});



function createWindow() {
  console.log('Preload path:', path.join(__dirname, 'preload.js'));

  const win = new BrowserWindow({
    width: 1000,
    height: 690,
    webPreferences: {
      // contextIsolation: false,
      // nodeIntegration: true,
      contextIsolation: true,    // secure context
      nodeIntegration: false,    // disable nodeIntegration for security
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      allowRunningInsecureContent: true,
    }
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

