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
        other_users.forEach((v)=>{
            socket.to(v.connectionId).emit("inform_other_about_me",{
                other_user_id: data.displayName,
                connId: socket.id,
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
});