var AppProcess = (function(){
    var peers_connection_ids = [];
    var peers_connection = [];
    var remote_vid_stream = [];
    var remote_aud_stream = [];
    var serverProcess;
    var local_div = '';
    var audio;
    var isAudioMute = true;
    var rtp_aud_senders = [];
    var rtp_vid_senders = [];
    var video_states = {
        None: 0,
        Camera: 1,
        ScreenShare: 2
    }
    var video_st = video_states.None;
    var videoCamTrack;

    async function _init(SDP_function, my_connId){
        try {
            serverProcess = SDP_function;
            my_connection_id = my_connId;
            eventProcess();
            local_div = document.getElementById('localVideoPlayer');
            if (!local_div) {
                // console.error('Local video player element not found!');
                return;
            }
            // console.log("local::", local_div);
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }
    function eventProcess(){
        $("#micMuteUnmute").on("click", async function(){
            if(!audio){
                await loadAudio();
            }
            if(!audio){
                alert("Audio permission is not granted!");
                return;
            }
            if(isAudioMute){
                audio.enabled = true;
                $(this).html("<span class='material-icons'>mic</span>");
                updateMediaSenders(audio, rtp_aud_senders);
            }else{
                audio.enabled = false;
                $(this).html("<span class='material-icons'>mic_off</span>");
                removeMediaSenders(rtp_aud_senders);
            } 
            isAudioMute = !isAudioMute;  
        });
        $("#videoCamOnOff").on("click", async function(){
            if(video_st == video_states.Camera){
                await videoProcess(video_states.None);
            }else{
                await videoProcess(video_states.Camera);
            }
        });
        $("#ScreenShareOnOff").on("click", async function(){
            if(video_st == video_states.ScreenShare){
                await videoProcess(video_states.None);
            }else{
                await videoProcess(video_states.ScreenShare);
            }
        });
    }
    function connection_status(connection){
        if(connection && connection.connectionState == "new" || connection.connectionState == "connecting" || connection.connectionState == "connected"){
            return true;
        }else{
            return false;
        }
    }
    async function updateMediaSenders(track, rtp_senders){
        for(var conn_id in peers_connection_ids){
            if(connection_status(peers_connection[conn_id])){
                if(rtp_senders[conn_id] && rtp_senders[conn_id].track){
                    rtp_senders[conn_id].replaceTrack(track);
                }else{
                    rtp_senders[conn_id] = peers_connection[conn_id].addTrack(track);
                }

            }
        }
    }
    async function videoProcess(newVideoState){
        try {
            var vstream = null;
            if(newVideoState == video_states.Camera){
                vstream = await navigator.mediaDevices.getUserMedia({
                    video:{
                        width: 1920,
                        height: 1080
                    },
                    audio:false
                })
                // console.log(vstream);
            }else if(newVideoState == video_states.ScreenShare){
                vstream = await navigator.mediaDevices.getDisplayMedia({
                    video:{
                        width: 1920,
                        height: 1080
                    },
                    audio:false
                })
            }
            if(vstream && vstream.getVideoTracks().length > 0){
                videoCamTrack  = vstream.getVideoTracks()[0];
                if(videoCamTrack){
                    local_div.srcObject = new MediaStream([videoCamTrack]);
                    // alert("video cam found");
                }
            }
        } catch (e) {
            console.log(e);
            return;
        }
        video_st = newVideoState;
    }
    var iceConfiguration = {
        iceServers: [
            {
                urls:"stun:stun1.l.google.com:19302",
            },
            {
                urls:"stun:stun3.l.google.com:19302",
            },

        ]
    }
    async function setConnection(connId){
        var connection = new RTCPeerConnection(iceConfiguration);
        connection.onnegotiationneeded = async function(event){
            await setOffer(connId);
        }
        connection.onicecandidate = function(event){
            if(event.candidate){
                serverProcess(JSON.stringify({icecandidate: event.candidate}),connId);
            }
            
        };
        connection.ontrack = function(event){
            if(!remote_vid_stream[connId]){
                remote_vid_stream[connId] = new MediaStream();
            }
            if(!remote_aud_stream[connId]){
                remote_aud_stream[connId] = new MediaStream();
            }
            if(event.track.kind == "video"){
                remote_vid_stream[connId].getVideoTracks().forEach((t)=>remote_vid_stream[connId].removeTrack(t));
                remote_vid_stream[connId].addTrack(event.track);
                var remoteVideoPlayer = document.getElementById("v_"+connId);
                remoteVideoPlayer.srcObject = null;
                remoteVideoPlayer.srcObject = remote_vid_stream[connId];
                remoteVideoPlayer.load();
            }else if(event.track.kind == "audio"){
                remote_aud_stream[connId].getAudioTracks().forEach((t)=>remote_aud_stream[connId].removeTrack(t));
                remote_aud_stream[connId].addTrack(event.track);
                var remoteAudioPlayer = document.getElementById("a_"+connId);
                remoteAudioPlayer.srcObject = null;
                remoteAudioPlayer.srcObject = remote_aud_stream[connId];
                remoteAudioPlayer.load();
            }
        };
        peers_connection_ids[connId] = connId;
        peers_connection[connId] = connection;
        if(video_st == video_states.Camera || video_st == video_states.ScreenShare){
            if(videoCamTrack){
                updatedMediaSenders(videoCamTrack, rtp_vid_senders);
            }
        }
        return connection;
    }
    async function setOffer(connId){
        var connection = peers_connection[connId];
        var offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        serverProcess(JSON.stringify({
            offer:connection.localDescription,
        }), connId);
    }
    async function SDPProcess(message,from_connId){
        message = JSON.parse(message);
        if(message.answer){
            await peers_connection[from_connId].setRemoteDescription(new RTCSessionDescription(message.answer))
        }else if(message.offer){
            if(!peers_connection[from_connId]){
                await setConnection(from_connId)
            }
            await peers_connection[from_connId].setRemoteDescription(new RTCSessionDescription(message.offer))
            var answer = await peers_connection[from_connId].createAnswer();
            await peers_connection[from_connId].setLocalDescription(answer);
            serverProcess(JSON.stringify({
                answer:answer,
            }), from_connId);
        }else if(message.icecandidate){
            if(!peers_connection[from_connId]){
                await setConnection(from_connId);
            }
            try {
                await peers_connection[from_connId].addIceCandidate(message.icecandidate);
            } catch (e) {
                console.log(e);
            }
        }

    }
    return{
        setNewConnection : async function(connId){
            await setConnection(connId);
        },
        init: async function(SDP_function, my_connId){
            await _init(SDP_function, my_connId);
        },
        processClientFunc: async function(data, from_connId){
            await SDPProcess(data, from_connId);
        }
    };

})();

var MyApp = (function(){
    var user_id = "";
    var meeting_id = "";
    function init(uid, mid){
        user_id = uid;
        meeting_id = mid;
        $("#meetingContainer").show();
        $("#me h2").text(user_id + "(Me)");
        document.title = user_id;
        event_process_for_signaling_server();
    }
    var socket = null;
    function event_process_for_signaling_server(){
        socket = io.connect();
        var SDP_function = function(data, to_connId){
            socket.emit("SDPProcess", {
                message: data,
                to_connId: to_connId
            })
        }


        socket.on("connect", ()=>{
            if(socket.connected){
                AppProcess.init(SDP_function, socket.id)
                if(user_id != "" && meeting_id !=""){
                    socket.emit("userconnect", {
                        displayName: user_id,
                        meetingid: meeting_id,
                    })
                }
            }
        });

        socket.on("inform_others_about_me", function(data){
            addUser(data.other_user_id, data.connId);   
            AppProcess.setNewConnection(data.connId);
        });
        socket.on("inform_me_about_other_user", function(other_users){
            if(other_users){
                for(var i = 0 ;i<other_users.length; i++){
                    addUser(other_users[i].user_id,other_users[i].connectionId);
                    AppProcess.setNewConnection(other_users[i].connectionId);
                }
            }
        });
        socket.on("SDPProcess", async function(data){
            await AppProcess.processClientFunc(data.message, data.from_connId);
        })
    }
    function addUser(other_user_id, connId){
        var newDivId = $("#otherTemplate").clone();
        newDivId = newDivId.attr("id", connId).addClass("other");   
        newDivId.find("h2").text(other_user_id);
        newDivId.find("video").attr("id","v_"+connId);
        newDivId.find("audio").attr("id", "a_"+connId);
        newDivId.show();
        $("#divUsers").append(newDivId);
    }

    return{
        _init: function(uid,mid) {
            init(uid, mid);
        },
    };
})();