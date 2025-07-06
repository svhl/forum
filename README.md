<h1 align="center">4M</h1>

<p align="center">
  <img src="https://github.com/user-attachments/assets/557248c9-2db8-4051-a7b0-8796e1763a03" width="400">
  <img src="https://github.com/user-attachments/assets/8646cd6e-9eb2-4205-8f9b-304fb37a0640" width="400">
</p>

<p align="center">A minimal text-based forum built using MERN stack</p>

## Features

✨ Near **real-time chats** with 5 sec polling time

✨ 1 min cooldown per post for **spam prevention**

✨ Message deletion and user bans for **moderation**

✨ Harmful post detection for **content filtering**

✨ Chat reset every 24 hrs for **storage optimization**

## Tech stack

![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%ffffff) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

## Live hosting

The frontend and Node.js are hosted on [Render](https://render.com/), and the database is hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).

The site can be viewed at [forum.zapto.org](https://forum.zapto.org).

## Self-hosting

### Prerequisites

[Node.js](https://nodejs.org/en/download) should be installed. MongoDB [Compass](https://www.mongodb.com/try/download/compass) or [Atlas](https://www.mongodb.com/cloud/atlas/register) is also required. Then, clone the repo and install the required modules.

```
git clone https://github.com/svhl/forum
cd forum
npm install
```

Add your `MONGODB_URI` and `PERSPECTIVE_API` to `.env`.

### Running

Start the backend with

```
node server.js
```

and the frontend with

```
cd src
npm run dev
```

The site can be viewed at [http://localhost:5173](http://localhost:5173).
