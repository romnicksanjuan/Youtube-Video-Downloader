const ytdl = require('ytdl-core');
const fs = require('fs')
const pathh = require('path')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
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


module.exports = { download, mergeVideoAudio }



