const express = require('express');
const path = require('path');
const app = express();


const port = 3000;
const server = app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});

const io = require("socket.io")(server,{
    allowEIO3: true,
});
app.use(express.static(path.join(__dirname,"")));

var userconnections = [];
io.on("connection",(socket)=>{
    console.log("Socket id is ",socket.id);
    socket.on("userconnect", (data)=>{
        console.log("userconnect", data.displayName, data.meetingid);
        var other_users = userconnections.filter((p)=> p.meeting_id == data.meetingid) // filtering my meeting id 
        userconnections.push({
            connectionId: socket.id,
            user_id: data.displayName,
            meeting_id: data.meetingid,
        });
        var userCount = userconnections.length;
        console.log(userCount);
        other_users.forEach((v)=>{
            socket.to(v.connectionId).emit("inform_other_about_me",{
                other_user_id: data.displayName,
                connId: socket.id,
                useNumber: userCount,
            })
        })
        socket.emit("inform_me_about_other_user",other_users);
    });
    socket.on("SDPProcess", (data)=>{
        socket.to(data.to_connId).emit("SDPProcess",{
            message: data.message,
            from_connId: socket.id,
        })
    })
    socket.on("sendMessage", function(msg){
        console.log(msg);
        var mUser = userconnections.find((p)=>p.connectionId == socket.id);
        if(mUser){
            var meetingid = mUser.meeting_id;
            var from = mUser.user_id;
            var list = userconnections.filter((p)=> p.meeting_id == meetingid);
            list.forEach((v)=>{
                socket.to(v.connectionId).emit("showChatMessage",{
                    from : from,
                    message: msg,
                })
            })
        }
    });
    socket.on("disconnect", function(){
        console.log("User got Disconnected");
        var disUser = userconnections.find((p)=> p.connectionId == socket.id);
        if(disUser){
            var meetingid = disUser.meeting_id;
            userconnections = userconnections.filter((p)=>p.connectionId != socket.id);
            var list = userconnections.filter((p)=> p.meeting_id == meetingid);
            list.forEach((v) => {
                var userNumberAfUserLeave = userconnections.length;
                socket.to(v.connectionId).emit("inform_others_about_disconnected_user",{
                    connId: socket.id,
                    uNumber: userNumberAfUserLeave
                });
            });
        }
    });
});