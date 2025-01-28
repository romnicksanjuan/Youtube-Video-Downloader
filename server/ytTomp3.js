const outputFilePath = 'audio.mp3'

    const stream = ytdl(url, { filter: 'audioonly' });

    ffmpeg(stream)
        .audioBitrate(128) // Adjust bitrate as needed
        .save(outputFilePath)
        .on('end', () => {
            console.log('Audio file has been saved as:', outputFilePath);
        })
        .on('error', (err) => {
            console.error('Error occurred:', err);
        });