const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined,{
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true

// video streaming 
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo,stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream',userVideoStream => {
            addVideoStream(video,userVideoStream)
        })
    })

    socket.on('user-connected',userID => {
        connectToNewUser(userID,stream)
    })
} )

socket.on('user-disconnected',userID => {
    console.log(userID)
})

myPeer.on('open',id => {
    socket.emit('join-room',ROOM_ID,id)
})

function connectToNewUser(userID,stream){
    const call = myPeer.call(userID,stream)
    const video = document.createElement('video')
    call.on('stream',userStream => {    
        addVideoStream(video,userStream)
    })
    call.on('close',() => {
        video.remove()
    })
}


socket.emit('join-room', ROOM_ID, 10)

socket.on('user-connected',userId => {
    console.log("User connected: "+userId)
})

function addVideoStream(video,stream){
    video.srcObject = stream 
    video.addEventListener('loadedmetadata',() => {
        video.play()
    })
    videoGrid.append(video)
}