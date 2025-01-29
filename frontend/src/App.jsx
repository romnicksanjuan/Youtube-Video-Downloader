import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [video, setVideo] = useState(null)
  const [query, setQuery] = useState('')
  const [url, setUrl] = useState('')

  const [selectedQuality, setSelectedQuality] = useState("135");
  console.log(selectedQuality)
  const videoRef = useRef()
  const getDownload = async () => {
    const response = await fetch(`https://youtube-video-downloader-kfy6.vercel.app?url=${query}`, {
      method: 'GET',
    })

    const data = await response.json()
    console.log(data.downloadUrl)
    setUrl(data.downloadUrl)
    setVideo(data)
  }


  const download = async () => {

    try {
      // Open the download link in a new tab
      const downloadUrl = `https://youtube-video-downloader-kfy6.vercel.app/download?url=${encodeURIComponent(url)}&quality=${selectedQuality}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "vovo.mp4");
      link.click();
    } catch (error) {
      console.error("Error downloading the video:", error);
      alert("Failed to download video. Please check the URL.");
    }

  }


  const demo = async () => {

    try {
      // Open the download link in a new tab
      const downloadUrl = `http://localhost:3000/download-video`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", "video.mp4");
      link.click();
    } catch (error) {
      console.error("Error downloading the video:", error);
      alert("Failed to download video. Please check the URL.");
    }

  }


  return (
    <>
      <div>
          <h2>Youtube Video Downloader</h2>
        {/* <video src="http://localhost:3000/videos/output_video.mp4" width={'100%'} controls></video>
        <h2>Download Video</h2> */}
        {/* <button onClick={() => getDownload()}>Download</button> */}
        {video &&
          <iframe src={video.url} frameBorder="0" style={{ width: '560', height: '350' }}></iframe>
        }


        {
          video &&
          <div>
            <select
              defaultValue={selectedQuality}
              id="select"
              onChange={(e) => setSelectedQuality(e.target.value)}
            >
              <option value="137">1080p</option>
              <option value="136">720p</option>
              <option value="135">480p</option>
            </select>
            <button onClick={() => download()}>Download</button>
          </div>

        }


        {!video && <div>
          <input type="text" onChange={(e) => setQuery(e.target.value)} />
          <button onClick={() => getDownload()}>Download</button>
        </div>}





        {/* <button onClick={() => demo()}>demo</button> */}






        {/* <h1>Video Player</h1>
        <video
          ref={videoRef}
          controls
          autoPlay
          width="100%"
          height="auto"
        >
          <source
            src="http://localhost:3000/download-video"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video> */}
      </div>
    </>
  )
}

export default App
