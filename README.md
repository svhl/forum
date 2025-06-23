# The 4M

A minimal text-based forum built using MERN stack

## Features

💬 Near **real-time chats** with 5 sec polling time

⌛ 1 min cooldown per post for **spam prevention**

🛠️ Message deletion and user bans for **moderation**

🕛 Chat reset every 24 hrs for **storage optimization**

## Tech stack

![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%ffffff) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

## Live hosting

## Self-hosting

### Prerequisites

[Node.js](https://nodejs.org/en/download) should be installed. MongoDB [Compass](https://www.mongodb.com/try/download/compass) or [Atlas](https://www.mongodb.com/cloud/atlas/register) is also required. Then, clone the repo and install the required modules.

```
git clone https://github.com/svhl/forum
cd forum
npm install
```

Add your `MONGODB_URI` to `.env`.

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
