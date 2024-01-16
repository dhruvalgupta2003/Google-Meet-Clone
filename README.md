# Google Meet Clone

Welcome to the Google Meet Clone, a web application that replicates the functionalities of Google Meet. This project utilizes various technologies, including Socket.io, WebRTC, JavaScript, jQuery, and more, to provide a seamless and feature-rich video conferencing experience.

## Table of Contents
- [Getting Started](#getting-started)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
  - [Socket.io](#socketio)
  - [WebRTC](#webrtc)
  - [JavaScript and jQuery](#javascript-and-jquery)
  - [Group Audio and Video Streaming](#group-audio-and-video-streaming)
  - [Screen Sharing](#screen-sharing)
  - [Files Sharing](#files-sharing)
  - [Group Chat](#group-chat)
  - [Meeting Recording](#meeting-recording)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

Clone the repository to your local machine and follow the installation instructions to set up the project. Once installed, you can start using the Google Meet Clone for video conferencing.

## Dependencies

- Node.js
- Express.js
- Socket.io
- WebRTC
- JavaScript
- jQuery
- RecordRTC (for meeting recording)

## Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/google-meet-clone.git](https://github.com/dhruvalgupta2003/Google-Meet-Clone)
   ```

2. Change into the project directory:
   ```bash
   cd google-meet-clone
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   node server.js
   ```

2. Open your browser and navigate to `http://localhost:3000` to access the Google Meet Clone.

## Features

### Socket.io

Socket.io is used for real-time communication between clients and the server. It enables instant updates for various actions, such as user joining, leaving, or sending messages.

### WebRTC

WebRTC is utilized for peer-to-peer audio and video communication. It ensures low-latency and high-quality streaming directly between participants.

### JavaScript and jQuery

The project leverages JavaScript and jQuery for DOM manipulation, event handling, and seamless user interactions.

### Group Audio and Video Streaming

Participants can join group audio and video streams, allowing for interactive and collaborative meetings.

### Screen Sharing

Users can share their screens to showcase presentations or demonstrate software functionalities.

### Files Sharing

Participants can share files during the meeting, enhancing collaboration by exchanging documents, images, or other relevant materials.

### Group Chat

The application includes a group chat feature, allowing participants to communicate through text messages during the meeting.

### Meeting Recording

RecordRTC is integrated for meeting recording functionality. Users can record audio and video streams for future reference.

## Contributing

We welcome contributions! Feel free to fork the repository, make changes, and submit pull requests. Please adhere to the [code of conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the [MIT License](LICENSE.md).
