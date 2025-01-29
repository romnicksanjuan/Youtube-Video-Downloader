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
// TypeScript: import ytdl from 'ytdl-core'; with --esModuleInterop
// TypeScript: import * as ytdl from 'ytdl-core'; with --allowSyntheticDefaultImports
// TypeScript: import ytdl = require('ytdl-core'); with neither of the above
app.use(cors({
    origin: 'https://youtube-video-downloader-phi-five.vercel.app',
    methods: ['GET', 'POST'],     // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}))
app.use("/videos", express.static(pathh.join(__dirname, "videos")));
app.use(express.json())


app.get('/', async (req, res) => {

    const { url } = req.query

    // const url = 'https://youtu.be/t_It_LkwepA?si=KIFZA1p7XNBeXM0c';
    try {
        const videoId = await ytdl.getURLVideoID(url)
        const info = await ytdl.getInfo(url)
        // console.log(videoId)
        // console.log(info.formats)


        const data = {
            url: 'https://www.youtube.com/embed/' + videoId,
            downloadUrl: url
        }


        res.json(data)

    } catch (error) {
        console.log(error)
    }
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


const download = async (folderPath, url, quality) => {
  
    const videoId = await ytdl.getURLVideoID(url)
    const info = await ytdl.getInfo(videoId)
    const format = ytdl.chooseFormat(info.formats, { quality: quality })

    return new Promise(async (resolve, reject) => {

        // download video
        if (format) {
            console.log(`Downloading video in format: ${format.itag}`);
            ytdl(url, { format })
                .pipe(fs.createWriteStream(`${folderPath}/video.mp4`))
                .on('finish', () => console.log('Download complete.'));
        } else {
            console.error('No suitable format found!');
        }




        // download audio
        const outputFilePath = 'audio.mp3'

        const stream = ytdl(url, { filter: 'audioonly' });

        ffmpeg(stream)
            .audioBitrate(128)
            .save(`${folderPath}/audio.mp3`)
            .on('end', () => {
                console.log('Audio file has been saved as:', outputFilePath);
                resolve(true)
            })
            .on('error', (err) => {
                console.error('Error occurred:', err);
                reject(err)
            });
    })
}





const mergeVideoAudio = (folderPath) => {

    const videoFile = pathh.resolve(`${folderPath}/video.mp4`);
    const audioFile = pathh.resolve(`${folderPath}/audio.mp3`);
    const outputPath = `${folderPath}/output_video.mp4`;

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(videoFile) // Input video
            .input(audioFile) // Input audio
            .videoCodec('copy') // Copy the video codec (no re-encoding)
            .audioCodec('aac') // Encode audio to AAC
            .outputOptions('-shortest') // Trim the output to the shortest input duration
            .save(outputPath) // Save the output file
            .on('start', (commandLine) => {
                console.log('FFmpeg command:', commandLine);
            })
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`Processing: ${progress.percent.toFixed(2)}% done`);
                } else {
                    console.log('Processing...');
                }
            })
            .on('end', () => {
                console.log('Merging completed successfully. Output file:', outputPath);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('An error occurred during merging:', err.message);
                reject(err);
            });
    })
}


function removeInvalidCharactersAndEmojis(inputString) {
    // Regular expression to match valid characters (letters, numbers, spaces, punctuation, etc.)
    // Adjust regex as needed for your specific valid characters.
    const validCharRegex = /[^\p{L}\p{N}\p{P}\p{Z}]/gu;

    // Replace invalid characters and emojis with an empty string.
    return inputString.replace(validCharRegex, '');
}

// const exampleString = "Hello 😊! This is a string with emojis 🤩 and invalid characters 🚫.";

// const sanitizedString = removeInvalidCharactersAndEmojis(exampleString);
// console.log(sanitizedString);