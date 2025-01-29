const express = require('express')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const pathh = require('path')

const tmp = require('tmp');

const cors = require('cors')

const app = express()
const fs = require('fs');
const ytdl = require('ytdl-core');

app.use(cors({
    origin: 'https://youtube-video-downloader-phi-five.vercel.app',
    methods: ['GET', 'POST'],    
    allowedHeaders: ['Content-Type', 'Authorization'], 
}))
app.use("/videos", express.static(pathh.join(__dirname, "videos")));
app.use(express.json())


app.get('/', async (req, res) => {
 res.send('hello world')
})


// app.get("/download", async (req, res) => {


//     const date = Date.now()
//     const folderPath = pathh.join(__dirname, `${date}-videos`);

//     fs.mkdir(folderPath, { recursive: true }, (err) => {
//         if (err) {
//             console.error('Error creating video folder:', err);
//             return;
//         }
//         console.log('Video folder created successfully');
//     });


//     const videoUrl = req.query.url;
//     const quality = req.query.quality;

//     console.log(req.query.quality)
//     console.log(videoUrl)

//     try {

//         const d = await download(folderPath, videoUrl, quality);

//         if (!d) {
//             return res.status(500).send('Failed to download video');
//         }


//         const mergedVideo = await mergeVideoAudio(folderPath);

//         if (!mergedVideo) {
//             return res.status(500).send('Failed to merge video and audio');
//         }


//         const videoId = await ytdl.getURLVideoID(videoUrl);
//         const info = await ytdl.getInfo(videoId);

//         const videoTitle = info.videoDetails.title
//         const title = videoTitle.replace(/[\/:*?"<>|]/g, '');
//         const cleanTitle = videoTitle.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')

//         console.log('VIDEO PATH:', videoPath)

//         fs.access(videoPath, fs.constants.F_OK, (err) => {
//             if (err) {
            
//                 return res.status(404).send('Video not found');
//             }


     
//             res.setHeader('Content-Type', `${cleanTitle}/mp4`);
//             res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.mp4"`);

  
//             const videoStream = fs.createReadStream(videoPath);
//             videoStream.pipe(res); 

//             res.on('finish', () => {
//                 console.log('Video Downloaded Successfully')
//                 if (fs.existsSync(folderPath)) {
//                     fs.rm(folderPath, { recursive: true, force: true }, (err) => {
//                         if (err) {
//                           console.error('Error removing directory:', err);
//                         } else {
//                           console.log('Directory removed successfully');
//                         }
//                       });
//                 }
//             })

//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("An error occurred while processing the request");
//     }

// });

app.listen(3000, () => {
    console.log('server is running')
})

