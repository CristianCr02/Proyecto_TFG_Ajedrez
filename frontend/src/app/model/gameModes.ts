const gameModes = [
    {
        name: 'Singleplayer',
        description: 'Play against the machine',
        type: 'singleplayer',
        timer: false
    },
    {
        name: 'Normal Game',
        description: 'Play against other player. Each player has 5 minutes',
        type: 'normalTwoPlayers',
        timer: true,
        time: 5
    },
    {
        name: 'Fast Game',
        description: 'Play against other player. Each player has 1 minute',
        type: 'fastTwoPlayers',
        timer: true,
        time: 1
    }
]