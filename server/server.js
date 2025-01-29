const express = require('express')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const pathh = require('path')

const tmp = require('tmp');
const { download, mergeVideoAudio } = require('./pota.js')

const cors = require('cors')

const app = express()
const fs = require('fs');
const ytdl = require("@distube/ytdl-core");


const local = 'http://localhost:5173'
const domain = 'https://youtube-video-downloader-phi-five.vercel.app'

app.use(cors({
    origin: domain,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use("/videos", express.static(pathh.join(__dirname, "videos")));
app.use(express.json())


app.get('/', (req, res) => {
    res.send('server is running')
})


app.get('/input-link', async (req, res) => {
    const { url } = req.query


    if (!url) {
        res.send('link is invalid')
        return;
    }


    try {
        const videoId = await ytdl.getURLVideoID(url)
        // const info = await ytdl.getInfo(url)
        // ytdl.getInfo(url)
        //     .then(info => {
        //         console.log(info);
        //     })
        //     .catch(err => {
        //         console.error('Error fetching video info:', err);
        //     });
       
        const data = {
            url: 'https://www.youtube.com/embed/' + videoId,
            downloadUrl: url
        }


        res.json(data)

    } catch (error) {
        console.log(error)
    }
})


app.get("/download", async (req, res) => {


    const date = Date.now()
    const folderPath = pathh.join(__dirname, `${date}-videos`);

    fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating video folder:', err);
            return;
        }
        console.log('Video folder created successfully');
    });


    const videoUrl = req.query.url;
    const quality = req.query.quality;

    console.log(req.query.quality)
    console.log(videoUrl)

    try {

        const d = await download(folderPath, videoUrl, quality);

        if (!d) {
            return res.status(500).send('Failed to download video');
        }


        const mergedVideo = await mergeVideoAudio(folderPath);

        if (!mergedVideo) {
            return res.status(500).send('Failed to merge video and audio');
        }


        const videoId = await ytdl.getURLVideoID(videoUrl);
        const info = await ytdl.getInfo(videoId);

        const videoTitle = info.videoDetails.title
        const title = videoTitle.replace(/[\/:*?"<>|]/g, '');
        const cleanTitle = videoTitle.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')

        const videoPath = pathh.join(folderPath, "output_video.mp4")

        console.log('VIDEO PATH:', videoPath)

        fs.access(videoPath, fs.constants.F_OK, (err) => {
            if (err) {

                return res.status(404).send('Video not found');
            }



            res.setHeader('Content-Type', `${cleanTitle}/mp4`);
            res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.mp4"`);


            const videoStream = fs.createReadStream(videoPath);
            videoStream.pipe(res);

            res.on('finish', () => {
                console.log('Video Downloaded Successfully')
                if (fs.existsSync(folderPath)) {
                    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
                        if (err) {
                            console.error('Error removing directory:', err);
                        } else {
                            console.log('Directory removed successfully');
                        }
                    });
                }
            })

        });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while processing the request" + error);
    }

});

app.listen(3000, () => {
    console.log('server is running')
})





