const YoutubeLive = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen ">
            <h2 className="text-2xl font-bold text-white mb-5">
                Live Stream Auction Awarding
            </h2>
            <div className="flex justify-center">
                <iframe 
                    width="914" 
                    height="514" 
                    src="https://www.youtube.com/embed/YDvsBbKfLPA" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    )
}

export default YoutubeLive;