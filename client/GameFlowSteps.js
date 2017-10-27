const GameFlowSteps = [
    {
        id: 'plot',
        title: 'Plot Phase',
        windowType: 'phaseWindow',
        steps: [{
            id: 'plot-begin',
            title: 'Phase begins',
            windowType: 'frameworkWindow'
        }, {
            id: 'select-plot',
            title: 'Select plot',
            windowType: 'frameworkWindow'
        }, {
            id: 'revealing-plot',
            title: 'Reveal Plot',
            windowType: 'containerWindow',
            steps: [
                {
                    id: 'count-initiative',
                    title: 'Count initiative',
                    windowType: 'frameworkWindow'
                },{
                    id: 'first-player',
                    title: 'First player',
                    windowType: 'frameworkWindow'
                },{
                    id: 'when-revealed',
                    title: '"When revealed"',
                    windowType: 'frameworkWindow'
                }]
        }, {
            id: 'plot-actions',
            title: 'Actions',
            setting: 'plot',
            windowType: 'actionWindow'
        }, {
            id: 'plot-end',
            title: 'Phase ends',
            windowType: 'frameworkWindow'
        }
        ]
    },
    {
        id: 'draw',
        title: 'Draw Phase',        
        windowType: 'phaseWindow',
        steps: [{
            id: 'draw-begin',
            title: 'Phase begins',
            windowType: 'frameworkWindow'
        }, {
            id: 'draw-cards',
            title: 'Draw cards',
            windowType: 'frameworkWindow'
        }, {
            id: 'draw-actions',
            title: 'Actions',
            setting: 'draw',
            windowType: 'actionWindow'
        }, {
            id: 'draw-end',
            title: 'Phase ends',
            windowType: 'frameworkWindow'
        }
        ]
    },
    {
        id: 'marshal',
        title: 'Marshaling Phase',
        windowType: 'phaseWindow',
        steps: [{
            id: 'marshal-begin',
            title: 'Phase begins',
            windowType: 'frameworkWindow'
        }, {
            id: 'count-income',
            title: 'Count income',
            windowType: 'frameworkWindow'
        }, {
            id: 'marshal-actions',
            title: 'Marshal / Actions',
            windowType: 'actionWindow'
        }, {
            id: 'marshal-end',
            title: 'Phase ends',
            windowType: 'frameworkWindow'
        }
        ]
    },
    {
        id: 'challenge',
        title: 'Challenges Phase',
        windowType: 'phaseWindow',
        steps: [{
            id: 'challenge-begin',
            title: 'Phase begins',
            windowType: 'frameworkWindow'
        }, {
            id: 'challenge-before',
            title: 'Actions',
            setting: 'challengeBegin',
            windowType: 'actionWindow'
        }, {
            id: 'single-challenge',
            title: '#challengeType# Challenge',
            windowType: 'containerWindow',
            steps: [
                {
                    id: 'challenge-initiating',
                    title: 'Initiate challenge',
                    windowType: 'frameworkWindow'
                },
                {
                    id: 'challenge-attackers',
                    title: 'Actions',
                    setting: 'attackersDeclared',
                    windowType: 'actionWindow'
                },
                {
                    id: 'choosing-defenders',
                    title: 'Declare defenders',
                    windowType: 'frameworkWindow'
                },
                {
                    id: 'challenge-defenders',
                    title: 'Actions',
                    setting: 'defendersDeclared',
                    windowType: 'actionWindow'
                },
                {
                    id: 'challenge-determine-winner',
                    title: 'Determine winner',
                    windowType: 'frameworkWindow'
                },
                {
                    id: 'challenge-unopposed',
                    title: 'Unopposed bonus',
                    windowType: 'frameworkWindow'
                },
                {
                    id: 'challenge-claim',
                    title: 'Apply claim',
                    windowType: 'frameworkWindow'
                },
                {
                    id: 'challenge-keywords',
                    title: 'Apply keywords',
                    windowType: 'frameworkWindow'
                }]
        }, {
            id: 'challenge-end',
            title: 'Phase ends',
            windowType: 'frameworkWindow'
        }
        ]
    },
    {
        id: 'dominance',
        title: 'Dominance Phase',
        windowType: 'phaseWindow',
        steps: [{
            id: 'dominance-begin',
            title: 'Phase begins',
            windowType: 'frameworkWindow'
        }, {
            id: 'reward-dominance',
            title: 'Reward dominance',
            windowType: 'frameworkWindow'
        }, {
            id: 'dominance-actions',
            title: 'Actions',
            setting: 'dominance',
            windowType: 'actionWindow'
        }, {
            id: 'dominance-end',
            title: 'Phase ends',
            windowType: 'frameworkWindow'
        }
        ]
    },
    {
        id: 'standing',
        title: 'Standing Phase',
        windowType: 'phaseWindow',
        steps: [{
            id: 'standing-begin',
            title: 'Phase begins',
            windowType: 'frameworkWindow'
        }, {
            id: 'stand-cards',
            title: 'Stand cards',
            windowType: 'frameworkWindow'
        }, {
            id: 'standing-actions',
            title: 'Actions',
            setting: 'standing',
            windowType: 'actionWindow'
        }, {
            id: 'standing-end',
            title: 'Phase ends',
            windowType: 'frameworkWindow'
        }
        ]
    },
    {
        id: 'taxation',
        title: 'Taxation Phase',
        windowType: 'phaseWindow',
        steps: [{
            id: 'taxation-begin',
            title: 'Phase begins',
            windowType: 'frameworkWindow'
        }, {
            id: 'return-gold',
            title: 'Return gold',
            windowType: 'frameworkWindow'
        }, {
            id: 'check-reserve',
            title: 'Check reserve',
            windowType: 'frameworkWindow'
        }, {
            id: 'taxation-actions',
            title: 'Actions',
            setting: 'taxation',
            windowType: 'actionWindow'
        }, {
            id: 'taxation-end',
            title: 'Phase ends',
            windowType: 'frameworkWindow'
        }
        ]
    }
];

export default GameFlowSteps;
