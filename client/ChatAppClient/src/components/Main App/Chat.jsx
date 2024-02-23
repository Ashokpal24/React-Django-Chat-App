import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  List,
  ListItemButton,
  Avatar,
} from "@mui/material";

import UserName from "../utils";

const Chat = () => {
  const [messages, setMessages] = useState([
    // { message: "Hello world", username: "User01" },
    // { message: "What is uppp", username: "User02" },
  ]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [ws, setWs] = useState(null);
  // const UserName = "User01"
  useEffect(() => {
    if (roomName) {
      const newWs = new WebSocket(`wss://5j85dm-8000.csb.app/ws/${roomName}/`);
      setWs(newWs);
      newWs.onopen = () => {
        console.log("Connected to WebSocket");
      };

      newWs.onmessage = (evt) => {
        const data = JSON.parse(evt.data);

        setMessages((prev) => {
          return [...prev, data];
        });
      };

      newWs.onclose = () => {
        console.log("Disconnected from WebSocket");
      };

      return () => {
        newWs.close();
      };
    }
  }, [roomName]);

  const createRoom = () => {
    setRoomName(input);
  };

  const sendMessage = () => {
    if (ws) {
      ws.send(JSON.stringify({ message: input, username: UserName }));
      setInput("");
    }
  };

  return (
    <Box
      sx={{
        width: "98vw",
        height: "95vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: "600px",
          height: "98vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "50%",
            overflowY: "scroll",
            marginBottom: "1.5rem",
          }}
        >
          {messages.map((data, index) => {
            const userTempName = data["username"];
            return (
              <ListItemButton
                sx={{ alignSelf: userTempName == UserName ? "start" : "end" }}
                key={index}
              >
                <Box
                  sx={{
                    width: "200px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "start",
                  }}
                >
                  <Avatar
                    sx={{
                      backgroundColor:
                        userTempName == UserName ? "green" : "rebeccapurple",
                      marginRight: "1.5rem",
                    }}
                  >
                    {userTempName.charAt(0) +
                      userTempName.charAt(userTempName.length - 1)}
                  </Avatar>
                  <Box>{data["message"]}</Box>
                </Box>
              </ListItemButton>
            );
          })}
        </List>
        <TextField
          sx={{
            width: "100%",
            marginBottom: "1.5rem",
          }}
          label="Chat"
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "end",
          }}
        >
          <Button
            sx={{ marginRight: "1.5rem" }}
            variant="contained"
            color="secondary"
            onClick={sendMessage}
          >
            Send
          </Button>
          <Button variant="outlined" onClick={createRoom}>
            Create Room
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
