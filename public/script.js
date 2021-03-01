const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  /* host: "localhost",
  port: 9000, */
  host: "videochatopalo.herokuapp.com",
  port: 443,
});

let myVideoStream;

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
let clients = 0;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })

  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    if (clients >= 2) {
      console.log("somos muchos");
    }
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    document.addEventListener("keydown", (e) => {
      if (e.which === 13 && chatInputBox.value != "") {
        socket.emit("message", chatInputBox.value);
        chatInputBox.value = "";
      }
    });

    socket.on("createMessage", (msg) => {
      console.log(msg);
      let hora = new Date();

      let li = document.createElement("li");

      li.innerHTML = `<div class="row " id="clsborder">
      <div class="col-md-2" id="bordermsg">
        <p id="p-icon">
          <i class="fa fa-user-circle " id="icon-usuario"></i>
        </p>
      </div>
      <div class="col-md-10" id="text-msg">
        <div class="row" id="hora">${hora}</div>
        <div class="row  text-dark" id="msg">${msg}</div>
      </div>`;

      all_messages.append(li);

      main__chat__window.scrollTop = main__chat__window.scrollHeight;
    });
  });

peer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, streams) => {
  console.log("nuevo usuario");
  var call = peer.call(userId, streams);
  console.log(call);
  var video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    console.log(userVideoStream);
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (videoEl, stream) => {
  videoEl.srcObject = stream;
  videoEl.addEventListener("loadedmetadata", () => {
    videoEl.play();
  });

  videoGrid.append(videoEl);
  let totalUsers = document.getElementsByTagName("video").length;
  if (totalUsers > 3) {
    for (let index = 0; index < totalUsers; index++) {
      document.getElementsByTagName("video")[index].style.width =
        100 / totalUsers + "%";
    }
  }
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const html = `<i class=" btn_ico fa fa-pause-circle"></i>
  `;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {
  const html = `<i class=" btn_ico fa fa-video-camera"></i>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="btn_ico fa fa-microphone-slash"></i>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class=" btn_ico fa fa-microphone"></i>`;
  document.getElementById("muteButton").innerHTML = html;
};

/* COMPARTIR PANTALLA */

const videoElement = document.getElementById("videoscreen");
const start = document.getElementById("start");
const stop = document.getElementById("stop");

var displayMediaOptions = {
  video: {
    cursor: "always",
  },
  audio: false,
};

start.addEventListener(
  "click",
  function (e) {
    startCapture();
  },
  false
);
/* 
stop.addEventListener(
  "click",
  function (e) {
    stopCapture();
  },
  false
); */

async function startCapture() {
  try {
    videoElement.style.display = "block";
    videoElement.srcObject = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
  } catch (err) {
    console.error("Error" + err);
  }
}

function stopCapture(e) {
  let tracks = videoElement.srcObject.getTracks();

  tracks.forEach((track) => track.stop());
  videoElement.srcObject = null;
}

/* socket.emit('screen', {
  startCapture();
}) */

/* --------------PIZARRA-------------------- */

function pizarra() {
  let mouse = {
    click: false,
    move: false,
    pos: { x: 0, y: 0 },
    pos_prev: false,
  };

  // Canvas
  let canvas = document.getElementById("drawing");
  let context = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Set the canvas width and height to the browser size
  canvas.width = width;
  canvas.height = height;

  canvas.addEventListener("mousedown", (e) => {
    mouse.click = true;
  });

  canvas.addEventListener("mouseup", (e) => {
    mouse.click = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    mouse.pos.x = e.clientX / width;
    mouse.pos.y = e.clientY / height;
    mouse.move = true;
  });

  socket.on("draw_line", (data) => {
    let line = data.line;
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(line[0].x * width, line[0].y * height);
    context.lineTo(line[1].x * width, line[1].y * height);
    context.stroke();
  });

  function mainLoop() {
    if (mouse.click && mouse.move && mouse.pos_prev) {
      socket.emit("draw_line", { line: [mouse.pos, mouse.pos_prev] });
      mouse.move = false;
    }
    mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
    setTimeout(mainLoop, 25);
  }

  mainLoop();
}

function redireccionar() {
  window.location.href = "https://google.com";
}
