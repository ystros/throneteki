const GameFlowSteps = [
    {
        id: 'plot',
        title: 'Plot Phase',
        setting: 'plot'
    },
    {
        id: 'draw',
        title: 'Draw Phase',
        setting: 'draw'
    },
    {
        id: 'marshal',
        title: 'Marshaling Phase'
    },
    {
        id: 'challenge',
        title: 'Challenges Phase',
        steps: [
            {
                id: 'challenge-before',
                title: 'Before challenge',
                setting: 'challengeBegin'
            },
            {
                id: 'challenge-initiating',
                title: 'Initiating challenge'
            },
            {
                id: 'challenge-attackers',
                title: 'Attackers declared',
                setting: 'attackersDeclared'
            },
            {
                id: 'challenge-defenders',
                title: 'Defenders declared',
                setting: 'defendersDeclared'
            },
            {
                id: 'challenge-determine-winner',
                title: 'Determine winner'
            },
            {
                id: 'challenge-unopposed',
                title: 'Unopposed bonus'
            },
            {
                id: 'challenge-claim',
                title: 'Claim'
            },
            {
                id: 'challenge-keywords',
                title: 'Keywords'
            }
        ]
    },
    {
        id: 'dominance',
        title: 'Dominance Phase',
        setting: 'dominance'
    },
    {
        id: 'standing',
        title: 'Standing Phase',
        setting: 'standing'
    },
    {
        id: 'taxation',
        title: 'Taxation Phase',
        setting: 'taxation'
    }
];

export default GameFlowSteps;
